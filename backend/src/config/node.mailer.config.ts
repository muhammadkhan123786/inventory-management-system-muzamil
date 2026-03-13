import nodemailer from 'nodemailer';
import "dotenv/config";

export const transporator = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.gmailuser!,
        pass: process.env.gmailpass!
    }
});
