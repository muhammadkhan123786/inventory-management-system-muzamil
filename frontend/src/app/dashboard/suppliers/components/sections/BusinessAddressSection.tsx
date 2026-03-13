import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { MapPin } from "lucide-react";

interface BusinessAddressSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  dropdowns: any;
}

const BusinessAddressSection: React.FC<BusinessAddressSectionProps> = ({
  formData,
  handleChange,
  dropdowns,
}) => {
  return (
    <FormSection
      number={3}
      title="Business Address"
      icon={MapPin}
      theme="green"
      headerClassName="bg-linear-to-r from-green-50 to-emerald-50"
      iconClassName="text-green-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <FormField
          label="Registered Address *"
          name="registeredAddress"
          value={formData.registeredAddress}
          onChange={handleChange}
          className="md:col-span-2"
          required
        />
        <FormField
          label="Trading Address (if different)"
          name="tradingAddress"
          value={formData.tradingAddress}
          onChange={handleChange}
          className="md:col-span-2"
        />
        <FormField
          label="City *"
          name="cityId"
          value={formData.cityId}
          onChange={handleChange}
          required
        />
        <FormField
          label="State / County *"
          name="stateCounty"
          value={formData.stateCounty}
          onChange={handleChange}
          required
        />
        <FormField
          label="Postal / ZIP Code *"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          required
        />
        <FormField
          label="Country *"
          name="countryId"
          value={formData.countryId}
          onChange={handleChange}
          required
        />
      </div>
    </FormSection>
  );
};

export default BusinessAddressSection;
