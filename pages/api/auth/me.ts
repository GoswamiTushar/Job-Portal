import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import CandidateProfile from '../../../models/CandidateProfile';
import RecruiterProfile from '../../../models/RecruiterProfile';
import { authenticateRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        const decoded = authenticateRequest(req);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        await connectToDatabase();
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found',
            });
        }

        let skills: string[] = [];
        let headline = '';
        let company: any = undefined;

        if (user.userRole === 0) {
            const recruiterProfile = await RecruiterProfile.findOne({ userId: user._id });
            if (recruiterProfile) {
                company = {
                    name: recruiterProfile.companyName || '',
                    website: recruiterProfile.companyWebsite || '',
                    designation: recruiterProfile.designation || '',
                    recruiterType: recruiterProfile.recruiterType || 'corporate',
                    isIndependent: recruiterProfile.isIndependent || false,
                    isVerified: recruiterProfile.isVerified || false,
                };
            }
        } else {
            const candidateProfile = await CandidateProfile.findOne({ userId: user._id });
            if (candidateProfile) {
                skills = candidateProfile.skills || [];
                headline = candidateProfile.headline || '';
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                userRole: user.userRole,
                avatar: user.avatar || '',
                skills,
                headline,
                company,
            },
        });
    } catch (error: any) {
        console.error('Session check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying session.',
        });
    }
}

