import { Router } from "express";
import { GenericService } from "../../services/generic.crud.services";
import { JobTitles, jobTitleDoc } from "../../models/master-data-models/job.title.models";
import { jobTitleSchemaValidation } from "../../schemas/master-data/job.titles.schema";
import { AdvancedGenericController } from "../../controllers/GenericController";

const jobTitleRouter = Router();

const jobTitleServices = new GenericService<jobTitleDoc>(JobTitles);

const jobTitleController = new AdvancedGenericController({
    service: jobTitleServices,
    populate: ["userId"],
    validationSchema: jobTitleSchemaValidation,
    searchFields: ["jobTitleName"]
});

jobTitleRouter.get("/", jobTitleController.getAll);
jobTitleRouter.get("/:id", jobTitleController.getById);
jobTitleRouter.post("/", jobTitleController.create);
jobTitleRouter.put("/:id", jobTitleController.update);
jobTitleRouter.delete("/:id", jobTitleController.delete);

export default jobTitleRouter;

