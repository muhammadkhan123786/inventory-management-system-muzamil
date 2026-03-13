import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductRegistrationForm } from '../app/dashboard/(inventory-dashboard)/product-register/types/productRegistration';
import { mockCustomers } from '../app/dashboard/(inventory-dashboard)/product-register/data/customers';

export const useProductRegistration = () => {
  const router = useRouter();
  
  const initialFormData: ProductRegistrationForm = {
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    purchaseDate: '',
    serialNumber: '',
    ownershipType: 'customer-owned',
    customerId: ''
  };

  const [formData, setFormData] = useState<ProductRegistrationForm>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ProductRegistrationForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateProductId = (): string => {
    const randomNum = Math.floor(Math.random() * 1000);
    const categoryPrefix = formData.category?.charAt(0).toUpperCase() || 'P';
    return `${categoryPrefix}${String(randomNum).padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, you would make an API call here
      // await api.registerProduct(formData);
      
      const productId = generateProductId();
      
      toast.success(`Product ${productId} registered successfully!`, {
        description: `${formData.name} has been added to the system.`
      });

      // Reset form
      setFormData(initialFormData);
      
      // Navigate after success
      setTimeout(() => {
        router.push('/products');
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to register product', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const customers = mockCustomers;

  return {
    formData,
    handleInputChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    customers
  };
};