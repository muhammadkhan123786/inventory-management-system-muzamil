import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { ProductAttributeDoc, ProductAttributes } from "../models/product.attributes.modal";
import { attributeSchemaValidation } from "../schemas/product.attributes.schema"; 
import { AdvancedGenericController } from "../controllers/GenericController";

const productAttributesRoutes = Router();

const attributesBaseService = new GenericService<ProductAttributeDoc>(ProductAttributes);

const productAttributesController = new AdvancedGenericController({
    service: attributesBaseService,
    populate: ["userId"],
    validationSchema: attributeSchemaValidation, 
});

productAttributesRoutes.get("/", productAttributesController.getAll);
productAttributesRoutes.get("/:id", productAttributesController.getById);
productAttributesRoutes.post("/", productAttributesController.create);
productAttributesRoutes.put("/:id", productAttributesController.update);
productAttributesRoutes.delete("/:id", productAttributesController.delete);

export default productAttributesRoutes;