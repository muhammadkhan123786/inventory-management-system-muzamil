import { Router } from "express";
import { GenericService } from "../../services/generic.crud.services";
import { paymentMethodDoc, PaymentMethod } from "../../models/suppliers/payment.method.models";
import { paymentMethodSchemaValidation } from "../../schemas/suppliers/payment.method.schema";
import { AdvancedGenericController } from "../../controllers/GenericController";

const paymentMethodRouter = Router();

const paymentMethodServices = new GenericService<paymentMethodDoc>(PaymentMethod);

const paymentMethodController = new AdvancedGenericController({
    service: paymentMethodServices,
    populate: ["userId"],
    validationSchema: paymentMethodSchemaValidation,
    searchFields: ["paymentMethodName"]
});

paymentMethodRouter.get("/", paymentMethodController.getAll);
paymentMethodRouter.get("/:id", paymentMethodController.getById);
paymentMethodRouter.post("/", paymentMethodController.create);
paymentMethodRouter.put("/:id", paymentMethodController.update);
paymentMethodRouter.delete("/:id", paymentMethodController.delete);

export default paymentMethodRouter;

