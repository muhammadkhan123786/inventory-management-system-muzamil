import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { warehouseDoc, Warehouse } from "../models/warehouse.models";
import { AdvancedGenericController } from "../controllers/GenericController";
import { genericProfileIdsMiddleware } from "../middleware/generic.profile.middleware";
import { wareHouseSchemaValidation } from "../schemas/warehouse.schema";

const warehouseRouter = Router();

const warehouseServices = new GenericService<warehouseDoc>(Warehouse);

const warehouseController = new AdvancedGenericController({
  service: warehouseServices,
  populate: ["userId", "personId", "addressId", "contactId"],
  validationSchema: wareHouseSchemaValidation,
  searchFields: [""]
});

const warehouseProfileMiddleware = genericProfileIdsMiddleware<warehouseDoc>(
  { targetModel: Warehouse },
  false
);

warehouseRouter.get("/", warehouseController.getAll);
warehouseRouter.get("/:id", warehouseController.getById);
warehouseRouter.post(
  "/",
  warehouseProfileMiddleware,
  warehouseController.create
);
warehouseRouter.put(
  "/:id",
  warehouseProfileMiddleware,
  warehouseController.update
);
warehouseRouter.delete("/:id", warehouseController.delete);

export default warehouseRouter;
