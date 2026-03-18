import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import "dotenv/config"; // load env variables

// Import only essential routes that actually exist
import authRouter from "./routes/auth.routes";
import {
  adminProtecter,
  
} from "./middleware/auth.middleware";

// Basic routes that should exist
import cityRouter from "./routes/city.routes";
import countryRouter from "./routes/country.routes";
import addressRouter from "./routes/addresses.routes";
import currecyRouter from "./routes/currency.routes";
import paymentTermRouter from "./routes/payment.terms.routes";
import orderStatusRouter from "./routes/order.status.rotues";
import productChannelsRouter from "./routes/product.channel.routes";
import ItemsConditionsRouter from "./routes/items.conditions.routes";
import taxRouter from "./routes/tax.routes";
import categoryRouter from "./routes/category.routes";
import unitRouter from "./routes/units.routes";
import warehouseStatusRouter from "./routes/warehouse.status.routes";
import warehouseRouter from "./routes/warehouse.routes";
import sizeRouter from "./routes/size.routes";
import businessTypeRouter from "./routes/suppliers/business.types.routes";
import paymentMethodRouter from "./routes/suppliers/payment.method.routes";
import pricingAgreementRouter from "./routes/suppliers/pricing.agreement.routes";
import productServicesRouter from "./routes/suppliers/product.services.routes";
import SupplierRouters from "./routes/suppliers/supplier.routes";
import shopRouter from "./routes/shop.routes";
import productSourceRouter from "./routes/product.source.routes";
import autoCodeGeneratorRouter from "./routes/auto-code-generator/auto.code.generator.routes";

import jobTitleRouter from "./routes/master-data-routes/job.titles.routes";




// Muzamil Hassan routes
import purchaseOrderRoutes from "./routes/purchaseOrder.routes";
import grnRoutes from "./routes/grn.routes";
import goodsReturnRoutes from "./routes/goodsReturn.routes";
import productRoutes from "./routes/product.routes";

import uploadRoutes from "./routes/upload.routes";
import aiRoutes from "./routes/ai.routes";
import emailTestRoutes from './routes/emailTest.routes';
import productAttributesRoutes from "./routes/product.attributes";
import supplierPriceHistoryRoutes from './routes/supplierPriceHistory.routes'

import supplierLedgrRoutes from "./routes/ledger.routes";
import paymentRoutes from "./routes/payment.routes"

// Create express app
const app: Application = express();

// Middlewares
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded
app.use(cors());

// Static files (for uploads/public folder)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use(`${process.env.API_PREFIX}/auth`, authRouter);
app.use(`${process.env.API_PREFIX}/register`, shopRouter);

app.use(`${process.env.API_PREFIX}/city`, adminProtecter, cityRouter);
app.use(`${process.env.API_PREFIX}/country`, adminProtecter, countryRouter);
app.use(`${process.env.API_PREFIX}/addresses`, adminProtecter, addressRouter);
app.use(`${process.env.API_PREFIX}/currencies`, adminProtecter, currecyRouter);
app.use(`${process.env.API_PREFIX}/payment-terms`, adminProtecter, paymentTermRouter);
app.use(`${process.env.API_PREFIX}/order-status`, adminProtecter, orderStatusRouter);
app.use(`${process.env.API_PREFIX}/product-channels`, adminProtecter, productChannelsRouter);
app.use(`${process.env.API_PREFIX}/items-conditions`, adminProtecter, ItemsConditionsRouter);
app.use(`${process.env.API_PREFIX}/tax`, adminProtecter, taxRouter);
app.use(`${process.env.API_PREFIX}/units`, adminProtecter, unitRouter);
app.use(`${process.env.API_PREFIX}/categories`, adminProtecter, categoryRouter);
app.use(`${process.env.API_PREFIX}/warehouse-status`, adminProtecter, warehouseStatusRouter);
app.use(`${process.env.API_PREFIX}/warehouses`, adminProtecter, warehouseRouter);
app.use(`${process.env.API_PREFIX}/sizes`, adminProtecter, sizeRouter);
app.use(`${process.env.API_PREFIX}/business-types`, adminProtecter, businessTypeRouter);
app.use(`${process.env.API_PREFIX}/payment-method`, adminProtecter, paymentMethodRouter);
app.use(`${process.env.API_PREFIX}/pricing-agreement`, adminProtecter, pricingAgreementRouter);
app.use(`${process.env.API_PREFIX}/product-services`, adminProtecter, productServicesRouter);
app.use(`${process.env.API_PREFIX}/suppliers`, adminProtecter, SupplierRouters);
app.use(`${process.env.API_PREFIX}/job-titles`, adminProtecter, jobTitleRouter);
app.use(
  `${process.env.API_PREFIX}/product-source`,
  adminProtecter,
  productSourceRouter,
);

// Muzamil Hassan routes
app.use(`${process.env.API_PREFIX}/products`, adminProtecter, productRoutes);
app.use(`${process.env.API_PREFIX}/ai`,  aiRoutes);
app.use(`${process.env.API_PREFIX}/purchase-orders`, adminProtecter, purchaseOrderRoutes);
app.use(`${process.env.API_PREFIX}/grn`, adminProtecter, grnRoutes);
app.use(`${process.env.API_PREFIX}/goods-return-notice`, adminProtecter, goodsReturnRoutes);
app.use(`${process.env.API_PREFIX}/upload`, adminProtecter, uploadRoutes);
app.use(
  `${process.env.API_PREFIX}/product-attributes`,
  adminProtecter,
  productAttributesRoutes,
);
app.use(`${process.env.API_PREFIX}/test/email`, adminProtecter, emailTestRoutes);
app.use(`${process.env.API_PREFIX}/supplier-price-history`,adminProtecter, supplierPriceHistoryRoutes);
app.use(
  `${process.env.API_PREFIX}/auto-generate-codes`,
  adminProtecter,
  autoCodeGeneratorRouter,
);


app.use(
  `${process.env.API_PREFIX}/supplier-ledger`,
  adminProtecter,
  supplierLedgrRoutes,
);

app.use(
  `${process.env.API_PREFIX}/supplier-payment`,
  adminProtecter,
  paymentRoutes,
);

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;