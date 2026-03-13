import { Request, Response, NextFunction } from "express";
import { Country } from "../models/country.models";
import { CityModel } from "../models/city.models";
import { Person } from "../models/person.models";
import { Contact } from "../models/contact.models";
import { Address } from "../models/addresses.models";
import { findOrCreate } from "../utils/findOrCreate";
import { CustomerBase } from "../models/customer.models";

export const CreateOrUpdateCustomerMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const isEdit = !!id; // edit if _id exists

        let customer;
        if (isEdit) {
            customer = await CustomerBase.findById(id);
            if (!customer) throw new Error("Customer not found");
        }

        /* -------------------------
           PERSON
        -------------------------- */
        let person;
        const personId = req.body.personId || customer?.personId;
        if (personId) {
            person = await Person.findByIdAndUpdate(
                personId,
                {
                    firstName: req.body.firstName,
                    middleName: req.body.middleName,
                    lastName: req.body.lastName,
                },
                { new: true }
            );
        } else {
            person = await new Person({
                firstName: req.body.firstName,
                middleName: req.body.middleName,
                lastName: req.body.lastName,
            }).save();
        }

        /* -------------------------
           CONTACT
        -------------------------- */
        let contact;
        const contactId = req.body.contactId || customer?.contactId;
        if (contactId) {
            contact = await Contact.findByIdAndUpdate(
                contactId,
                {
                    mobileNumber: req.body.mobileNumber,
                    phoneNumber: req.body.phoneNumber,
                    emailId: req.body.emailId,
                },
                { new: true }
            );
        } else {
            contact = await findOrCreate(
                Contact,
                { mobileNumber: req.body.mobileNumber },
                {
                    mobileNumber: req.body.mobileNumber,
                    phoneNumber: req.body.phoneNumber,
                    emailId: req.body.emailId,
                },

            );
        }

        /* -------------------------
           COUNTRY
        -------------------------- */
        const country = await findOrCreate(
            Country,
            { countryName: req.body.country, userId: req.body.userId },
            { countryName: req.body.country, userId: req.body.userId },

        );

        /* -------------------------
           CITY
        -------------------------- */
        const city = await findOrCreate(
            CityModel,
            { cityName: req.body.city, countryId: country._id, userId: req.body.userId },
            { cityName: req.body.city, countryId: country._id, userId: req.body.userId },

        );

        /* -------------------------
           ADDRESS
        -------------------------- */
        let address;
        const addressId = req.body.addressId || customer?.addressId;
        if (addressId) {
            address = await Address.findByIdAndUpdate(
                addressId,
                {
                    address: req.body.address,
                    countryId: country._id,
                    cityId: city._id,
                    zipCode: req.body.zipCode,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,

                },
                { new: true }
            );
        } else {
            address = await findOrCreate(
                Address,
                { address: req.body.address, countryId: country._id, cityId: city._id, zipCode: req.body.zipCode, userId: req.body.userId },
                { address: req.body.address, countryId: country._id, cityId: city._id, zipCode: req.body.zipCode, latitude: req.body.latitude, longitude: req.body.longitude, userId: req.body.userId },

            );
        }

        /* -------------------------
           Attach IDs
        -------------------------- */
        req.body.personId = person?._id.toString();
        req.body.contactId = contact?._id.toString();
        req.body.addressId = address?._id.toString();

        /* Pass session forward */


        next(); // Controller will commit
    } catch (error: any) {
        res.status(400).json({
            message: error.message || "Failed to create/update customer",
        });
    }
};