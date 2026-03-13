// documentNumber.service.ts
import mongoose from "mongoose";

export const generateNextDocumentNumber = async (
  type: "GRN" | "GRN_REFERENCE" | "PO" | "PO_REFERENCE" | "GOODS_RETURN" | "GOODS_RETURN_REFERENCE", // ✅ Add GOODS_RETURN
  model?: mongoose.Model<any>
) => {
  const configs = {
    GRN: { prefix: "GRN", field: "grnNumber" },
    GRN_REFERENCE: { prefix: "GRNREF", field: "grnReference" },
    PO: { prefix: "PO", field: "orderNumber" },
    PO_REFERENCE: { prefix: "POREF", field: "poReference" },
    GOODS_RETURN: { prefix: "GRTN", field: "grtnNumber" }, // ✅ Add this
    GOODS_RETURN_REFERENCE: { prefix: "GRREF", field: "returnReference" }, // ✅ Add this
  };

  const config = configs[type];
  const currentYear = new Date().getFullYear();
  const yearPrefix = `${config.prefix}-${currentYear}-`;
  const regex = new RegExp(`^${yearPrefix}`);

  // ✅ Add model resolution for GOODS_RETURN
  if (!model) {
    if (type === "GRN" || type === "GRN_REFERENCE") {
      const { GrnModel } = require("../models/grn.models");
      model = GrnModel;
    } else if (type === "PO" || type === "PO_REFERENCE") {
      const { PurchaseOrderModel } = require("../models/purchaseOrder.models");
      model = PurchaseOrderModel;
    } else if (type === "GOODS_RETURN" || type === "GOODS_RETURN_REFERENCE") {
      try {
        const { GoodsReturn } = require("../models/goodsReturn.model"); // ✅ Add this
        model = GoodsReturn;
      } catch (error) {
        throw new Error(`GoodsReturnModel not found. Please create the model file first.`);

      }


    }
  }

  const latestDoc = await model
    .findOne({
      [config.field]: regex,
    })
    .sort({ [config.field]: -1 })
    .lean();

  let nextSequence = 1;

  if (latestDoc?.[config.field]) {
    const parts = (latestDoc[config.field] as string).split("-");
    const lastNumber = parseInt(parts[parts.length - 1], 10);

    if (!isNaN(lastNumber)) {
      nextSequence = lastNumber + 1;
    }
  }
  console.log("Next sequence:", nextSequence);

  const paddedNumber = String(nextSequence).padStart(3, "0");
  return `${config.prefix}-${currentYear}-${paddedNumber}`;
};