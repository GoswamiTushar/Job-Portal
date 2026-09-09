import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import CandidateProfile from '../../../models/CandidateProfile';
import RecruiterProfile from '../../../models/RecruiterProfile';
import { hashPassword, signToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectToDatabase();

        const {
            email,
            name,
            password,
            skills,
            userRole,
            headline,
            experienceLevel,
            workplacePreference,
            phone,
            companyName,
            companyWebsite,
            designation,
            recruiterType,
        } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required fields.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists.',
            });
        }

        const hashedPassword = await hashPassword(password);

        // Parse skills into array
        let parsedSkills: string[] = [];
        if (Array.isArray(skills)) {
            parsedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
        } else if (typeof skills === 'string') {
            parsedSkills = skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }

        const role = userRole === 0 ? 0 : 1; // 0 = Recruiter, 1 = Candidate

        // 1. Create core authentication user
        const newUser = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            name: name.trim(),
            userRole: role,
            authProvider: 'local',
        });

        // 2. Initialize modular profile model based on userRole
        if (role === 0) {
            await RecruiterProfile.create({
                userId: newUser._id,
                companyName: companyName ? String(companyName).trim() : '',
                companyWebsite: companyWebsite ? String(companyWebsite).trim() : '',
                designation: designation ? String(designation).trim() : '',
                recruiterType: (recruiterType === 'agency' || recruiterType === 'independent' ? recruiterType : 'corporate') as 'corporate' | 'agency' | 'independent',
                isIndependent: recruiterType === 'independent',
                isVerified: false,
            });
        } else {
            await CandidateProfile.create({
                userId: newUser._id,
                phone: phone ? String(phone).trim() : '',
                headline: headline ? String(headline).trim() : '',
                skills: parsedSkills,
                experienceLevel: experienceLevel ? String(experienceLevel).trim() : 'Mid-Level',
                workplacePreference: workplacePreference ? String(workplacePreference).trim() : 'Remote',
                links: {
                    linkedin: '',
                    github: '',
                    portfolio: '',
                    twitter: '',
                },
            });
        }

        const token = signToken({
            id: newUser._id.toString(),
            email: newUser.email,
            userRole: newUser.userRole,
            name: newUser.name,
        });

        // Set secure HttpOnly cookie
        setAuthCookie(res, token);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                userRole: newUser.userRole,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration.',
        });
    }
}
