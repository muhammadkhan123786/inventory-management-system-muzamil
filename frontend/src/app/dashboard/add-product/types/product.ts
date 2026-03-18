// ─── Category Types ────────────────────────────────────────────────────────────

export interface DynamicField {
  _id?: string;
  name: string;
  label: string;
  type: string;
  options?: string[];
  attributeName?: string;
  isRequired?: boolean;
  attributes?: Record<string, any>;
}

export interface CategoryNode {
  _id: string;
  categoryName: string;
  parentId: string | null;
  children?: CategoryNode[];
  fields?: DynamicField[];
}

export interface CategoryStepProps {
  categories: CategoryNode[];
  selectedPath: string[];
  selectedCategories: CategoryNode[];
  getCategoriesAtLevel: (level: number) => CategoryNode[];
  handleCategorySelect: (level: number, value: string) => void;
  attributes?: Record<string, any>;
  onFullPathSelect?: (pathIds: string[]) => void;
  attributeCategoryIds?: Set<string>;
  attributeIdsLoading?: boolean;
}

// ─── Dropdown Types ────────────────────────────────────────────────────────────

export interface DropdownOption {
  value: string;
  label: string;
}

export interface FourDropdownData {
  taxes: DropdownOption[];
  currencies: DropdownOption[];
  warehouses: DropdownOption[];
  warehouseStatus: DropdownOption[];
  productStatus: DropdownOption[];
  conditions: DropdownOption[];
}

// ─── Attribute Types ───────────────────────────────────────────────────────────

export interface Attribute {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "checkbox" | "radio";
  options?: DropdownOption[];
  required?: boolean;
  categoryId: string;
  isForSubcategories: boolean;
}

// ─── Image Types ───────────────────────────────────────────────────────────────

export interface UploadedImage {
  id: string;
  preview: string;
  file?: File;
  progress: number;
  isUploading: boolean;
}

export interface ImageItem {
  file: File;
  preview: string;
  name: string;
  base64?: string;
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AIResponse {
  success: boolean;
  imageCount: number;
  imageUrls: string[];
  ai: {
    shortDescription: string;
    description: string;
    /** Comma-separated string – same format as keywords */
    tags: string;
    keywords: string;
  };
}

// ─── Form Data ─────────────────────────────────────────────────────────────────

/**
 * Both `keywords` and `tags` are stored as comma-separated strings.
 * They are only split into arrays at display/submit time.
 */
export interface ProductFormData {
  productName: string;
  sku: string;
  barcode: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  description: string;
  shortDescription: string;
  /** Comma-separated: "travel, scooter, mobility" */
  keywords: string;
  /** Comma-separated: "sale, featured, new" */
  tags: string;
  images: string[];
  variants: any[];
}

// ─── Step Props ────────────────────────────────────────────────────────────────

/**
 * Tags are now stored/handled identically to keywords (comma-separated string).
 * No external tag state — the card manages its own input internally.
 */
export interface BasicInfoStepProps {
  formData: ProductFormData;
  images: ImageItem[];
  onInputChange: (field: string, value: string) => void;
  onImageUpload: (files: FileList | File[]) => Promise<void> | void;
  onRemoveImage: (index: number) => void;
  setImage: (urls: string[]) => void;
}

// ─── Hook Props ────────────────────────────────────────────────────────────────

export interface UseProductFormProps {
  initialData: ProductFormData;
  onSubmit: (data: any) => void;
  categories: CategoryNode[];
}

// ─── Level Styles ──────────────────────────────────────────────────────────────

export const LEVEL_STYLES = [
  {
    badge: "bg-purple-500 text-white",
    border: "border-purple-300",
    focus: "focus:border-purple-500 focus:ring-purple-200",
    label: "Main Category",
    subCat:
      "bg-purple-100 text-purple-700 border border-purple-300 px-3 py-1.5 text-sm",
  },
  {
    badge: "bg-cyan-500 text-white",
    border: "border-cyan-300",
    focus: "focus:border-cyan-500 focus:ring-cyan-200",
    label: "Subcategory",
    subCat:
      "bg-cyan-200 text-cyan-700 border border-cyan-300 px-3 py-1.5 text-sm",
  },
  {
    badge: "bg-teal-500 text-white",
    border: "border-teal-300",
    focus: "focus:border-teal-500 focus:ring-teal-200",
    label: "Sub-subcategory",
    subCat:
      "bg-teal-100 text-teal-700 border border-teal-300 px-3 py-1.5 text-sm",
  },
] as const;

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";