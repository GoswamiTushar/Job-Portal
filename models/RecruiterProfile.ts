import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRecruiterProfile extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    companyName?: string;
    companyWebsite?: string;
    designation?: string;
    recruiterType?: 'corporate' | 'agency' | 'independent';
    isIndependent?: boolean;
    isVerified?: boolean;
    industry?: string;
    companySize?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RecruiterProfileSchema: Schema<IRecruiterProfile> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required for recruiter profile'],
            unique: true,
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
            trim: true,
        },
        designation: {
            type: String,
            default: '',
            trim: true,
        },
        recruiterType: {
            type: String,
            enum: ['corporate', 'agency', 'independent'],
            default: 'corporate',
        },
        isIndependent: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        industry: {
            type: String,
            default: '',
            trim: true,
        },
        companySize: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const RecruiterProfile: Model<IRecruiterProfile> =
    mongoose.models.RecruiterProfile ||
    mongoose.model<IRecruiterProfile>('RecruiterProfile', RecruiterProfileSchema);

export default RecruiterProfile;
