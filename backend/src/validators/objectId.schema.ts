import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId",
    });

export const objectIdOrStringSchema = z.union([
    z.string(),
    z.custom<mongoose.Types.ObjectId>(
        (val) => val instanceof mongoose.Types.ObjectId,
        { message: "Invalid ObjectId" }
    ),
]);