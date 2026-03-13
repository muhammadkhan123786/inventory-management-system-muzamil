import { z } from "zod";

export const invoiceServiceSchema = z.object({
  activityId: z.string().min(1, "Activity is required"),
  rate: z.number().default(50),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().min(1, "Description is required"),
  additionalNotes: z.string().optional(),
  source: z.enum(["JOB", "INVOICE"]).default("INVOICE"),
});

export const invoicePartSchema = z.object({
  partId: z.string().min(1, "Product is required"),
  partName: z.string().optional(),
  partNumber: z.string().optional(),
  oldPartConditionDescription: z.string().optional(),
  newSerialNumber: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Unit cost cannot be negative"),
  totalCost: z.number().optional(),
  reasonForChange: z.string().optional(),
  source: z.enum(["JOB", "INVOICE"]).default("INVOICE"),
});

export const invoiceSchema = z.object({
  invoiceId: z.string().optional(),
  jobId: z.string().min(1, "Job is required"),
  customerId: z.string().min(1, "Customer is required"),

  services: z.array(invoiceServiceSchema).default([]),
  parts: z.array(invoicePartSchema).default([]),

  completionSummary: z.string().optional(),
  invoiceDate: z.date().default(() => new Date()),
  dueDate: z.date(),
  callOutFee: z.number().min(0).default(0),

  discountType: z.enum(["Percentage", "Fix Amount"]).default("Percentage"),
  isVATEXEMPT: z.boolean().default(false),

  // Make these required with defaults
  partsTotal: z.number().default(0),
  labourTotal: z.number().default(0),
  subTotal: z.number().default(0),
  discountAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  netTotal: z.number().default(0),

  invoiceNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  paymentLink: z.string().url().optional(),

  paymentMethod: z
    .enum([
      "CASH",
      "BANK TRANSFER",
      "CARD PAYMENT",
      "ONLINE PAYMENT",
      "QR CODE",
      "PENDING",
    ])
    .default("PENDING"),
  paymentStatus: z.enum(["PENDING", "PAID"]).default("PENDING"),
  status: z.enum(["DRAFT", "ISSUED", "CANCELLED", "PAID"]).default("DRAFT"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceServiceFormData = z.infer<typeof invoiceServiceSchema>;
export type InvoicePartFormData = z.infer<typeof invoicePartSchema>;
