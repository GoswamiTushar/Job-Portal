import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEducation extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startYear?: string;
    endYear?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EducationSchema: Schema<IEducation> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required for education record'],
            index: true,
        },
        degree: {
            type: String,
            required: [true, 'Degree / qualification is required'],
            trim: true,
        },
        institution: {
            type: String,
            required: [true, 'Institution / university is required'],
            trim: true,
        },
        fieldOfStudy: {
            type: String,
            default: '',
            trim: true,
        },
        startYear: {
            type: String,
            default: '',
            trim: true,
        },
        endYear: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Education: Model<IEducation> =
    mongoose.models.Education ||
    mongoose.model<IEducation>('Education', EducationSchema);

export default Education;
