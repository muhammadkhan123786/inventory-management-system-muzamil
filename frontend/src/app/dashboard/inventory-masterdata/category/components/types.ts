export type CategoryStatus = 'active' | 'inactive' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: CategoryStatus;
  parentId?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}
