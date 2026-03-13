import { sub } from "framer-motion/client";


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

export interface CategorySelection {
  level1: string;
  level2: string;
  level3: string;
}

export interface CategoryState {
  selectedLevel1: string;
  selectedLevel2: string;
  selectedLevel3: string;
  dynamicFields: Record<string, any>;
  categories: {
    level1: CategoryNode | null;
    level2: CategoryNode | null;
    level3: CategoryNode | null;
  };
}


export interface CategoryNode {
  _id: string;
  categoryName: string;
  parentId: string | null;
  children?: CategoryNode[];
  fields?: DynamicField[];
}



//  -------------------------------------------------------- //


export interface UseProductFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  categories: CategoryNode[]; // 👈 backend tree
}

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

export interface Attribute {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "checkbox" | "radio";
  options?: DropdownOption[];
  required?: boolean;
  categoryId: string;
  isForSubcategories: boolean;
}



export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export interface BasicInfoStepProps {
  formData: {
    productName: string;
    sku: string;
    barcode: string;
    brand: string;
    manufacturer: string;
    modelNumber: string;
    description: string;
    shortDescription: string;
    keywords: string;
  };
  tags: string[];
  images: {
    file: File;
    preview: string;
    name: string;
  }[];
  newTag: string;
  onInputChange: (field: string, value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onNewTagChange: (value: string) => void;
  onImageUpload: (files: File[]) => Promise<void> | void;
  onRemoveImage: (index: number) => void;
  isUploading?: boolean;
  onBulkAddTags: (newTagsArray: string[]) => void;
  setImage: any;
}

export interface UploadedImage {
  id: string;
  preview: string;
  file?: File; // Store the actual file for AI analysis
  progress: number;
  isUploading: boolean;
}

export interface AIResponse {
  success: boolean;
  imageCount: number;
  ai: {
    shortDescription: string;
    description: string;
    tags: string[];
    keywords: string;
  };
}


export interface CategoryStepProps {
  categories: CategoryNode[];
  selectedPath: string[];
  selectedCategories: CategoryNode[];
  getCategoriesAtLevel: (level: number) => CategoryNode[];
  handleCategorySelect: (level: number, value: string) => void;
  attributes?: Record<string, any>;

}

/* 🎨 Level-based styling (same as static UI) */
export const LEVEL_STYLES = [
  {
    badge: "bg-purple-500 text-white",
    border: "border-purple-300",
    focus: "focus:border-purple-500 focus:ring-purple-200",
    label: "Main Category",
    subCat: "bg-purple-100 text-purple-700 border border-purple-300 px-3 py-1.5 text-sm"
  },
  {
    badge: "bg-cyan-500 text-white",
    border: "border-cyan-300",
    focus: "focus:border-cyan-500 focus:ring-cyan-200",
    label: "Subcategory",
    subCat: "bg-cyan-200 text-cyan-700 border border-cyan-300 px-3 py-1.5 text-sm"
  },
  {
    badge: "bg-teal-500 text-white",
    border: "border-teal-300",
    focus: "focus:border-teal-500 focus:ring-teal-200",
    label: "Sub-subcategory",
    subCat: "bg-teal-100 text-teal-700 border border-teal-300 px-3 py-1.5 text-sm"
  },
];





