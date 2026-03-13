import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { CreditCard } from "lucide-react";

interface BankPaymentSectionProps {
  formData: any;
  handleChange: (e: any) => void;
}

const BankPaymentSection: React.FC<BankPaymentSectionProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <FormSection
      number={5}
      title="Bank / Payment Details"
      icon={CreditCard}
      theme="red"
      headerClassName="bg-linear-to-r from-red-50 to-rose-50"
      iconClassName="text-red-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <FormField
          label="Bank Name"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
        />
        <FormField
          label="Account Holder Name"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
        />
        <FormField
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
        />
        <FormField
          label="Sort Code / Routing Number"
          name="sortCode"
          value={formData.sortCode}
          onChange={handleChange}
        />
        <FormField
          label="IBAN"
          name="iban"
          value={formData.iban}
          onChange={handleChange}
        />
        <FormField
          label="SWIFT / BIC Code"
          name="swiftCode"
          value={formData.swiftCode}
          onChange={handleChange}
        />
      </div>
    </FormSection>
  );
};

export default BankPaymentSection;
