import { z } from 'zod';
import { Types } from 'mongoose';
import { commonSchema, commonSchemaValidation } from './shared/common.schema';

export const productVariantsSchema = {
    ...commonSchema,
    sizeId: { type: Types.ObjectId, ref: "Size" },
    colorId: { type: Types.ObjectId, ref: "Color" },
    material: { type: String, required: true },
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    grossWeight: { type: Number }

}

export const productVariantsSchemaValidation = z.object({
    ...commonSchemaValidation,
    sizeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Size ID").optional(),
    colorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Color ID").optional(),
    material: z.string().min(1, "Product material required."),
    length: z.number().nonnegative().optional(),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
    grossWeight: z.number().nonnegative().optional()
})