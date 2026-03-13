import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import ms from 'ms';
import { Types } from 'mongoose';

export interface JwtPayload {
    userId: string;
    email: string;
    role?: string;
    driverId?: string;
    technicianId?: string;
    customerId?: string;
}

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
export const generateToken = (payload: JwtPayload): string => {
    const secret = env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    // Convert string like '1d', '2h' to ms.NumberValue
    const expiresIn = ms(env.JWT_EXPIRES_IN as ms.StringValue); // returns number in ms
    const options: SignOptions = {
        expiresIn: expiresIn ? expiresIn / 1000 : 86400 // seconds
    };

    return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};
