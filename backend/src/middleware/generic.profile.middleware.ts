import { Request, Response, NextFunction } from "express";
import { Model, Document, Types } from "mongoose";
import { User } from "../models/user.models";
import { Person } from "../models/person.models";
import { Contact } from "../models/contact.models";
import { Address } from "../models/addresses.models";
import { sendConfirmationEmail } from "../utils/sendEmailUtil";
import { commonProfileDto } from "../../../common/DTOs/profilecommonDto";

type GenericModels<T extends Document> = {
    targetModel: Model<T>; // e.g., TechnicianProfile, CustomerProfile, AdminProfile
};

export const genericProfileIdsMiddleware = <T extends Document & { accountId?: Types.ObjectId, personId?: Types.ObjectId, contactId?: Types.ObjectId, addressId?: Types.ObjectId }>(models: GenericModels<T>, isAccountCreate = true) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as commonProfileDto;
            const isUpdate = !!req.params.id;

            if (isUpdate) {
                // -------------------------
                // UPDATE EXISTING RECORDS
                // -------------------------
                const model = await models.targetModel.findById(req.params.id);
                if (!model) {
                    return res.status(404).json({ message: "Profile not found" });
                }

                if (isAccountCreate) {
                    const account = await User.findById(model.accountId);
                    if (!account) return res.status(404).json({ message: "Account  not found" });
                    // Prevent duplicate email if changed
                    if (account.email !== body.contact.emailId) {
                        const emailExists = await User.findOne({ email: body.contact.emailId });
                        if (emailExists)
                            return res.status(409).json({ message: "Email already in use" });
                    }
                    await User.findByIdAndUpdate(model.accountId, { email: body.contact.emailId });
                    req.body.accountId = model.accountId?.toString();

                }

                if (model.personId) await Person.findByIdAndUpdate(model.personId, { ...body.person });
                if (model.contactId) await Contact.findByIdAndUpdate(model.contactId, { ...body.contact });
                if (model.addressId) await Address.findByIdAndUpdate(model.addressId, { ...body.address, userId: req.body.userId });

                req.body.personId = model.personId.toString();
                req.body.contactId = model.contactId.toString();
                req.body.addressId = model.addressId.toString();


                next();
                return;
            }
            //new create account 
            if (isAccountCreate) {
                const existingUser = await User.findOne({ email: body.contact.emailId });
                if (existingUser) return res.status(409).json({ message: "User already exists with this email" });
                // Role assignment (backend controlled)
                const role = body.role ?? (req.originalUrl.includes("Technician") ? "Technician" : req.originalUrl.includes("Admin") ? "Admin" : "Customer");

                const user = await User.create({
                    email: body.contact.emailId,
                    role,
                });
                req.body.accountId = user._id.toString();
                await sendConfirmationEmail(user.email, role);
            }

            // Create Person, Contact, Address
            const person = await Person.create(body.person);
            const contact = await Contact.create(body.contact);
            const address = await Address.create(body.address);

            // Attach IDs to request for controller
            req.body.personId = person._id.toString();
            req.body.contactId = contact._id.toString();
            req.body.addressId = address._id.toString();

            next();
        } catch (error) {
            next(error);
        }
    };
};
