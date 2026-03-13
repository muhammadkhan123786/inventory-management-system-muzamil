
import { PurchaseOrderCounter } from "../models/auto-generate-code-models/purchase.order.code.models";
// import { supplierCounterSchema } from "../models/auto-generate-code-models/supplier.code.models";
import { SuplierSequenceCounter } from "../models/auto-generate-code-models/supplier.code.models";

// export const getSupplierCurrentCode = async (): Promise<string> => {
//   const year = new Date().getFullYear();

//   // Just fetch current counter without updating
//   const counter = await SuplierSequenceCounter.findOne({ year });

//   const seq = counter ? counter.seq + 1 : 1;

//   return `SUP-${year}-${String(seq).padStart(3, "0")}`;
// };


export const generateSupplierCode = async (): Promise<string> => {
  const year = new Date().getFullYear();

  const counter = await SuplierSequenceCounter.findOneAndUpdate(
    { year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  if (!counter) {
    throw new Error("Failed to Supplier Code sequence");
  }

  return `SUP-${year}-${String(counter.seq).padStart(3, "0")}`;
};

export const generatePurchaseOrderCode = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const counter = await PurchaseOrderCounter.findOneAndUpdate(
    { year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  if (!counter) {
    throw new Error("Failed to generate purchase Code sequence");
  }

  return `PO-${year}-${String(counter.seq).padStart(3, "0")}`;
};