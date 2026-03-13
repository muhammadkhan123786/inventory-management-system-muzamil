export interface ProductRegistrationForm {
  name: string;
  make: string;
  model: string;
  year: number;
  color: string;
  purchaseDate: string;
  serialNumber: string;
  ownershipType: 'customer-owned' | 'showroom';
  customerId: string;
  category?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  description?: string;
  warranty?: string;
  weight?: string;
}

export interface FormField {
  name: keyof ProductRegistrationForm;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  gridCols?: number;
}