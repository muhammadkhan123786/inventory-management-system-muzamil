import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { Address, IAddress } from "../models/addresses.models";
import { adressCreateSchema } from "../schemas/address.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const addressRouter = Router();

const addressServices = new GenericService<IAddress>(Address);

const addressController = new AdvancedGenericController({
    service: addressServices,
    populate: ["userId", "countryId", "cityId"],
    validationSchema: adressCreateSchema,
    searchFields: ["address"]
});

addressRouter.get("/", addressController.getAll);

addressRouter.get("/:id", addressController.getById);

addressRouter.put("/:id", addressController.update);


export default addressRouter;
