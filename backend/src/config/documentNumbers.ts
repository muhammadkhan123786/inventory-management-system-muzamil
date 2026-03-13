import { Model } from "mongoose";
import { PurchaseOrder } from "../models/purchaseOrder.model";
import { GrnModel } from "../models/grn.models";
import { GoodsReturn } from "../models/goodsReturn.model";

interface DocumentNumberConfig {
  model: Model<any>;
  field: string;
  prefix: string;
}

export const DOCUMENT_NUMBER_CONFIG: Record<string, DocumentNumberConfig> = {
  PO: {
    model: PurchaseOrder as Model<any>,
    field: "orderNumber",
    prefix: "PO",
  },
  GRN: {
    model: GrnModel as Model<any>,
    field: "grnNumber",
    prefix: "GRN",
  },
  GRN_REFERENCE: {
    model: GrnModel as Model<any>,
    field: "grnReference",
    prefix: "GRN-REF",
  },
  GOODS_RETURN: {
    model: GoodsReturn as Model<any>,
    field: "grtnNumber",
    prefix: "GRTN",
  },
};

export type DocumentType = keyof typeof DOCUMENT_NUMBER_CONFIG;
