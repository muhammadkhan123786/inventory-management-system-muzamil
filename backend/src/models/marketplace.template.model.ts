import { Document, Model, model, Schema } from "mongoose";
import { IMarketplaceTemplate } from "../../../common/IMarketplaceTemplate.interface";
import { marketplaceTemplateSchema } from "../schemas/marketplace.template.schema";

export type MarketplaceTemplateDoc = IMarketplaceTemplate & Document;

const marketplaceTemplateDbSchema = new Schema<MarketplaceTemplateDoc>(
  marketplaceTemplateSchema,
  { timestamps: true }
);

export const MarketplaceTemplateModel: Model<MarketplaceTemplateDoc> =
  model<MarketplaceTemplateDoc>(
    "MarketplaceTemplate",
    marketplaceTemplateDbSchema
  );
