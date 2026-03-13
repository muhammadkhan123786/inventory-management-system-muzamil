import { Router } from "express";
import { GenericService } from "../services/generic.crud.services";
import { paymentTerm, paymentTermDoc } from "../models/payment.terms.models";
import { paymentTermCreateSchema } from "../schemas/payment.terms.schema";
import { AdvancedGenericController } from "../controllers/GenericController";

const paymentTermRouter = Router();

const paymentTermServices = new GenericService<paymentTermDoc>(paymentTerm);

const paymentTermController = new AdvancedGenericController({
    service: paymentTermServices,
    populate: ["userId"],
    validationSchema: paymentTermCreateSchema,
    searchFields: ["paymentTerm"]
});

paymentTermRouter.get("/", paymentTermController.getAll);
paymentTermRouter.get("/:id", paymentTermController.getById);
paymentTermRouter.post("/", paymentTermController.create);
paymentTermRouter.put("/:id", paymentTermController.update);
paymentTermRouter.delete("/:id", paymentTermController.delete);

export default paymentTermRouter;

