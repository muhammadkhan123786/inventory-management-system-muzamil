import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { Currency, currencyDoc } from "../models/currency.models";
import { currencyCreateSchema } from "../schemas/currency.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const currecyRouter = Router();

const currencyServices = new GenericService<currencyDoc>(Currency);

const currencyController = new AdvancedGenericController({
    service: currencyServices,
    populate: ["userId"],
    validationSchema: currencyCreateSchema,
    searchFields: ["currencyName"]
});

currecyRouter.get("/", currencyController.getAll);
currecyRouter.get("/:id", currencyController.getById);
currecyRouter.post("/", currencyController.create);
currecyRouter.put("/:id", currencyController.update);
currecyRouter.delete("/:id", currencyController.delete);

export default currecyRouter;

