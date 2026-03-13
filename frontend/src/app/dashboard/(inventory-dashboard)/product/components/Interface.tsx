export interface Product {
  _id: string;
  productName: string;
  SKU: string;
  productDes: string;
  categoryId: string;
  taxId: string;
  currencyId: string;
  vendorId: string;
  MPN?: string;
  upcEan?: string;
  isActive: boolean;
  warrantyDuration: number;
  returnPeriods: number;
  leadTime: number;
  stock: number;
  channelIds: string[];
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownData {
  categories: DropdownOption[];
  taxes: DropdownOption[];
  currencies: DropdownOption[];
  vendors: DropdownOption[];
  channels: DropdownOption[];
}

export interface ProductTable {
  _id: string;
  productName: string;
  SKU: string;
  stock: number;
  leadTime: number;
  isActive: boolean;
}

export interface TableColumn<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

export interface PaginatedResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}





// types/product.ts
export interface Category {
  id: string;
  name: string;
  level: number;
  parentId?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categories: {
    level1: Category;
    level2: Category;
    level3: Category;
  };
  price: number;
  costPrice: number;
  stockQuantity: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  weight: string;
  dimensions: string;
  manufacturer: string;
  warranty: string;
  rating: number;
  totalReviews: number;
  imageUrl?: string;
  featured: boolean;
  status: 'active' | 'inactive' | 'discontinued';
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  reorderQuantity: number;
}

export interface ProductStats {
  total: number;
  activeCount: number;
  inactiveCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  featuredCount: number;
}