import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";

export const indexUniqueMiddlewareCheck =
    (model: Model<any>, paramId: string = "id") =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { index } = req.body;

                // index is optional → skip check
                if (index === undefined) {
                    return next();
                }

                const query: any = { index };

                // If UPDATE → exclude current document
                if (req.params?.[paramId]) {
                    query._id = { $ne: req.params[paramId] };
                }

                const existing = await model.findOne(query).lean();

                if (existing) {
                    return res.status(409).json({
                        success: false,
                        message: `Index ${index} already exists`
                    });
                }

                next();
            } catch (error) {
                next(error);
            }
        };
