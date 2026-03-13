import { z } from "zod";

export const productBasicInfoSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),

  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),

  barcode: z.string().optional(),

  shortDescription: z
    .string()
    .max(160, "Max 160 characters")
    .optional(),

  description: z.string().min(1, "Description is required"),
});

export type ProductBasicInfoFormValues = z.infer<
  typeof productBasicInfoSchema
>;
