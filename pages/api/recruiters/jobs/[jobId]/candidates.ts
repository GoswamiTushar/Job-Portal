import type { NextApiResponse } from 'next';
import connectToDatabase from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';
import User from '../../../../../models/User';
import CandidateProfile from '../../../../../models/CandidateProfile';
import Job from '../../../../../models/Job';
import { authenticateRequest, AuthenticatedNextApiRequest } from '../../../../../lib/auth';

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        const user = authenticateRequest(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        const { jobId } = req.query;
        if (!jobId || typeof jobId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Job ID parameter is required.',
            });
        }

        await connectToDatabase();

        // Optional verify that the job belongs to this recruiter
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found.',
            });
        }

        const applications = await Application.find({ jobId })
            .populate('candidateId', 'name email avatar')
            .sort({ appliedAt: -1 })
            .lean();

        const validApplications = applications.filter((app: any) => app.candidateId !== null);
        const candidateUserIds = validApplications.map((app: any) => app.candidateId._id);

        const candidateProfiles = await CandidateProfile.find({ userId: { $in: candidateUserIds } }).lean();
        const profileMap = new Map(candidateProfiles.map((p: any) => [p.userId.toString(), p]));

        const candidates = validApplications.map((app: any) => {
            const candidate = app.candidateId;
            const profile = profileMap.get(candidate._id.toString());
            const skillsList = profile?.skills || [];
            const skillsStr = Array.isArray(skillsList) ? skillsList.join(', ') : '';

            return {
                id: candidate._id.toString(),
                name: candidate.name || 'Anonymous Candidate',
                email: candidate.email,
                avatar: candidate.avatar || '',
                headline: profile?.headline || '',
                skills: skillsStr,
                appliedAt: app.appliedAt,
            };
        });

        return res.status(200).json({
            success: true,
            data: candidates,
        });
    } catch (error: any) {
        console.error('Error fetching candidates:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error retrieving candidates.',
        });
    }
}
