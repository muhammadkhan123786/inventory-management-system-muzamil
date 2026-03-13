import { Schema, model, Document } from 'mongoose';

export type Roles = 'Admin' | 'Technician' | 'Customer' | 'Driver';


export interface IUser extends Document {
    email: string;
    password?: string;
    role: Roles;
    isActive: boolean;
    isDeleted: boolean;
    emailToken?: string;
    emailTokenExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String },
        role: {
            type: String,
            enum: ['Admin', 'Technician', 'Customer', 'Driver'],
            required: true,
            default: 'Admin', // optional default
        },
        emailToken: { type: String },
        emailTokenExpires: { type: Date },
        isActive: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
