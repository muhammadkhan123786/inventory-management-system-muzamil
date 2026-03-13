// components/steps/variant-sections/WarrantySection.tsx
import { Input } from '@/components/form/Input';
import { Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";

interface WarrantySectionProps {
  currentVariant: any;
  onVariantFieldChange: (field: string, value: any) => void;
}

export function WarrantySection({
  currentVariant,
  onVariantFieldChange,
}: WarrantySectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Warranty Type
          </label>
          <Input
            type="text"
            value={currentVariant.warranty}
            onChange={(e) => onVariantFieldChange('warranty', e.target.value)}
            placeholder="e.g., Manufacturer Warranty, Extended Warranty"
            className="border-2 border-purple-200 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Warranty Period
          </label>
          <Select
            value={currentVariant.warrantyPeriod}
            onValueChange={(value) => onVariantFieldChange('warrantyPeriod', value)}
          >
            <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500">
              <SelectValue placeholder="Select warranty period..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No Warranty">No Warranty</SelectItem>
              <SelectItem value="3-months">3 Months</SelectItem>
              <SelectItem value="6-months">6 Months</SelectItem>
              <SelectItem value="1-year">1 Year</SelectItem>
              <SelectItem value="2-years">2 Years</SelectItem>
              <SelectItem value="3-years">3 Years</SelectItem>
              <SelectItem value="5-years">5 Years</SelectItem>
              <SelectItem value="lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}