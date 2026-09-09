import type { NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Job from '../../../models/Job';
import User from '../../../models/User';
import RecruiterProfile from '../../../models/RecruiterProfile';
import { authenticateRequest, AuthenticatedNextApiRequest } from '../../../lib/auth';

export default async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        const user = authenticateRequest(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to post a job.',
            });
        }

        await connectToDatabase();

        const { title, description, location, jobType, workplaceType, salaryMin, salaryMax, currency, skillsRequired } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and location are required fields.',
            });
        }

        // Fetch recruiter info and recruiter profile for company details
        const recruiter = await User.findById(user.id);
        const recruiterProfile = await RecruiterProfile.findOne({ userId: user.id });

        const newJob = await Job.create({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            jobType: jobType || 'Full-time',
            workplaceType: workplaceType || 'Remote',
            salaryMin: salaryMin ? Number(salaryMin) : undefined,
            salaryMax: salaryMax ? Number(salaryMax) : undefined,
            currency: currency || 'USD',
            skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
            postedBy: user.id,
            companyName: recruiterProfile?.companyName || recruiter?.name || '',
            companyWebsite: recruiterProfile?.companyWebsite || '',
            status: 'active',
        });

        return res.status(201).json({
            success: true,
            message: 'Job posted successfully.',
            data: {
                id: newJob._id.toString(),
                title: newJob.title,
                description: newJob.description,
                location: newJob.location,
                companyName: newJob.companyName,
                createdAt: newJob.createdAt,
            },
        });
    } catch (error: any) {
        console.error('Error posting job:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error creating job posting.',
        });
    }
}
