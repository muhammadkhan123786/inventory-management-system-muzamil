import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Roles, User } from '../models/user.models';

export interface AuthRequest extends Request {
    user?: any;
    role?: Roles;
    technician?: any
    technicianId?: string
}

export interface TechnicianAuthRequest extends Request {
    user?: any;
    role?: Roles;
    technicianId?: string;
}


//admin protector operations middleware.
export const adminProtecter = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        let userId: string | null = null;
        let role: Roles | null = null;

        /* ===================================================
           ✅ 1. MOBILE FLOW (adminId)
        ==================================================== */

        const adminId =
            req.body?.adminId ||
            (req.headers["x-admin-id"] as string | undefined);

        if (adminId) {
            const mobileUser = await User.findById(adminId)
                .select("_id role isDeleted");

            if (!mobileUser || mobileUser.isDeleted) {
                return res.status(401).json({
                    message: "Mobile admin not found",
                });
            }

            userId = mobileUser._id.toString();
            role = mobileUser.role as Roles;
        }

        /* ===================================================
           ✅ 2. JWT FLOW (WEB)
        ==================================================== */
        else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            const token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res.status(401).json({
                    message: "Not authorized, token missing",
                });
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as { id: string; role: Roles };

            userId = decoded.id;
            role = decoded.role;
        }

        /* ===================================================
           ❌ NO AUTH PROVIDED
        ==================================================== */
        else {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        /* ===================================================
           ✅ UNIFIED ATTACH (IDENTICAL STRUCTURE)
           Controllers DO NOT CHANGE
        ==================================================== */

        req.user = { id: userId };
        req.role = role;

        /* ===================================================
           🔐 ROLE GUARD
        ==================================================== */

        if (role !== "Admin") {
            return res.status(403).json({
                message: "Not authorized, Admin access only",
            });
        }

        return next();

    } catch (error) {
        console.error("ADMIN PROTECTOR ERROR:", error);

        return res.status(401).json({
            message: "Authentication failed",
        });
    }
};





//check user is valid logged in. 
export const generalProtecter = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    let token: string | undefined;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing" });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { id: string; role: Roles };

        // ✅ Attach ONLY token data
        req.user = { id: decoded.id };
        req.role = decoded.role;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token invalid" });
    }
};




