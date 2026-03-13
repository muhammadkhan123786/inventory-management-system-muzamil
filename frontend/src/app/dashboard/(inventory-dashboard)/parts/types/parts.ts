export interface Part {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  available: boolean;
  category?: string;
  location?: string;
  minimumStock?: number;
  description?: string;
}

export interface PartsStats {
  totalParts: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

export interface StatCardData {
  label: string;
  value: string | number;
  gradient: string;
  icon: React.ComponentType;
}