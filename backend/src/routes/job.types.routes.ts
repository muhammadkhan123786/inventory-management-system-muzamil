import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { jobTypes, jobTypesDoc } from "../models/job.types.models";
import { jobTypesSchemaValidation } from "../schemas/job.types.interface";
import { AdvancedGenericController } from "../controllers/GenericController";

const jobTypesRouter = Router();

const jobTypesServices = new GenericService<jobTypesDoc>(jobTypes);

const jobTypesController = new AdvancedGenericController({
    service: jobTypesServices,
    populate: ["userId"],
    validationSchema: jobTypesSchemaValidation,
    searchFields: ["jobTypeName"]
});

jobTypesRouter.get("/", jobTypesController.getAll);
jobTypesRouter.get("/:id", jobTypesController.getById);
jobTypesRouter.post("/", jobTypesController.create);
jobTypesRouter.put("/:id", jobTypesController.update);
jobTypesRouter.delete("/:id", jobTypesController.delete);

export default jobTypesRouter;

