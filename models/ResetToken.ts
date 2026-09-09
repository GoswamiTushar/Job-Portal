import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResetToken extends Document {
    _id: mongoose.Types.ObjectId;
    token: string;
    email: string;
    expiresAt: Date;
    createdAt: Date;
}

const ResetTokenSchema: Schema<IResetToken> = new Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Automatically removed by MongoDB after expiry
        },
    },
    {
        timestamps: true,
    }
);

const ResetToken: Model<IResetToken> =
    mongoose.models.ResetToken || mongoose.model<IResetToken>('ResetToken', ResetTokenSchema);

export default ResetToken;
