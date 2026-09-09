import type { NextApiResponse } from 'next';
import connectToDatabase from '../../../../lib/mongodb';
import Application from '../../../../models/Application';
import '../../../../models/Job'; // Ensure Job model is registered for populate
import { authenticateRequest, AuthenticatedNextApiRequest } from '../../../../lib/auth';

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

        await connectToDatabase();

        const applications = await Application.find({ candidateId: user.id })
            .populate('jobId')
            .sort({ appliedAt: -1 })
            .lean();

        const appliedJobs = applications
            .filter((app: any) => app.jobId !== null)
            .map((app: any) => ({
                id: app.jobId._id.toString(),
                title: app.jobId.title,
                description: app.jobId.description,
                location: app.jobId.location,
                companyName: app.jobId.companyName,
                appliedAt: app.appliedAt,
                applicationStatus: app.status,
            }));

        return res.status(200).json({
            success: true,
            data: appliedJobs,
        });
    } catch (error: any) {
        console.error('Error fetching applied jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error retrieving applied jobs.',
        });
    }
}
