import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { GrnDoc, GrnModel } from "../models/grn.models";
import { createGRNValidationsSchema } from "../schemas/grn.schema"; 
import { AdvancedGenericController } from "../controllers/GenericController";
import { exportGRNToPDF } from "../controllers/pdf.controller";
import { applyGRNStockMiddleware } from "../middleware/grnStock.middleware"


const grnRoutes = Router();

const grnBaseService = new GenericService<GrnDoc>(GrnModel);

// const grnController = new AdvancedGenericController({
//   service: grnBaseService,
//   populate: [
//     "userId", 
//     {
//       path: "purchaseOrderId",
//       select: "orderNumber expectedDelivery  items.productId",
//       populate: {
//         path: "supplier",
//         select: "contactInformation"
//       }
//     },
    
//   ],
//   validationSchema: createGRNValidationsSchema, 
//   searchFields: ["grnNumber", "receivedBy", "notes"], 
// });


// routes/grn.routes.ts
const grnController = new AdvancedGenericController({
  service: grnBaseService,
  populate: [
    "userId",
    {
      path: "purchaseOrderId",
      select: "orderNumber expectedDelivery items",
      populate: [
        {
          path: "supplier",
          select: "contactInformation"
        },
        {
          path: "items.productId", // Populate product details in PO items
          select: "productName sku price images"
        }
      ]
    },
    {
      path: "items.productId", 
      select: "productName sku price "
    }
  ],
  validationSchema: createGRNValidationsSchema,
  searchFields: ["grnNumber", "receivedBy", "notes"],
});

grnRoutes.get("/export/:id", exportGRNToPDF);
grnRoutes.get("/", grnController.getAll);
grnRoutes.get("/:id", grnController.getById);
grnRoutes.post("/", applyGRNStockMiddleware, grnController.create);
grnRoutes.put("/:id", grnController.update);
grnRoutes.delete("/:id", grnController.delete);

export default grnRoutes;