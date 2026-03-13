import { Request, Response, NextFunction, Router } from "express";
import { GenericService } from "../../services/generic.crud.services";
import {
  SupplierModel,
  SupplierBaseDoc,
} from "../../models/suppliers/supplier.models";
import { supplierSchemaValidation } from "../../schemas/suppliers/supplier.schema";
import { AdvancedGenericController } from "../../controllers/GenericController";
import { createUploader } from "../../config/multer";
import { mapUploadedFilesToBody } from "../../middleware/mapUploadedFiles";
import { resolveBusinessAddressRefs } from "../../middleware/resolveBusinessAddressRefs";
import { normalizeArrays } from "../../middleware/normalizeArrays";
import { parseNestedFormData } from "../../middleware/parseFormDataJson";
import { assignSupplierCode } from "../../middleware/supplier.middleware";

const supplierUploads = createUploader([
  {
    name: "businessRegistrationCertificatesFile",
    maxCount: 1000,
    mimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
]);

const SupplierRouters = Router();

const SupplierServices = new GenericService<SupplierBaseDoc>(SupplierModel);

const SupplierController = new AdvancedGenericController({
  service: SupplierServices,
  populate: [
    "userId",
    "supplierIdentification.businessTypeId",
    "contactInformation.jobTitleId",
    "businessAddress.city",
    "businessAddress.country",
    "financialInformation.paymentCurrencyId",
    "financialInformation.paymentMethodId",
    "productServices.typeOfServiceId",
    "productServices.productCategoryIds",
    "commercialTerms.paymentTermsId",
    "commercialTerms.pricingAgreementId",
  ],
  validationSchema: supplierSchemaValidation,
});

const supplierLogging = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("[SUPPLIER] ===== REQUEST RECEIVED =====");
    console.log("[SUPPLIER] req.files:", JSON.stringify(req.files, null, 2));
    console.log("[SUPPLIER] req.body keys:", Object.keys(req.body || {}));
    console.log("[SUPPLIER] Headers:", req.headers["content-type"]);
    next();
  } catch (error) {
    console.error("[SUPPLIER LOGGING ERROR]:", error);
    next();
  }
};
SupplierRouters.get("/", SupplierController.getAll);
SupplierRouters.get("/:id", SupplierController.getById);

SupplierRouters.post(
  "/",
  supplierUploads,
  parseNestedFormData,
  mapUploadedFilesToBody("/uploads", {
    businessRegistrationCertificatesFile:
      "complianceDocumentation.businessRegistrationCertificates",
  }),
  supplierLogging,
  resolveBusinessAddressRefs,
  normalizeArrays(["complianceDocumentation.businessRegistrationCertificates"]),
  assignSupplierCode,
  SupplierController.create,
);

SupplierRouters.put(
  "/:id",
  supplierUploads,
  parseNestedFormData,
  mapUploadedFilesToBody("/uploads", {
    businessRegistrationCertificatesFile:
      "complianceDocumentation.businessRegistrationCertificates",
  }),
  supplierLogging,
  resolveBusinessAddressRefs,
  normalizeArrays(["complianceDocumentation.businessRegistrationCertificates"]),
  SupplierController.update,
);

SupplierRouters.delete("/:id", SupplierController.delete);

export default SupplierRouters;
