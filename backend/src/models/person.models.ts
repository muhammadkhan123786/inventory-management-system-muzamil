import { Schema, model, Document } from 'mongoose';

export interface IPerson extends Document {
    firstName: string;
    middleName?: string;
    lastName?: string;
    isActive: boolean;
    isDeleted: boolean;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


const personSchema = new Schema<IPerson>(
    {
        firstName: { type: String, required: true },
        middleName: { type: String },
        lastName: { type: String },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isDefault: { type: Boolean, default: false }
    },
    { timestamps: true } // ✅ adds createdAt & updatedAt
);

export const Person = model<IPerson>('Person', personSchema);
