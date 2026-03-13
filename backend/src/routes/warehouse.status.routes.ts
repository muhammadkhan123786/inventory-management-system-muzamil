import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { wareHouseStatusDoc, WarehouseStatus } from "../models/warehouse.status.models";
import { wareHouseStatusSchemaValidation } from "../schemas/warehouse.status.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const warehouseStatusRouter = Router();

const warehouseStatusServices = new GenericService<wareHouseStatusDoc>(WarehouseStatus);

const wareHouseStatusController = new AdvancedGenericController({
    service: warehouseStatusServices,
    populate: ["userId"],
    validationSchema: wareHouseStatusSchemaValidation,
    searchFields: ["wareHouseStatus"]
});

warehouseStatusRouter.get("/", wareHouseStatusController.getAll);
warehouseStatusRouter.get("/:id", wareHouseStatusController.getById);
warehouseStatusRouter.post("/", wareHouseStatusController.create);
warehouseStatusRouter.put("/:id", wareHouseStatusController.update);
warehouseStatusRouter.delete("/:id", wareHouseStatusController.delete);

export default warehouseStatusRouter;

