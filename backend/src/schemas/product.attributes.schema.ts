import { z } from "zod";
import { Schema, SchemaDefinition } from "mongoose";
import { commonSchema, commonSchemaValidation } from "./shared/common.schema";

export const attributeSchema: SchemaDefinition = {
  ...commonSchema,

  attributeName: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "number", "dropdown", "list", "date", "checkbox", "radio", "textarea"],
    required: true,
  },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null }, 
  isForSubcategories: { type: Boolean, default: false }, 
  isDefault: { type: Boolean, default: false},
  
  isRequired: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  options: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true },
      sort: { type: Number, default: 0 },
    },
  ],
};



export const attributeSchemaValidation = z.object({
  ...commonSchemaValidation,

  attributeName: z.string().min(2, "Attribute name is required"),
  type: z.enum(["text", "number", "dropdown", "list", "date", "checkbox", "radio", "textarea"]),
  categoryId: z.string().optional().nullable(), // Add this
  isForSubcategories: z.boolean().optional(), // Add this
  isRequired: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  isDefault: z.boolean().optional(),

  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        sort: z.number().optional(),
      })
    )
    .optional(),
});