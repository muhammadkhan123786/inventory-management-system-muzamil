import { Router } from "express";
import { GenericService } from "../../services/generic.crud.services";
import { productServicesDoc, ProductServices } from "../../models/suppliers/product.services.models";
import { productServicesSchemaValidation } from "../../schemas/suppliers/product.services.schema";
import { AdvancedGenericController } from "../../controllers/GenericController";

const productServicesRouter = Router();

const productServicesServices = new GenericService<productServicesDoc>(ProductServices);

const productServicesController = new AdvancedGenericController({
    service: productServicesServices,
    populate: ["userId"],
    validationSchema: productServicesSchemaValidation,
    searchFields: ["productServicesName"]
});

productServicesRouter.get("/", productServicesController.getAll);
productServicesRouter.get("/:id", productServicesController.getById);
productServicesRouter.post("/", productServicesController.create);
productServicesRouter.put("/:id", productServicesController.update);
productServicesRouter.delete("/:id", productServicesController.delete);

export default productServicesRouter;

