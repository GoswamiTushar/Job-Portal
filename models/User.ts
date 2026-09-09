import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password?: string;
    name: string;
    userRole: number; // 0 = Recruiter, 1 = Candidate
    authProvider: 'local' | 'google' | 'linkedin';
    providerId?: string;
    avatar?: string;
    emailVerified?: boolean;
    googleProfile?: {
        sub?: string;
        hd?: string;
        locale?: string;
    };
    linkedInProfile?: {
        sub?: string;
        name?: string;
        picture?: string;
        locale?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            select: false, // Do not expose password by default
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        userRole: {
            type: Number,
            enum: [0, 1], // 0 = Recruiter, 1 = Candidate
            default: 1,
            index: true,
        },
        authProvider: {
            type: String,
            enum: ['local', 'google', 'linkedin'],
            default: 'local',
        },
        providerId: {
            type: String,
            index: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        googleProfile: {
            sub: { type: String, default: '' },
            hd: { type: String, default: '' },
            locale: { type: String, default: '' },
        },
        linkedInProfile: {
            sub: { type: String, default: '' },
            name: { type: String, default: '' },
            picture: { type: String, default: '' },
            locale: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model overwrite in development hot-reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
