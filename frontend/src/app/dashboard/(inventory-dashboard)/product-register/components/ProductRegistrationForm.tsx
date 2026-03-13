'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import { Label } from '@/components/form/Label';
import { Button } from '@/components/form/CustomButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/form/Select';
import { RadioGroup, RadioGroupItem } from '@/components/form/FormRadioGroup';
import { ProductRegistrationForm as ProductForm } from '../types/productRegistration';
import { mockCustomers } from '../data/customers';
import { productMakes, colors } from '../data/productTypes';
import { cn } from '@/lib/utils';

interface ProductRegistrationFormProps {
  formData: ProductForm;
  onInputChange: (field: keyof ProductForm, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const ProductRegistrationForm: React.FC<ProductRegistrationFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isSubmitting = false,
  onCancel
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }));

  const customerOptions = mockCustomers.map(customer => ({
    value: customer.id,
    label: customer.name
  }));

  const makeOptions = productMakes.map(make => ({
    value: make,
    label: make
  }));

  const colorOptions = colors.map(color => ({
    value: color,
    label: color
  }));

  const ownershipOptions = [
    { value: 'customer-owned', label: 'Customer Owned' },
    { value: 'showroom', label: 'Showroom' }
  ];

  // Helper function to handle input changes
  const handleInputChange = (field: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'year') {
      onInputChange(field, parseInt(e.target.value));
    } else {
      onInputChange(field, e.target.value);
    }
  };

  // Helper function to handle select changes
  const handleSelectChange = (field: keyof ProductForm) => (value: string) => {
    if (field === 'year') {
      onInputChange(field, parseInt(value));
    } else {
      onInputChange(field, value);
    }
  };

  // Helper function to handle radio changes
  const handleRadioChange = (value: string) => {
    onInputChange('ownershipType', value as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Part Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Part Name <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="e.g., Pride Victory 10"
                required
                className="w-full"
              />
            </div>

            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="make" className="text-sm font-medium">
                Make <span className="text-[#ef4444]">*</span>
              </Label>
              <Select value={formData.make} onValueChange={handleSelectChange('make')} required>
                <SelectTrigger id="make">
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {makeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                Model <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={handleInputChange('model')}
                placeholder="e.g., Victory 10"
                required
                className="w-full"
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">
                Year <span className="text-[#ef4444]">*</span>
              </Label>
              <Select value={String(formData.year)} onValueChange={handleSelectChange('year')} required>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-medium">
                Color <span className="text-[#ef4444]">*</span>
              </Label>
              <Select value={formData.color} onValueChange={handleSelectChange('color')} required>
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serial Number */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="serialNumber" className="text-sm font-medium">
                Serial Number <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange('serialNumber')}
                placeholder="e.g., PV10-2023-001"
                required
                className="w-full"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate" className="text-sm font-medium">
                Purchase Date <span className="text-[#ef4444]">*</span>
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleInputChange('purchaseDate')}
                required
                className="w-full"
              />
            </div>

            {/* Customer/Owner */}
            <div className="space-y-2">
              <Label htmlFor="customerId" className="text-sm font-medium">
                Owner/Customer <span className="text-[#ef4444]">*</span>
              </Label>
              <Select value={formData.customerId} onValueChange={handleSelectChange('customerId')} required>
                <SelectTrigger id="customerId">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ownership Type */}
            <div className="md:col-span-2 space-y-3">
              <Label className="text-sm font-medium">
                Ownership Type <span className="text-[#ef4444]">*</span>
              </Label>
              <RadioGroup 
                value={formData.ownershipType} 
                onValueChange={handleRadioChange}
                className="flex flex-col sm:flex-row gap-3"
                required
              >
                {ownershipOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`ownership-${option.value}`}
                    />
                    <Label 
                      htmlFor={`ownership-${option.value}`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1",
                "bg-[#4f46e5] hover:bg-[#4338ca] text-white",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Registering...' : 'Register Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};