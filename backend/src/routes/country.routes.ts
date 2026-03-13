import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { Country, countryDoc } from "../models/country.models";
import { countryCreateSchema } from "../schemas/country.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const countryRouter = Router();

const countryServices = new GenericService<countryDoc>(Country);

const countryController = new AdvancedGenericController({
    service: countryServices,
    populate: ["userId"],
    validationSchema: countryCreateSchema,
    searchFields: ["countryName"]
});

countryRouter.get("/", countryController.getAll);
countryRouter.get("/:id", countryController.getById);
countryRouter.post("/", countryController.create);
countryRouter.put("/:id", countryController.update);
countryRouter.delete("/:id", countryController.delete);

export default countryRouter;

