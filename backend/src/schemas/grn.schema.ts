import { z } from "zod";
import { Schema, SchemaDefinition } from "mongoose";
import { commonSchema, commonSchemaValidation } from "./shared/common.schema";
import { generateNextDocumentNumber } from "../services/documentNumber.service"

export const GRNItemSchema = new Schema(
  {
    productId: { type: String},
    productName: String,
    sku: String,
    orderedQuantity: Number,
    receivedQuantity: { type: Number, required: true },
    acceptedQuantity: { type: Number, required: true },
    rejectedQuantity: { type: Number, required: true },
    damageQuantity: { type: Number, required: true },
    unitPrice: Number,
    condition: {
      type: String,
      enum: ["good", "damaged", "defective", "other"],
      required: true,
    },

    notes: String,
  },
  { _id: false },
);

export const GoodsReceivedSchema = new Schema(
  {
    ...commonSchema,
    grnNumber: { type: String }, 
    grnReference: { type: String}, 
    receivedDate: Date,
    receivedBy: String,
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    items: [GRNItemSchema],
    notes: String,
    status: {
      type: String,
      enum: ["received", "ordered"],
       default: "received",
    }   
  },
  { timestamps: true },
);

GoodsReceivedSchema.pre("save", async function (this: any) {
  if (this.isNew) {
    if (!this.grnNumber) {
      // ✅ Pass the model's constructor
      this.grnNumber = await generateNextDocumentNumber("GRN", this.constructor);
    }

    if (!this.grnReference) {
      this.grnReference = await generateNextDocumentNumber("GRN_REFERENCE", this.constructor);
    }
  }
});

export const grnItemSchema = z
  .object({
    productId: z.string(),
    productName: z.string(),
    sku: z.string(),
    purchaseOrderItemId: z.string().optional(), 
    receivedQuantity: z.number().min(0),
    acceptedQuantity: z.number().min(0),
    rejectedQuantity: z.number().min(0),
    damageQuantity: z.number().min(0),
    unitPrice: z.number().min(0),
    condition: z.enum(["good", "damaged", "defective", "other"]),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.acceptedQuantity + data.rejectedQuantity + data.damageQuantity ===
      data.receivedQuantity,
    {
      message: "Accepted + Rejected + Damaged must equal Received",
    }
  );

export const createGRNValidationsSchema = z.object({
  ...commonSchemaValidation,
   grnNumber: z.string().optional(), 
  grnReference: z.string().optional(),
  purchaseOrderId: z.string().min(1, "Purchase Order ID is required"),
  receivedDate: z.coerce.date().optional(),
  receivedBy: z.string().min(2),
  items: z.array(grnItemSchema).min(1),
  notes: z.string().optional(),
  status:z.enum(["received", "ordered"]).optional(),
});
