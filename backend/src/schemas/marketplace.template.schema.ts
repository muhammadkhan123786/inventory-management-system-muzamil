import { z } from "zod";
import { Schema, SchemaDefinition } from "mongoose";
import { commonSchema, commonSchemaValidation } from "./shared/common.schema";

export const marketplaceTemplateSchema: SchemaDefinition = {
  ...commonSchema,

  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },

  description: { type: String },

  icon: {
    type: Schema.Types.ObjectId,
    ref: "Icons",
    required: true,
  },

  color: {
    type: Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },

  fields: {
    type: [String],
    default: [],
  },

  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
};


export const marketplaceTemplateSchemaValidation = z.object({
  ...commonSchemaValidation,

  name: z.string().min(2),
  code: z.string().min(2),

  description: z.string().optional(),

  icon: z.string(),
  color: z.string(),

  fields: z.array(z.string()).optional(),

  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});
