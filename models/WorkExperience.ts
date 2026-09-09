import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkExperience extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WorkExperienceSchema: Schema<IWorkExperience> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required for work experience'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        startDate: {
            type: String,
            default: '',
            trim: true,
        },
        endDate: {
            type: String,
            default: '',
            trim: true,
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const WorkExperience: Model<IWorkExperience> =
    mongoose.models.WorkExperience ||
    mongoose.model<IWorkExperience>('WorkExperience', WorkExperienceSchema);

export default WorkExperience;
