import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import CandidateProfile from '../../../models/CandidateProfile';
import WorkExperience from '../../../models/WorkExperience';
import Education from '../../../models/Education';
import { authenticateRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const decoded = authenticateRequest(req);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    await connectToDatabase();

    // GET /api/candidates/profile
    if (req.method === 'GET') {
        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Retrieve or initialize candidate profile
            let candidateProfile = await CandidateProfile.findOne({ userId: decoded.id });
            if (!candidateProfile) {
                candidateProfile = await CandidateProfile.create({
                    userId: decoded.id,
                    skills: [],
                    links: { linkedin: '', github: '', portfolio: '', twitter: '' },
                });
            }

            // Retrieve employment and academic records from their respective models
            const workExperience = await WorkExperience.find({ userId: decoded.id }).sort({ createdAt: 1 });
            const education = await Education.find({ userId: decoded.id }).sort({ createdAt: 1 });

            return res.status(200).json({
                success: true,
                profile: {
                    id: user._id.toString(),
                    name: user.name || '',
                    email: user.email || '',
                    avatar: user.avatar || '',
                    userRole: user.userRole,
                    phone: candidateProfile.phone || '',
                    location: candidateProfile.location || '',
                    headline: candidateProfile.headline || '',
                    bio: candidateProfile.bio || '',
                    skills: candidateProfile.skills || [],
                    experienceLevel: candidateProfile.experienceLevel || 'Mid-Level',
                    experienceYears: candidateProfile.experienceYears || '',
                    noticePeriod: candidateProfile.noticePeriod || '30 Days',
                    expectedSalary: candidateProfile.expectedSalary || '',
                    workplacePreference: candidateProfile.workplacePreference || 'Remote',
                    links: candidateProfile.links || { linkedin: '', github: '', portfolio: '', twitter: '' },
                    resume: candidateProfile.resume || null,
                    workExperience: workExperience.map((exp) => ({
                        id: exp._id.toString(),
                        title: exp.title,
                        company: exp.company,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        isCurrent: exp.isCurrent,
                        description: exp.description,
                    })),
                    education: education.map((edu) => ({
                        id: edu._id.toString(),
                        degree: edu.degree,
                        institution: edu.institution,
                        fieldOfStudy: edu.fieldOfStudy,
                        startYear: edu.startYear,
                        endYear: edu.endYear,
                    })),
                },
            });
        } catch (err: any) {
            console.error('Fetch candidate profile error:', err);
            return res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
        }
    }

    // PUT /api/candidates/profile
    if (req.method === 'PUT') {
        try {
            const body = req.body;

            // 1. Update core User model (name, avatar)
            const userUpdates: Record<string, any> = {};
            if (body.name) userUpdates.name = body.name.trim();
            if (body.avatar !== undefined) userUpdates.avatar = body.avatar;

            if (Object.keys(userUpdates).length > 0) {
                await User.findByIdAndUpdate(decoded.id, { $set: userUpdates });
            }

            // 2. Upsert CandidateProfile model
            const profileFields: Record<string, any> = {
                phone: body.phone,
                location: body.location,
                headline: body.headline,
                bio: body.bio,
                skills: Array.isArray(body.skills) ? body.skills : [],
                experienceLevel: body.experienceLevel,
                experienceYears: body.experienceYears,
                noticePeriod: body.noticePeriod,
                expectedSalary: body.expectedSalary,
                workplacePreference: body.workplacePreference,
                links: body.links || {},
                resume: body.resume,
            };

            const candidateProfile = await CandidateProfile.findOneAndUpdate(
                { userId: decoded.id },
                { $set: profileFields },
                { new: true, upsert: true, runValidators: true }
            );

            // 3. Sync WorkExperience model
            if (Array.isArray(body.workExperience)) {
                // Clear existing records and re-insert updated list
                await WorkExperience.deleteMany({ userId: decoded.id });
                if (body.workExperience.length > 0) {
                    const expDocs = body.workExperience
                        .filter((exp: any) => exp.title && exp.company)
                        .map((exp: any) => ({
                            userId: decoded.id,
                            title: exp.title.trim(),
                            company: exp.company.trim(),
                            startDate: exp.startDate || '',
                            endDate: exp.endDate || '',
                            isCurrent: Boolean(exp.isCurrent),
                            description: exp.description || '',
                        }));
                    if (expDocs.length > 0) {
                        await WorkExperience.insertMany(expDocs);
                    }
                }
            }

            // 4. Sync Education model
            if (Array.isArray(body.education)) {
                await Education.deleteMany({ userId: decoded.id });
                if (body.education.length > 0) {
                    const eduDocs = body.education
                        .filter((edu: any) => edu.degree && edu.institution)
                        .map((edu: any) => ({
                            userId: decoded.id,
                            degree: edu.degree.trim(),
                            institution: edu.institution.trim(),
                            fieldOfStudy: edu.fieldOfStudy || '',
                            startYear: edu.startYear || '',
                            endYear: edu.endYear || '',
                        }));
                    if (eduDocs.length > 0) {
                        await Education.insertMany(eduDocs);
                    }
                }
            }

            // Retrieve updated records for clean return
            const updatedUser = await User.findById(decoded.id);
            const workExperience = await WorkExperience.find({ userId: decoded.id }).sort({ createdAt: 1 });
            const education = await Education.find({ userId: decoded.id }).sort({ createdAt: 1 });

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                profile: {
                    id: decoded.id,
                    name: updatedUser?.name || '',
                    email: updatedUser?.email || '',
                    avatar: updatedUser?.avatar || '',
                    userRole: updatedUser?.userRole,
                    phone: candidateProfile.phone || '',
                    location: candidateProfile.location || '',
                    headline: candidateProfile.headline || '',
                    bio: candidateProfile.bio || '',
                    skills: candidateProfile.skills || [],
                    experienceLevel: candidateProfile.experienceLevel || '',
                    experienceYears: candidateProfile.experienceYears || '',
                    noticePeriod: candidateProfile.noticePeriod || '',
                    expectedSalary: candidateProfile.expectedSalary || '',
                    workplacePreference: candidateProfile.workplacePreference || '',
                    links: candidateProfile.links || {},
                    resume: candidateProfile.resume || null,
                    workExperience: workExperience.map((exp) => ({
                        id: exp._id.toString(),
                        title: exp.title,
                        company: exp.company,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        isCurrent: exp.isCurrent,
                        description: exp.description,
                    })),
                    education: education.map((edu) => ({
                        id: edu._id.toString(),
                        degree: edu.degree,
                        institution: edu.institution,
                        fieldOfStudy: edu.fieldOfStudy,
                        startYear: edu.startYear,
                        endYear: edu.endYear,
                    })),
                },
            });
        } catch (err: any) {
            console.error('Update candidate profile error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update profile: ' + (err.message || '') });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
