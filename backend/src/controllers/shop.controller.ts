import { Request, Response } from 'express';
import { Shop } from '../models/shop.models';
import { Country } from '../models/country.models';
import { Address } from '../models/addresses.models';
import { Person } from '../models/person.models';
import { Contact } from '../models/contact.models';
import { IShopRegisterBackendInterface } from '../types/shopRegister.type';
import { Types } from 'mongoose';

export const registerShopDetails = async (req: Request, res: Response) => {
    try {
        const {
            userId,
            firstName,
            middleName,
            lastName,
            emailId,
            companyName,
            mobileNumber,
            phoneNumber,
            companyWebsite,
            companyAddress,
            country,
            zipCode,
            latitude,
            longitude,
            password,
            confirmPassword,
            termsSelected
        } = req.body;

        const payload: IShopRegisterBackendInterface = {
            userId: new Types.ObjectId(userId),
            firstName,
            middleName,
            lastName,
            fullName: `${firstName} ${middleName ?? ""} ${lastName}`.trim(),
            emailId,
            companyName,
            mobileNumber,
            phoneNumber,
            companyWebsite,
            companyAddress,
            country,
            zipCode,
            latitude: Number(latitude),
            longitude: Number(longitude),
            password,
            confirmPassword,
            logo: req.file?.filename ?? "",
            termsSelected: Boolean(termsSelected)
        };
        let logoPath = '';

        if (!userId) return res.status(400).json({ message: 'User ID is missing' });

        // 1️⃣ Find country by name
        let countryDoc = await Country.findOne({ countryName: country });

        // 2️⃣ If country not found, create it
        if (!countryDoc) {
            countryDoc = await Country.create({ countryName: country });
        }

        // 3️⃣ Create address document
        const addressDoc = await Address.create({
            address: companyAddress,
            countryId: countryDoc._id,
            zipCode,
            latitude,
            longitude,
            isActive: true,
            isDeleted: false,
        });

        //person Id 
        const personDoc = await Person.create({
            firstName,
            middleName,
            lastName,
        });

        //contact Id 
        const contactDoc = await Contact.create({
            mobileNumber,
            phoneNumber,
            companyWebsite,
            emailId: payload.emailId

        });


        const shop = new Shop({
            shopName: companyName,
            mobileNumber,
            phoneNumber,
            companyWebsite,
            personId: personDoc._id,
            contactId: contactDoc._id,
            addressId: addressDoc._id,
            userId: payload.userId,
            isActive: true,
            isDeleted: false,
            logo: logoPath

        });
        // 4️⃣ Create shop document
        await shop.save();

        res.status(201).json({
            message: 'Shop registered successfully',
            shop,
            address: addressDoc,
            country: countryDoc,
        });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err });
    }
};

