import type { NextApiResponse } from 'next';
import connectToDatabase from '../../../../lib/mongodb';
import Job from '../../../../models/Job';
import Application from '../../../../models/Application';
import { authenticateRequest, AuthenticatedNextApiRequest } from '../../../../lib/auth';

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
    await connectToDatabase();

    // GET /api/candidates/jobs?page=1 -> List available jobs
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 20;
            const skip = (page - 1) * limit;

            const filter = { status: 'active' as const };

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
                companyName: job.companyName,
                createdAt: job.createdAt,
            }));

            return res.status(200).json({
                success: true,
                data: formattedJobs,
                metadata: {
                    count: totalCount,
                },
            });
        } catch (error: any) {
            console.error('Error fetching jobs:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error retrieving jobs.',
            });
        }
    }

    // POST /api/candidates/jobs -> Apply for a job
    if (req.method === 'POST') {
        try {
            const user = authenticateRequest(req);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required to apply for jobs.',
                });
            }

            const { jobId } = req.body;
            if (!jobId) {
                return res.status(400).json({
                    success: false,
                    message: 'jobId is required.',
                });
            }

            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job posting not found.',
                });
            }

            // Check duplicate application
            const existingApplication = await Application.findOne({
                jobId: job._id,
                candidateId: user.id,
            });

            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already applied to this job.',
                });
            }

            await Application.create({
                jobId: job._id,
                candidateId: user.id,
                status: 'applied',
            });

            await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

            return res.status(200).json({
                success: true,
                message: 'Applied successfully',
            });
        } catch (error: any) {
            console.error('Error applying for job:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Server error submitting application.',
            });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
