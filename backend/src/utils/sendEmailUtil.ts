import crypto from "crypto";
import { User } from "../models/user.models";
import "dotenv/config";
import { transporator } from "../config/node.mailer.config";

export const sendConfirmationEmail = async (userEmail: string, role: string) => {
    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token in DB
    await User.findOneAndUpdate(
        { email: userEmail },
        { emailToken: token, emailTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    );

    // Create confirmation link
    const confirmationLink = `${process.env.FRONTEND_URL}/technician/setup-password?token=${token}`;
    // Send email
    await transporator.sendMail({
        from: `Humber ${process.env.gmailuser}`,
        to: userEmail,
        subject: `Set up your ${role} account`,
        html: `<p>Click <a href="${confirmationLink}">here</a> to set your password and activate your account.</p>`
    });
};


export const sendEmailTemplate = async (EmailId: string, template: string, subject: string) => {

    await transporator.sendMail({
        from: `Humber ${process.env.gmailuser}`,
        to: EmailId,
        subject: subject,
        html: template
    });
};
