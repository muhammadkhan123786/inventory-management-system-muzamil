import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { ClipboardList } from "lucide-react";

interface OperationalInfoSectionProps {
  formData: any;
  handleChange: (e: any) => void;
}

const OperationalInfoSection: React.FC<OperationalInfoSectionProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <FormSection
      number={9}
      title="Operational Information"
      icon={ClipboardList}
      theme="rose"
      headerClassName="bg-linear-to-r from-pink-50 to-rose-50"
      iconClassName="text-pink-600"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <FormField
            label="Order Contact Name"
            name="orderContactName"
            value={formData.orderContactName}
            onChange={handleChange}
          />
          <FormField
            label="Order Contact Email"
            name="orderContactEmail"
            type="email"
            value={formData.orderContactEmail}
            onChange={handleChange}
          />
        </div>
        <FormField
          label="Returns Policy"
          name="returnsPolicy"
          type="textarea"
          value={formData.returnsPolicy}
          onChange={handleChange}
        />
        <FormField
          label="Warranty Terms"
          name="warrantyTerms"
          type="textarea"
          value={formData.warrantyTerms}
          onChange={handleChange}
        />
      </div>
    </FormSection>
  );
};

export default OperationalInfoSection;
