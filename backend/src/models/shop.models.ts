import { Schema, model, Types } from 'mongoose';

export interface IShop {
    shopName: string;
    personId: Types.ObjectId;
    contactId: Types.ObjectId;
    addressId: Types.ObjectId;
    userId: Types.ObjectId;
    isActive: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    logo: string;
}

const shopSchema = new Schema<IShop>(
    {
        shopName: { type: String, required: true },

        personId: {
            type: Schema.Types.ObjectId,
            ref: 'Person',
            required: true,
        },

        contactId: {
            type: Schema.Types.ObjectId,
            ref: 'Contact',
            required: true,
        },

        addressId: {
            type: Schema.Types.ObjectId,
            ref: 'Address',
            required: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

export const Shop = model<IShop>('Shop', shopSchema);
