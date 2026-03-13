import { z } from "zod";

export const attributeSchemaValidation = z
  .object({
    userId: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    isForSubcategories: z.boolean().default(false).optional(),
    attributeName: z.string().min(2, "Attribute name is required"),
    type: z.enum([
      "text",
      "number",
      "dropdown",
      "date",
      "list",
      "checkbox",
      "radio",
      "textarea"
    ]),
    unit: z.string().optional(), // Keep this
    isRequired: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    options: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  })
  .strict();