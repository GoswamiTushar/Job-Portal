import type { NextApiResponse } from 'next';
import connectToDatabase from '../../../../lib/mongodb';
import Job from '../../../../models/Job';
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

        const page = parseInt(req.query.page as string) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const filter = { postedBy: user.id };

        const [jobs, totalCount] = await Promise.all([
            Job.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Job.countDocuments(filter),
        ]);

        const formattedJobs = jobs.map((job: any) => ({
            id: job._id.toString(),
            title: job.title,
            description: job.description,
            location: job.location,
            applicationsCount: job.applicationsCount || 0,
            createdAt: job.createdAt,
        }));

        // Matched exactly to frontend: res?.data?.data and res?.data?.metadata?.count
        return res.status(200).json({
            success: true,
            data: {
                data: formattedJobs,
                metadata: {
                    count: totalCount,
                },
            },
        });
    } catch (error: any) {
        console.error('Error fetching recruiter jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error retrieving recruiter jobs.',
        });
    }
}
