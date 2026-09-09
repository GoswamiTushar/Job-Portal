import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IApplication extends Document {
    _id: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    resumeUrl?: string;
    coverLetter?: string;
    status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
    appliedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema<IApplication> = new Schema(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
            index: true,
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        resumeUrl: {
            type: String,
            default: '',
        },
        coverLetter: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'],
            default: 'applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent a candidate from applying to the same job multiple times
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application: Model<IApplication> =
    mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
