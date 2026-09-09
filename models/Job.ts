import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJob extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    location: string;
    jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    workplaceType: 'Remote' | 'Hybrid' | 'On-site';
    salaryMin?: number;
    salaryMax?: number;
    currency: string;
    skillsRequired: string[];
    postedBy: mongoose.Types.ObjectId;
    companyName: string;
    companyWebsite?: string;
    companyLogo?: string;
    source: 'direct' | 'greenhouse' | 'lever' | 'ashby' | 'scraped';
    sourceUrl?: string;
    status: 'active' | 'closed' | 'draft';
    applicationsCount: number;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Job location is required'],
            trim: true,
            index: true,
        },
        jobType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
            default: 'Full-time',
        },
        workplaceType: {
            type: String,
            enum: ['Remote', 'Hybrid', 'On-site'],
            default: 'Remote',
        },
        salaryMin: {
            type: Number,
        },
        salaryMax: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        skillsRequired: {
            type: [String],
            default: [],
            index: true,
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        companyName: {
            type: String,
            default: '',
            trim: true,
        },
        companyWebsite: {
            type: String,
            default: '',
        },
        companyLogo: {
            type: String,
            default: '',
        },
        source: {
            type: String,
            enum: ['direct', 'greenhouse', 'lever', 'ashby', 'scraped'],
            default: 'direct',
        },
        sourceUrl: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'closed', 'draft'],
            default: 'active',
            index: true,
        },
        applicationsCount: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            // Defaults to 30 days from creation for active hiring assurance
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (_doc, ret: Record<string, any>) {
                ret.id = ret._id.toString();
                return ret;
            },
        },
    }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
