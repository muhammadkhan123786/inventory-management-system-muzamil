import { LucideIcon } from 'lucide-react';

export interface FormData {
  // Basic Info
  productName: string;
  sku: string;
  barcode: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  description: string;
  shortDescription: string;
  keywords: string;

  // Pricing
  costPrice: string;
  sellingPrice: string;
  retailPrice: string;
  discountPercentage: string;
  taxRate: string;
  vatExempt: boolean;
  
  // Inventory
  stockQuantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  reorderPoint: string;
  stockLocation: string;
  warehouse: string;
  binLocation: string;
  
  // Specifications
  weight: string;
  length: string;
  width: string;
  height: string;
  color: string;
  material: string;
  
  // Additional Info
  warranty: string;
  warrantyPeriod: string;
  condition: 'new' | 'refurbished' | 'used' | 'damaged';
  status: 'active' | 'inactive' | 'discontinued' | 'out-of-stock';
  featured: boolean;
  
  // SEO & Marketing
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface Step {
  number: number;
  title: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  bgGradient: string;
  borderGradient: string;
}

export interface WarehouseOption {
  value: string;
  label: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface ConditionOption {
  value: string;
  label: string;
}

export const initialFormData: FormData = {
  productName: '',
  sku: '',
  barcode: '',
  brand: '',
  manufacturer: '',
  modelNumber: '',
  description: '',
  shortDescription: '',
  keywords: '',
  costPrice: '',
  sellingPrice: '',
  retailPrice: '',
  discountPercentage: '',
  taxRate: '20',
  vatExempt: false,
  stockQuantity: '',
  minStockLevel: '',
  maxStockLevel: '',
  reorderPoint: '',
  stockLocation: '',
  warehouse: '',
  binLocation: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  color: '',
  material: '',
  warranty: '',
  warrantyPeriod: '',
  condition: 'new',
  status: 'active',
  featured: false,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: ''
};

export const STEPS: Step[] = [
  { 
    number: 1, 
    title: 'Category', 
    icon: Layers, 
    color: 'purple',
    gradient: 'from-purple-600 to-pink-600',
    bgGradient: 'from-purple-50 via-pink-50 to-rose-50',
    borderGradient: 'from-purple-500 via-pink-500 to-rose-500'
  },
  { 
    number: 2, 
    title: 'Basic Info', 
    icon: FileText, 
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-600',
    bgGradient: 'from-blue-50 via-cyan-50 to-sky-50',
    borderGradient: 'from-blue-500 via-cyan-500 to-sky-500'
  },
  // { 
  //   number: 3, 
  //   title: 'Pricing', 
  //   icon: DollarSign, 
  //   color: 'green',
  //   gradient: 'from-green-600 to-emerald-600',
  //   bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
  //   borderGradient: 'from-green-500 via-emerald-500 to-teal-500'
  // },
  // { 
  //   number: 4, 
  //   title: 'Inventory', 
  //   icon: Warehouse, 
  //   color: 'orange',
  //   gradient: 'from-orange-600 to-amber-600',
  //   bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
  //   borderGradient: 'from-orange-500 via-amber-500 to-yellow-500'
  // },
  { 
    number: 3, 
    title: 'Specifications', 
    icon: Ruler, 
    color: 'orange',
    gradient: 'from-orange-600 to-amber-600',
    bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
    borderGradient: 'from-orange-500 via-amber-500 to-yellow-500'
  }
];


// Import icons dynamically
import { 
  Layers,
  FileText,
  DollarSign,
  Warehouse,
  Ruler
} from 'lucide-react';