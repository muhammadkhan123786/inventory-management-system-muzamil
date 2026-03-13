import { NextFunction, Request, Response } from 'express';
import { Roles, User } from '../models/user.models';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';


//this is middleware. common for register all user.
export const userRegister = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { emailId, password, confirmPassword, role } = req.body;
        // Check if user exists
        const existingUser = await User.findOne({ email: emailId });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Assign role or default
        const userRole: Roles = role && ['Admin', 'Technician', 'Customer'].includes(role)
            ? (role as Roles)
            : 'Admin';

        // Create user
        const user = await User.create({
            email: emailId,
            password: hashedPassword,
            role: userRole,
            isActive: true,
            isDeleted: false,
        });

        // Pass _id to next middleware
        req.body.userId = user._id;
        next(); // go to role-specific middleware
    } catch (err) {
        res.status(500).json({ message: 'User Create failed', error: err });
    }
};


//login 
export const login = async (req: Request, res: Response) => {
    try {
        console.log("Request body: ", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // 🔎 Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: `Email ${email} does not exist. Invalid credentials.`
            });
        }

        if (!user.isActive) {
            return res.status(400).json({
                message: `Email ${email} is not active/verified. Contact admin.`
            });
        }

        const isMatch = await comparePassword(password, user.password!);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password. Please check."
            });
        }

        let token = "";

       
        token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        });

        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            token
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed due to server error",
            error: error instanceof Error ? error.message : error,
        });
    }
};


export const setupPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({ emailToken: token, emailTokenExpires: { $gt: new Date() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        // Hash password
        const hashedPassword = await hashPassword(password);

        user.password = hashedPassword;
        user.isActive = true;
        user.emailToken = undefined;
        user.emailTokenExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Account activated successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

//change password controller 
export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Update password request body:", req.body);
        const { userId, currentPassword, newPassword } = req.body;

        console.log("User ID from token:", userId);


        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({
                message: "currentPassword and newPassword are required.",
            });
        }

        // ✅ Load user from DB
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(404).json({
                message: "User does not exist.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "User is not active. Please contact administrator.",
            });
        }

        // ✅ Verify current password
        const isMatch = await comparePassword(currentPassword, user.password!);
        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect.",
            });
        }

        // ✅ Prevent password reuse
        const isSamePassword = await comparePassword(newPassword, user.password!);
        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must be different from current password.",
            });
        }

        // ✅ Save new password
        user.password = await hashPassword(newPassword);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    } catch (error) {
        console.error("User password update error:", error);
        return res.status(500).json({
            success: false,
            message: "Password update failed due to server error.",
        });
    }
};
