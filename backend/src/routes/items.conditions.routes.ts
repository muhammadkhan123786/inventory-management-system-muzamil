import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { itemConditionDoc, ItemsConditions } from "../models/items.conditios.models";
import { itemConditionSchemaValidation } from "../schemas/items.condition.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const ItemsConditionsRouter = Router();

const itemConditionServices = new GenericService<itemConditionDoc>(ItemsConditions);

const ItemsConditionsController = new AdvancedGenericController({
    service: itemConditionServices,
    populate: ["userId"],
    validationSchema: itemConditionSchemaValidation,
    searchFields: ["itemConditionName"]
});

ItemsConditionsRouter.get("/", ItemsConditionsController.getAll);
ItemsConditionsRouter.get("/:id", ItemsConditionsController.getById);
ItemsConditionsRouter.post("/", ItemsConditionsController.create);
ItemsConditionsRouter.put("/:id", ItemsConditionsController.update);
ItemsConditionsRouter.delete("/:id", ItemsConditionsController.delete);

export default ItemsConditionsRouter;

