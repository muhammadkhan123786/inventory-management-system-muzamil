import { Schema, model, Document } from 'mongoose';

export interface IContact extends Document {
    mobileNumber: string;       // optional
    phoneNumber?: string;        // optional
    companyWebsite?: string;
    emailId?: string;             // required
    isActive: boolean;
    isDeleted: boolean;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const contactSchema = new Schema<IContact>(
    {
        mobileNumber: { type: String, required: true }, // optional
        phoneNumber: { type: String, default: null },  // optional
        companyWebsite: { type: String, default: null },
        emailId: { type: String }, // make required
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isDefault: { type: Boolean, default: false }
    },
    { timestamps: true } // adds createdAt & updatedAt
);

export const Contact = model<IContact>('Contact', contactSchema);
