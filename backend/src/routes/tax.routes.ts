import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { taxDoc, Tax } from "../models/tax.models";
import { taxSchemaValidation } from "../schemas/tax.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const taxRouter = Router();

const taxServices = new GenericService<taxDoc>(Tax);

const taxController = new AdvancedGenericController({
    service: taxServices,
    populate: ["userId"],
    validationSchema: taxSchemaValidation,
    searchFields: ["taxName", "percentage"]
});

taxRouter.get("/", taxController.getAll);
taxRouter.get("/:id", taxController.getById);
taxRouter.post("/", taxController.create);
taxRouter.put("/:id", taxController.update);
taxRouter.delete("/:id", taxController.delete);

export default taxRouter;

