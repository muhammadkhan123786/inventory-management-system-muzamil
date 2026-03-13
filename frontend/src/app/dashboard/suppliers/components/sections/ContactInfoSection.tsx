import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { Users } from "lucide-react";

interface ContactInfoSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  dropdowns: any;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  formData,
  handleChange,
  dropdowns,
}) => {
  return (
    <FormSection
      number={2}
      title="Contact Information"
      icon={Users}
      theme="purple"
      headerClassName="bg-linear-to-r from-purple-50 to-pink-50"
      iconClassName="text-purple-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <FormField
          label="Primary Contact Name *"
          name="primaryContactName"
          value={formData.primaryContactName}
          onChange={handleChange}
          required
        />
        <FormField
          label="Job Title *"
          name="jobTitleId"
          type="select"
          value={formData.jobTitleId}
          onChange={handleChange}
          options={dropdowns.jobTitles}
          required
        />
        <FormField
          label="Phone Number *"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <FormField
          label="Email Address *"
          name="emailAddress"
          type="email"
          value={formData.emailAddress}
          onChange={handleChange}
          required
        />
        <FormField
          label="Website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="md:col-span-2"
        />
      </div>
    </FormSection>
  );
};

export default ContactInfoSection;
