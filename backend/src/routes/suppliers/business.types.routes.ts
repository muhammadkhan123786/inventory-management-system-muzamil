import { Router } from "express";
import { GenericService } from "../../services/generic.crud.services";
import { businessTypeDoc, BusinessType } from "../../models/suppliers/business.types.models";
import { businessTypeSchemaValidation } from "../../schemas/suppliers/business.types.schema";
import { AdvancedGenericController } from "../../controllers/GenericController";

const businessTypeRouter = Router();

const businessTypeServices = new GenericService<businessTypeDoc>(BusinessType);

const businessTypeController = new AdvancedGenericController({
    service: businessTypeServices,
    populate: ["userId"],
    validationSchema: businessTypeSchemaValidation,
    searchFields: ["businessTypeName"]
});

businessTypeRouter.get("/", businessTypeController.getAll);
businessTypeRouter.get("/:id", businessTypeController.getById);
businessTypeRouter.post("/", businessTypeController.create);
businessTypeRouter.put("/:id", businessTypeController.update);
businessTypeRouter.delete("/:id", businessTypeController.delete);

export default businessTypeRouter;

