import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { Building2 } from "lucide-react";

interface SupplierIdentificationSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  dropdowns: any;
}

const SupplierIdentificationSection: React.FC<
  SupplierIdentificationSectionProps
> = ({ formData, handleChange, dropdowns }) => {
  return (
    <FormSection
      number={1}
      title="Supplier Identification"
      icon={Building2}
      theme="blue"
      headerClassName="bg-linear-to-r from-blue-50 to-indigo-50"
      iconClassName="text-blue-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <FormField
          label="Legal Business Name *"
          name="legalBusinessName"
          value={formData.legalBusinessName}
          onChange={handleChange}
          className="md:col-span-2"
          required
        />
        <FormField
          label="Trading Name (if different)"
          name="tradingName"
          value={formData.tradingName}
          onChange={handleChange}
        />
        <FormField
          label="Business Registration Number *"
          name="businessRegNumber"
          value={formData.businessRegNumber}
          onChange={handleChange}
          required
        />
        <FormField
          label="VAT / Tax Registration Number"
          name="taxRegNumber"
          value={formData.taxRegNumber}
          onChange={handleChange}
        />
        <FormField
          label="Business Type *"
          name="businessTypeId"
          type="select"
          value={formData.businessTypeId}
          onChange={handleChange}
          options={dropdowns.businessTypes}
          required
        />
      </div>
    </FormSection>
  );
};

export default SupplierIdentificationSection;
