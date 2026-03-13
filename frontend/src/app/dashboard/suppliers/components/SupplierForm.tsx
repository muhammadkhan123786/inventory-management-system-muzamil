"use client";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { ISupplier } from "../../.././../../../common/suppliers/ISuppliers.interface";
import { createSupplier, updateSupplier } from "@/hooks/useSupplier";
import SupplierIdentificationSection from "./sections/SupplierIdentificationSection";
import ContactInfoSection from "./sections/ContactInfoSection";
import BusinessAddressSection from "./sections/BusinessAddressSection";
import FinancialTaxSection from "./sections/FinancialTaxSection";
import BankPaymentSection from "./sections/BankPaymentSection";
import ProductsServicesSection from "./sections/ProductsServicesSection";
import CommercialTermsSection from "./sections/CommercialTermsSection";
import ComplianceDocSection from "./sections/ComplianceDocSection";
import OperationalInfoSection from "./sections/OperationalInfoSection";
import FormActions from "./sections/FormActions";
import DocumentPreviewModal from "./sections/DocumentPreviewModal";
interface SupplierFormProps {
  editData?: ISupplier;
  onBack: () => void;
}
const SupplierForm: React.FC<SupplierFormProps> = ({ editData, onBack }) => {
  const [documents, setDocuments] = useState<
    { id: number; file: File | null; existingUrl?: string }[]
  >([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "pdf">("image");
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    businessTypes: [],
    jobTitles: [],
    cities: [],
    countries: [],
    currencies: [],
    paymentMethods: [],
    productServices: [],
    categories: [],
    paymentTerms: [],
    pricingAgreements: [],
  });
  const [formData, setFormData] = useState({
    legalBusinessName: "",
    tradingName: "",
    businessRegNumber: "",
    taxRegNumber: "",
    businessTypeId: "",
    primaryContactName: "",
    jobTitleId: "",
    phoneNumber: "",
    emailAddress: "",
    website: "",
    registeredAddress: "",
    tradingAddress: "",
    cityId: "",
    stateCounty: "",
    postalCode: "",
    countryId: "",
    vatRegistered: "No",
    taxIdNumber: "",
    currencyId: "",
    paymentMethodId: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    sortCode: "",
    iban: "",
    swiftCode: "",
    productServiceId: "",
    categoryId: [],
    leadTime: "",
    moq: "",
    paymentTermId: "",
    pricingAgreementId: "",
    discountTerms: "",
    contractStartDate: "",
    contractEndDate: "",
    insuranceDetails: "",
    insuranceExpiryDate: "",
    hsCompliance: "No",
    qualityCertifications: "",
    orderContactName: "",
    orderContactEmail: "",
    returnsPolicy: "",
    warrantyTerms: "",
  });
  useEffect(() => {
    if (editData?.complianceDocumentation?.businessRegistrationCertificates) {
      const existingDocs =
        editData.complianceDocumentation.businessRegistrationCertificates.map(
          (url, index) => ({
            id: index + 1,
            file: null,
            existingUrl: url,
          }),
        );
      setDocuments(
        existingDocs.length > 0 ? existingDocs : [{ id: 1, file: null }],
      );
    } else {
      setDocuments([{ id: 1, file: null }]);
    }
  }, [editData]);
  useEffect(() => {
    let isMounted = true;

    const fetchDropdownData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      try {
        const [
          bizRes,
          jobRes,
          cityRes,
          countryRes,
          currRes,
          methRes,
          servRes,
          catRes,
          termRes,
          priceRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/business-types?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/job-titles?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/city?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/country?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/currencies?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/payment-method?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/product-services?filter=all`, { headers }).then(
            (r) => r.json(),
          ),
          fetch(`${baseUrl}/categories?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/payment-terms?filter=all`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${baseUrl}/pricing-agreement?filter=all`, { headers }).then(
            (r) => r.json(),
          ),
        ]);
        if (!isMounted) return;
        setDropdowns({
          businessTypes:
            bizRes.data?.map((i: any) => ({
              label: i.businessTypeName,
              value: i._id,
            })) || [],
          jobTitles:
            jobRes.data?.map((i: any) => ({
              label: i.jobTitleName || i.name,
              value: i._id,
            })) || [],
          cities:
            cityRes.data?.map((i: any) => ({
              label: i.cityName || i.name,
              value: i._id,
            })) || [],
          countries:
            countryRes.data?.map((i: any) => ({
              label: i.countryName || i.name,
              value: i._id,
            })) || [],
          currencies:
            currRes.data?.map((i: any) => ({
              label: `${i.currencyName} (${i.currencySymbol})`,
              value: i._id,
            })) || [],
          paymentMethods:
            methRes.data?.map((i: any) => ({
              label: i.paymentMethodName || i.name,
              value: i._id,
            })) || [],
          productServices:
            servRes.data?.map((i: any) => ({
              label: i.productServicesName || i.name,
              value: i._id,
            })) || [],
          categories:
            catRes.data?.map((i: any) => ({
              label: i.categoryName || i.name,
              value: i._id,
            })) || [],
          paymentTerms:
            termRes.data?.map((i: any) => ({
              label: i.paymentTerm || i.name,
              value: i._id,
            })) || [],
          pricingAgreements:
            priceRes.data?.map((i: any) => ({
              label: i.pricingAgreementName || i.name,
              value: i._id,
            })) || [],
        });
      } catch (err) {
        console.error("Error fetching supplier dropdowns:", err);
      }
    };
    fetchDropdownData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (editData) {
      const data = editData as any;
      console.log("Edit data received in form:", data);
      const existingCertificates =
        data.complianceDocumentation?.businessRegistrationCertificates ||
        data.businessRegistrationCertificates ||
        [];

      setFormData({
        legalBusinessName: data.legalBusinessName || "",
        tradingName: data.tradingName || "",
        businessRegNumber: data.businessRegNumber || "",
        taxRegNumber: data.taxRegNumber || data.vat || "",
        businessTypeId: data.businessTypeId || "",
        primaryContactName: data.primaryContactName || "",
        jobTitleId: data.jobTitleId || "",
        phoneNumber: data.phoneNumber || "",
        emailAddress: data.emailAddress || "",
        website: data.website || "",
        registeredAddress: data.registeredAddress || data.businessAddress || "",
        tradingAddress: data.tradingAddress || "",
        cityId: data.cityId || "",
        stateCounty: data.stateCounty || "",
        postalCode: data.postalCode || "",
        countryId: data.countryId || "",
        vatRegistered:
          data.vatRegistered === true || data.vatRegistered === "Yes"
            ? "Yes"
            : "No",
        taxIdNumber: data.taxIdNumber || "",
        currencyId: data.currencyId || "",
        paymentMethodId: data.paymentMethodId || "",
        bankName: data.bankName || "",
        accountHolderName: data.accountHolderName || "",
        accountNumber: data.accountNumber || "",
        sortCode: data.sortCode || "",
        iban: data.iban || "",
        swiftCode: data.swiftCode || "",
        productServiceId: data.productServiceId || "",
        categoryId: data.categoryId || "",
        leadTime: data.leadTime?.toString() || "",
        moq: data.moq?.toString() || "",
        paymentTermId: data.paymentTermId || "",
        pricingAgreementId: data.pricingAgreementId || "",
        discountTerms: data.discountTerms || "",
        contractStartDate: data.contractStartDate || "",
        contractEndDate: data.contractEndDate || "",
        insuranceDetails: data.insuranceDetails || "",
        insuranceExpiryDate: data.insuranceExpiryDate || "",
        hsCompliance:
          data.hsCompliance === true || data.hsCompliance === "Yes"
            ? "Yes"
            : "No",
        qualityCertifications: data.qualityCertifications || "",
        orderContactName: data.orderContactName || "",
        orderContactEmail: data.orderContactEmail || "",
        returnsPolicy: data.returnsPolicy || "",
        warrantyTerms: data.warrantyTerms || "",
      });

      if (existingCertificates.length > 0) {
        const existingDocs = existingCertificates.map(
          (url: string, index: number) => ({
            id: index + 1,
            file: null,
            existingUrl: url,
          }),
        );
        setDocuments(existingDocs);
      }
    }
  }, [editData]);

  const addDocument = () =>
    setDocuments([...documents, { id: Date.now(), file: null }]);
  const removeDocument = (id: number) =>
    documents.length > 1 &&
    setDocuments(documents.filter((doc) => doc.id !== id));
  const handleTriggerUpload = (id: number) => {
    fileInputRefs.current[id]?.click();
  };
  const handlePreviewDocument = (doc: {
    file: File | null;
    existingUrl?: string;
  }) => {
    let urlToPreview = "";
    if (doc.file) {
      urlToPreview = URL.createObjectURL(doc.file);
    } else if (doc.existingUrl) {
      urlToPreview = doc.existingUrl.startsWith("http")
        ? doc.existingUrl
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}${doc.existingUrl}`;
    }

    if (urlToPreview) {
      const ext = urlToPreview.toLowerCase().split(".").pop();
      setPreviewType(ext === "pdf" ? "pdf" : "image");
      setPreviewUrl(urlToPreview);
    }
  };

  const handleFileChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, file: selectedFile, existingUrl: undefined }
            : doc,
        ),
      );
    }
  };

  const handleChange = (e: any) => {
    const { name, type, value, selectedOptions } = e.target;

    if (name === "categoryId" || type === "select-multiple") {
      const values = Array.from(selectedOptions).map((opt: any) => opt.value);
      setFormData((prev) => ({ ...prev, [name]: values }));
      return;
    }

    if (name === "website") {
      const cleanedValue = value.replace(/^https?:\/\//, "").replace(/\/$/, "");
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const getCurrentUserId = () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            return user.id || user._id || "69564bc3886c7c0d91574dfd";
          } catch {
            return "69564bc3886c7c0d91574dfd";
          }
        }
        return "69564bc3886c7c0d91574dfd";
      };

      const currentUserId = getCurrentUserId();

      const payload: any = {
        userId: currentUserId,
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        supplierIdentification: {
          legalBusinessName: formData.legalBusinessName.trim(),
          businessRegNumber: formData.businessRegNumber.trim(),
          businessTypeId: formData.businessTypeId,
        },
        contactInformation: {
          primaryContactName: formData.primaryContactName.trim(),
          jobTitleId: formData.jobTitleId,
          phoneNumber: formData.phoneNumber.trim(),
          emailAddress: formData.emailAddress.trim(),
        },
        businessAddress: {
          businessAddress: formData.registeredAddress.trim(),
          city: formData.cityId,
          state: formData.stateCounty.trim(),
          country: formData.countryId,
          zipCode: formData.postalCode.trim(),
        },
        financialInformation: {
          vatRegistered: formData.vatRegistered === "Yes",
          taxIdentificationNumber: formData.taxIdNumber.trim(),
          paymentCurrencyId: formData.currencyId,
          paymentMethodId: formData.paymentMethodId,
        },
        productServices: {
          typeOfServiceId: formData.productServiceId,
          productCategoryIds: Array.isArray(formData.categoryId)
            ? formData.categoryId
            : formData.categoryId
              ? [formData.categoryId]
              : [],
          leadTimes: formData.leadTime,
          minimumOrderQuantity: formData.moq,
        },
        commercialTerms: {
          paymentTermsId: formData.paymentTermId,
          pricingAgreementId: formData.pricingAgreementId,
          contractStartDate: formData.contractStartDate,
        },
        complianceDocumentation: {
          businessRegistrationCertificates: documents
            .filter((doc) => doc.existingUrl && !doc.file)
            .map((doc) => doc.existingUrl) as string[],
          healthAndSafetyCompliance: formData.hsCompliance === "Yes",
        },
        operationalInformation: {},
      };

      if (formData.tradingName?.trim()) {
        payload.supplierIdentification.tradingName =
          formData.tradingName.trim();
      }
      if (formData.taxRegNumber?.trim()) {
        payload.supplierIdentification.vat = formData.taxRegNumber.trim();
        payload.financialInformation.vatNumber = formData.taxRegNumber.trim();
      }
      if (formData.website?.trim()) {
        const website = formData.website.startsWith("http")
          ? formData.website.trim()
          : `https://${formData.website.trim()}`;
        payload.contactInformation.website = website;
      }
      if (formData.tradingAddress?.trim()) {
        payload.businessAddress.tradingAddress = formData.tradingAddress.trim();
      }
      if (formData.bankName?.trim()) {
        payload.bankPaymentDetails = {
          bankName: formData.bankName.trim(),
          accountHolderName: formData.accountHolderName.trim(),
          accountNumber: formData.accountNumber.trim(),
        };
        if (formData.sortCode?.trim()) {
          payload.bankPaymentDetails.sortCode = formData.sortCode.trim();
        }
        if (formData.iban?.trim()) {
          payload.bankPaymentDetails.ibanNumber = formData.iban.trim();
        }
        if (formData.swiftCode?.trim()) {
          payload.bankPaymentDetails.swiftCode = formData.swiftCode.trim();
        }
      }
      if (formData.discountTerms?.trim()) {
        payload.commercialTerms.discountTerms = formData.discountTerms.trim();
      }
      if (formData.contractEndDate) {
        payload.commercialTerms.contractEndDate = formData.contractEndDate;
      }
      if (formData.insuranceDetails?.trim()) {
        payload.complianceDocumentation.insuranceDetails =
          formData.insuranceDetails.trim();
      }
      if (formData.insuranceExpiryDate) {
        payload.complianceDocumentation.insuranceExpiryDate =
          formData.insuranceExpiryDate;
      }
      if (formData.qualityCertifications?.trim()) {
        payload.complianceDocumentation.qualityCertificate =
          formData.qualityCertifications.trim();
      }
      if (formData.orderContactName?.trim()) {
        payload.operationalInformation.orderContactName =
          formData.orderContactName.trim();
      }
      if (formData.orderContactEmail?.trim()) {
        payload.operationalInformation.orderContactEmail =
          formData.orderContactEmail.trim();
      }
      if (formData.returnsPolicy?.trim()) {
        payload.operationalInformation.returnPolicy =
          formData.returnsPolicy.trim();
      }
      if (formData.warrantyTerms?.trim()) {
        payload.operationalInformation.warrantyTerms =
          formData.warrantyTerms.trim();
      }

      if (editData?._id) {
        payload._id = editData._id;
      } else {
        payload.createdAt = new Date().toISOString();
        payload.createdBy = currentUserId;
      }
      console.log("Payload to send:", JSON.stringify(payload, null, 2));
      const formDataToSend = new FormData();
      const appendToFormData = (obj: any, prefix = "") => {
        for (const [key, value] of Object.entries(obj)) {
          const fieldName = prefix ? `${prefix}[${key}]` : key;

          if (value === null || value === undefined) {
            continue;
          }

          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === "boolean") {
                formDataToSend.append(
                  `${fieldName}[${index}]`,
                  item ? "true" : "false",
                );
              } else if (typeof item === "object" && item !== null) {
                formDataToSend.append(
                  `${fieldName}[${index}]`,
                  JSON.stringify(item),
                );
              } else {
                formDataToSend.append(`${fieldName}[${index}]`, String(item));
              }
            });
          } else if (typeof value === "object" && !(value instanceof File)) {
            appendToFormData(value, fieldName);
          } else if (typeof value === "boolean") {
            formDataToSend.append(fieldName, value ? "true" : "false");
          } else {
            formDataToSend.append(fieldName, String(value));
          }
        }
      };
      appendToFormData(payload);
      const hasFiles = documents.some((doc) => doc.file);
      if (hasFiles) {
        documents.forEach((doc) => {
          if (doc.file) {
            console.log(`Appending file: ${doc.file.name}`);
            formDataToSend.append(
              "businessRegistrationCertificatesFile",
              doc.file,
            );
          }
        });
      }
      console.log("FormData entries:");
      for (const [key, value] of (formDataToSend as any).entries()) {
        if (value instanceof File) {
          console.log(
            key,
            `File: ${value.name} (${value.type}, ${value.size} bytes)`,
          );
        } else {
          console.log(key, value);
        }
      }
      if (editData?._id) {
        await updateSupplier(editData._id, formDataToSend);
      } else {
        await createSupplier(formDataToSend);
      }
      alert(
        editData
          ? "Supplier updated successfully!"
          : "Supplier created successfully!",
      );
      onBack();
    } catch (err: any) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);

      let errorMessage = `Failed to ${editData ? "update" : "create"} supplier.\n\n`;

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage += err.response.data;
        } else if (err.response.data.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage +=
              "Validation errors:\n" +
              err.response.data.message
                .map((err: any) => `• ${err.message || JSON.stringify(err)}`)
                .join("\n");
          } else if (typeof err.response.data.message === "string") {
            try {
              const parsed = JSON.parse(err.response.data.message);
              if (Array.isArray(parsed)) {
                errorMessage +=
                  "Validation errors:\n" +
                  parsed
                    .map(
                      (err: any) => `• ${err.message || JSON.stringify(err)}`,
                    )
                    .join("\n");
              } else {
                errorMessage += err.response.data.message;
              }
            } catch {
              errorMessage += err.response.data.message;
            }
          } else {
            errorMessage += JSON.stringify(err.response.data, null, 2);
          }
        }
      } else if (err.message) {
        errorMessage += err.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getDocumentDisplay = (doc: {
    file: File | null;
    existingUrl?: string;
  }) => {
    if (doc.file) {
      return `Selected: ${doc.file.name}`;
    }
    if (doc.existingUrl) {
      const fileName = doc.existingUrl.split("/").pop();
      return `Existing: ${fileName}`;
    }
    return "PDF, JPG or PNG (Max. 5MB)";
  };
  return (
    <form onSubmit={handleSubmit} className="w-full min-h-screen pb-20">
      <div className="self-stretch h-32 pl-8 pt-8 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex flex-col justify-start items-start mb-8">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex justify-center items-center rounded-[10px] hover:bg-white/20 transition-all backdrop-blur-md group"
          >
            <ArrowLeft
              size={20}
              className="text-white group-hover:-translate-x-1 transition-transform"
            />
          </button>

          <div className="relative flex justify-center items-center h-20 w-20">
            <div className="flex justify-center items-center animate-[spin_13s_linear_infinite]">
              <div className="absolute w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 rotate-[59.56deg]" />
              <div className="relative z-10">
                <Building2 size={36} className="text-white" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-1">
            <h1 className="text-white text-4xl font-bold font-sans leading-10 drop-shadow-md">
              {editData ? "Update Supplier" : "Add New Supplier"}
            </h1>
            <p className="text-white/90 text-lg font-normal font-sans leading-7">
              Complete all required fields to {editData ? "update" : "register"}{" "}
              a new supplier
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        <SupplierIdentificationSection
          formData={formData}
          handleChange={handleChange}
          dropdowns={dropdowns}
        />

        <ContactInfoSection
          formData={formData}
          handleChange={handleChange}
          dropdowns={dropdowns}
        />

        <BusinessAddressSection
          formData={formData}
          handleChange={handleChange}
          dropdowns={dropdowns}
        />

        <FinancialTaxSection
          formData={formData}
          handleChange={handleChange}
          dropdowns={dropdowns}
        />
        <BankPaymentSection formData={formData} handleChange={handleChange} />

        <ProductsServicesSection
          formData={formData}
          handleChange={handleChange}
          dropdowns={dropdowns}
        />

        <CommercialTermsSection
          formData={formData}
          handleChange={handleChange}
          dropdowns={dropdowns}
        />
        <ComplianceDocSection
          formData={formData}
          handleChange={handleChange}
          documents={documents}
          addDocument={addDocument}
          removeDocument={removeDocument}
          handleTriggerUpload={handleTriggerUpload}
          handleFileChange={handleFileChange}
          handlePreviewDocument={handlePreviewDocument}
          getDocumentDisplay={getDocumentDisplay}
          fileInputRefs={fileInputRefs}
        />
        <OperationalInfoSection
          formData={formData}
          handleChange={handleChange}
        />
        <FormActions
          onBack={onBack}
          isSubmitting={isSubmitting}
          editData={editData}
        />
      </div>
      <style jsx global>{`
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-left: 4px;
          margin-bottom: 6px;
        }
        .form-input-style {
          width: 100%;
          padding: 14px 20px;
          border-radius: 14px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          outline: none;
          transition: all 0.2s;
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }
        .form-input-style:focus {
          background-color: white;
          border-color: #a855f7;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.08);
        }
        .form-input-style::placeholder {
          color: #cbd5e1;
        }
        .form-input-style:disabled {
          background-color: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
      {previewUrl && (
        <DocumentPreviewModal
          previewUrl={previewUrl}
          previewType={previewType}
          onClose={() => {
            setPreviewUrl(null);
            if (previewUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(previewUrl);
            }
          }}
        />
      )}
    </form>
  );
};
export default SupplierForm;
