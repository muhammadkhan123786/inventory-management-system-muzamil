import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { CityModel, CityModelDoc } from "../models/city.models";
import { cityModelCreateSchema } from "../schemas/city.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const cityRouter = Router();

const cityServices = new GenericService<CityModelDoc>(CityModel);

const cityController = new AdvancedGenericController({
    service: cityServices,
    populate: ["userId", "countryId"],
    validationSchema: cityModelCreateSchema,
    searchFields: ["cityName"]
});

cityRouter.get("/", cityController.getAll);
cityRouter.get("/:id", cityController.getById);
cityRouter.post("/", cityController.create);
cityRouter.put("/:id", cityController.update);
cityRouter.delete("/:id", cityController.delete);

export default cityRouter;
