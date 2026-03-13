import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { FileText } from "lucide-react";

interface CommercialTermsSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  dropdowns: any;
}

const CommercialTermsSection: React.FC<CommercialTermsSectionProps> = ({
  formData,
  handleChange,
  dropdowns,
}) => {
  return (
    <FormSection
      number={7}
      title="Commercial Terms"
      icon={FileText}
      theme="sky"
      headerClassName="bg-linear-to-r from-cyan-50 to-blue-50"
      iconClassName="text-cyan-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <FormField
          label="Payment Terms *"
          name="paymentTermId"
          type="select"
          value={formData.paymentTermId}
          onChange={handleChange}
          options={dropdowns.paymentTerms}
          required
        />
        <FormField
          label="Pricing Agreement *"
          name="pricingAgreementId"
          type="select"
          value={formData.pricingAgreementId}
          onChange={handleChange}
          options={dropdowns.pricingAgreements}
          required
        />
        <FormField
          label="Discount Terms"
          name="discountTerms"
          value={formData.discountTerms}
          onChange={handleChange}
          placeholder="Volume based discount"
          className="md:col-span-2"
        />
        <FormField
          label="Contract Start Date *"
          name="contractStartDate"
          type="date"
          value={formData.contractStartDate}
          onChange={handleChange}
          required
        />
        <FormField
          label="Contract End Date"
          name="contractEndDate"
          type="date"
          value={formData.contractEndDate}
          onChange={handleChange}
          min={formData.contractStartDate}
        />
      </div>
    </FormSection>
  );
};

export default CommercialTermsSection;
