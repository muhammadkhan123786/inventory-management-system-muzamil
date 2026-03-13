import { SchemaDefinition, Types } from "mongoose";
import { z } from "zod";
import { objectIdSchema } from "../validators/objectId.schema";

export const baseCustomerSchema: SchemaDefinition = {
  userId: { type: Types.ObjectId, ref: "User", required: true },
  personId: { type: Types.ObjectId, ref: "Person" },
  addressId: { type: Types.ObjectId, ref: "Address" },
  contactId: { type: Types.ObjectId, ref: "Contact" },
  sourceId: { type: Types.ObjectId, ref: "CustomerSourceModel" },
  accountId: { type: Types.ObjectId, ref: "User" },
  previousCustomerId: {
    type: Types.ObjectId,
    ref: "CustomerBase",
    default: null,
  },
  convertedToCustomerId: {
    type: Types.ObjectId,
    ref: "CustomerBase",
    default: null,
  },
  customerType: {
    type: String,
    required: true,
    enum: ["domestic", "corporate"],
  },
  convertedAt: { type: Date },
  isVatExemption: { type: Boolean, default: false },
  vatExemptionReason: { type: String, default: null },
  isActive: { type: Boolean, required: true, default: true },
  isDeleted: { type: Boolean, required: true, default: false },
  isDefault: { type: Boolean, required: true, default: false },
};

export const baseCustomerZodSchema = z.object({
  userId: objectIdSchema,

  personId: objectIdSchema.optional(),
  addressId: objectIdSchema.optional(),
  contactId: objectIdSchema.optional(),

  sourceId: objectIdSchema.optional(),
  accountId: objectIdSchema.optional(),

  previousCustomerId: objectIdSchema.nullable().optional(),
  convertedToCustomerId: objectIdSchema.nullable().optional(),

  customerType: z.enum(["domestic", "corporate"]),

  convertedAt: z.coerce.date().optional(),

  isVatExemption: z.boolean().default(false),
  vatExemptionReason: z.string().optional().nullable(),

  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});
