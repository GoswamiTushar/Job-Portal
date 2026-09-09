import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICandidateProfile extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    phone?: string;
    location?: string;
    headline?: string;
    bio?: string;
    skills: string[];
    experienceLevel?: string;
    experienceYears?: string;
    noticePeriod?: string;
    expectedSalary?: string;
    workplacePreference?: string;
    links: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
        twitter?: string;
    };
    resume?: {
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        uploadedAt?: Date;
        rawTextPreview?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CandidateProfileSchema: Schema<ICandidateProfile> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required for candidate profile'],
            unique: true,
            index: true,
        },
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        location: {
            type: String,
            default: '',
            trim: true,
        },
        headline: {
            type: String,
            default: '',
            trim: true,
        },
        bio: {
            type: String,
            default: '',
            trim: true,
        },
        skills: {
            type: [String],
            default: [],
            index: true,
        },
        experienceLevel: {
            type: String,
            default: 'Mid-Level',
            trim: true,
        },
        experienceYears: {
            type: String,
            default: '',
            trim: true,
        },
        noticePeriod: {
            type: String,
            default: '30 Days',
            trim: true,
        },
        expectedSalary: {
            type: String,
            default: '',
            trim: true,
        },
        workplacePreference: {
            type: String,
            enum: ['Remote', 'Hybrid', 'On-site', ''],
            default: 'Remote',
        },
        links: {
            linkedin: { type: String, default: '', trim: true },
            github: { type: String, default: '', trim: true },
            portfolio: { type: String, default: '', trim: true },
            twitter: { type: String, default: '', trim: true },
        },
        resume: {
            fileName: { type: String, default: '' },
            fileSize: { type: Number, default: 0 },
            fileType: { type: String, default: '' },
            uploadedAt: { type: Date, default: null },
            rawTextPreview: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

const CandidateProfile: Model<ICandidateProfile> =
    mongoose.models.CandidateProfile ||
    mongoose.model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);

export default CandidateProfile;
