import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { Landmark } from "lucide-react";

interface FinancialTaxSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  dropdowns: any;
}

const FinancialTaxSection: React.FC<FinancialTaxSectionProps> = ({
  formData,
  handleChange,
  dropdowns,
}) => {
  return (
    <FormSection
      number={4}
      title="Financial & Tax Information"
      icon={Landmark}
      theme="orange"
      headerClassName="bg-linear-to-r from-orange-50 to-amber-50"
      iconClassName="text-orange-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium">VAT Registered</label>
          <div className="flex gap-4 mt-2">
            {["Yes", "No"].map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <input
                  type="radio"
                  name="vatRegistered"
                  value={opt}
                  checked={formData.vatRegistered === opt}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />{" "}
                {opt}
              </label>
            ))}
          </div>
        </div>
        <FormField
          label="VAT Number"
          name="taxRegNumber"
          value={formData.taxRegNumber}
          onChange={handleChange}
          disabled={formData.vatRegistered === "No"}
        />
        <FormField
          label="Tax Identification Number *"
          name="taxIdNumber"
          value={formData.taxIdNumber}
          onChange={handleChange}
          required
        />
        <FormField
          label="Payment Currency *"
          name="currencyId"
          type="select"
          value={formData.currencyId}
          onChange={handleChange}
          options={dropdowns.currencies}
          required
        />
        <FormField
          label="Preferred Payment Method *"
          name="paymentMethodId"
          type="select"
          value={formData.paymentMethodId}
          onChange={handleChange}
          options={dropdowns.paymentMethods}
          className="md:col-span-2
         [&_select]:bg-transparent! [&_input]:bg-transparent!
         [&_select]:border [&_select]:border-gray-300
         [&_select]:focus:outline-none [&_select]:focus:ring-2 [&_select]:focus:ring-orange-500
         [&_input]:border [&_input]:border-gray-300
         [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-orange-500"
          required
        />
      </div>
    </FormSection>
  );
};

export default FinancialTaxSection;
