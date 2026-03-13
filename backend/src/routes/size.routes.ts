import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { Size, sizeDoc } from "../models/size.models";
import { sizeSchemaValidation } from "../schemas/size.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const sizeRouter = Router();

const sizeServices = new GenericService<sizeDoc>(Size);

const sizeController = new AdvancedGenericController({
    service: sizeServices,
    populate: ["userId"],
    validationSchema: sizeSchemaValidation,
    searchFields: ["size"]
});

sizeRouter.get("/", sizeController.getAll);
sizeRouter.get("/:id", sizeController.getById);
sizeRouter.post("/", sizeController.create);
sizeRouter.put("/:id", sizeController.update);
sizeRouter.delete("/:id", sizeController.delete);

export default sizeRouter;

