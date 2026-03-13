import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { productSourceDbDoc, ProductSource } from "../models/product.source.models"
import { productSourceSchemaValidation } from "../schemas/product.source.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const productSourceRouter = Router();

const productSourceServices = new GenericService<productSourceDbDoc>(ProductSource);

const productSourceController = new AdvancedGenericController({
    service: productSourceServices,
    populate: ["userId"],
    validationSchema: productSourceSchemaValidation,
    searchFields: ["productSource"]
});

productSourceRouter.get("/", productSourceController.getAll);
productSourceRouter.get("/:id", productSourceController.getById);
productSourceRouter.post("/", productSourceController.create);
productSourceRouter.put("/:id", productSourceController.update);
productSourceRouter.delete("/:id", productSourceController.delete);

export default productSourceRouter;

