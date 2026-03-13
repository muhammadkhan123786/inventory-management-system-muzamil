import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { orderStatus, orderStatusDoc } from "../models/order.status.models";
import { orderStatusSchemaValidation } from "../schemas/order.status.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const orderStatusRouter = Router();

const currencyServices = new GenericService<orderStatusDoc>(orderStatus);

const orderStatusController = new AdvancedGenericController({
    service: currencyServices,
    populate: ["userId"],
    validationSchema: orderStatusSchemaValidation,
    searchFields: ["orderStatus"]
});

orderStatusRouter.get("/", orderStatusController.getAll);
orderStatusRouter.get("/:id", orderStatusController.getById);
orderStatusRouter.post("/", orderStatusController.create);
orderStatusRouter.put("/:id", orderStatusController.update);
orderStatusRouter.delete("/:id", orderStatusController.delete);

export default orderStatusRouter;

