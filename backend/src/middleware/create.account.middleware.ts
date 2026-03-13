import { Request, Response, NextFunction } from "express"
import { User } from "../models/user.models";
import { hashPassword } from "../services/auth.service";
export const createOrUpdateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.accountDetails?.emailId;
        const password = req.body.accountDetails?.password;
        const accountId = req.body.accountId; // will exist on update

        if (!email) return res.status(400).json({ message: "Email is required" });

        // --- UPDATE CASE ---
        if (accountId) {
            const existingUser = await User.findOne({ _id: { $ne: accountId }, email });
            if (existingUser) {
                return res.status(409).json({ message: "Email already in use" });
            }

            const updateData: any = { email };
            if (password) {
                updateData.password = await hashPassword(password);
            }

            const updatedUser = await User.findByIdAndUpdate(accountId, updateData, { new: true });
            if (!updatedUser) return res.status(404).json({ message: "User not found" });

            req.body.accountId = updatedUser._id.toString();
            return next();
        }

        // --- CREATE CASE ---
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: "Email already in use" });

        if (!password) return res.status(400).json({ message: "Password is required" });

        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
            email,
            role: "Driver",
            password: hashedPassword,
            isActive: false,
            isDeleted: false
        });

        req.body.accountId = newUser._id.toString();
        next();

    } catch (err) {
        console.error("CreateOrUpdateAccount error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

