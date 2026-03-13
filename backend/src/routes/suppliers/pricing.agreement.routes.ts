import { Router } from "express";
import { GenericService } from "../../services/generic.crud.services";
import { pricingAgreementDoc, PricingAgreement } from "../../models/suppliers/pricing.agreement.models";
import { pricingAgreementSchemaValidation } from "../../schemas/suppliers/pricing.agreement.schema";
import { AdvancedGenericController } from "../../controllers/GenericController";

const pricingAgreementRouter = Router();

const pricingMethodServices = new GenericService<pricingAgreementDoc>(PricingAgreement);

const pricingAgreementController = new AdvancedGenericController({
    service: pricingMethodServices,
    populate: ["userId"],
    validationSchema: pricingAgreementSchemaValidation,
    searchFields: ["pricingAgreementName"]
});

pricingAgreementRouter.get("/", pricingAgreementController.getAll);
pricingAgreementRouter.get("/:id", pricingAgreementController.getById);
pricingAgreementRouter.post("/", pricingAgreementController.create);
pricingAgreementRouter.put("/:id", pricingAgreementController.update);
pricingAgreementRouter.delete("/:id", pricingAgreementController.delete);

export default pricingAgreementRouter;

