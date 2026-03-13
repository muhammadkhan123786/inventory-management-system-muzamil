'use client';

import { ProductRegistrationHeader } from './ProductRegistrationHeader';
import { ProductRegistrationForm } from './ProductRegistrationForm';
import { useProductRegistration } from '@/hooks/useProductRegistration';
import { useRouter } from 'next/navigation';

export default function ProductRegistrationPage() {
  const router = useRouter();
  const {
    formData,
    handleInputChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    customers
  } = useProductRegistration();

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <ProductRegistrationHeader />
        
        <ProductRegistrationForm
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />

        {/* Additional Info Section (Optional) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Quick Tips</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Ensure the serial number matches the physical product</li>
            <li>• Verify customer details before submission</li>
            <li>• Take photos of the product for documentation</li>
            <li>• Check warranty information if applicable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}