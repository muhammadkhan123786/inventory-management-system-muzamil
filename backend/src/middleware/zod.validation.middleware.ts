import { ZodObject } from "zod";
import { NextFunction, Response, Request } from "express";

export const validateData =
    (schema: ZodObject) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: result.error.format()
                });
            }

            req.body = result.data; // overwrite with validated data
            next();
        };
