import React from "react";
import FormSection from "../FormSection";
import FormField from "../FormInput";
import { Package } from "lucide-react";

interface ProductsServicesSectionProps {
  formData: any;
  handleChange: (e: any) => void;
  dropdowns: any;
}

const ProductsServicesSection: React.FC<ProductsServicesSectionProps> = ({
  formData,
  handleChange,
  dropdowns,
}) => {
  return (
    <FormSection
      number={6}
      title="Products / Services Supplied"
      icon={Package}
      theme="indigo"
      headerClassName="bg-linear-to-r from-indigo-50 to-purple-50"
      iconClassName="text-indigo-600"
    >
      <div className="space-y-6">
        <FormField
          label="Type of Products or Services *"
          name="productServiceId"
          type="select"
          value={formData.productServiceId}
          onChange={handleChange}
          options={dropdowns.productServices}
          required
        />
        <FormField
          label="Product Categories *"
          name="categoryId"
          type="select"
          multiple={true}
          value={formData.categoryId}
          onChange={handleChange}
          options={dropdowns.categories}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <FormField
            label="Lead Time (days) *"
            name="leadTime"
            type="number"
            value={formData.leadTime}
            onChange={handleChange}
            placeholder="5"
            required
          />
          <FormField
            type="number"
            label="Minimum Order Quantity"
            name="moq"
            value={formData.moq}
            onChange={handleChange}
            placeholder="MOQ"
          />
        </div>
      </div>
    </FormSection>
  );
};

export default ProductsServicesSection;
