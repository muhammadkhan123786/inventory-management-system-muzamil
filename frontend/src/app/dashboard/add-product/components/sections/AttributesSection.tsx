// components/steps/variant-sections/AttributesSection.tsx
import { Star, Package, PackageCheck, CheckCircle } from 'lucide-react';
import { renderDynamicField } from '../utils/RenderDynamicField';
import { DynamicField } from '../../types/product';

interface AttributesSectionProps {
  attributes: DynamicField[];
  currentVariant: any;
  onAttributeChange: (fieldId: string, value: any) => void;
}

export function AttributesSection({
  attributes = [],
  currentVariant,
  onAttributeChange,
}: AttributesSectionProps) {
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return <Star className="h-4 w-4 text-blue-500" />;
      case 'number': return <PackageCheck className="h-4 w-4 text-green-500" />;
      case 'select': 
      case 'dropdown': return <Package className="h-4 w-4 text-purple-500" />;
      case 'checkbox': return <CheckCircle className="h-4 w-4 text-amber-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((field, index) => (
          <div key={field._id || `field-${index}`} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.attributeName}
              {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            {renderDynamicField(
              field,
              currentVariant.attributes?.[field._id!],
              (value) => onAttributeChange(field._id!, value)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}