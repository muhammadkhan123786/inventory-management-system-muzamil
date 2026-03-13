// hooks/useProductForm.ts - UPDATED VERSION

"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { CategoryNode, UseProductFormProps, Attribute, FourDropdownData } from "../types/product";
import {
  getCategoriesAtLevel,
  getSelectedCategoryPath,
} from "../utils/categoryHelpers";
import { fetchCategories } from "@/hooks/useCategory";
import { DropdownService } from "@/helper/dropdown.service";
import { fetchAttributes } from "@/hooks/useAttributes";
import { createProduct } from "@/helper/products";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";

// ─── Shared variant types ────────────────────────────────────────────────────
export interface MarketplacePricing {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId: string;
  taxRate: number;
  vatExempt: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, any>;
  marketplacePricing: MarketplacePricing[];
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  stockLocation: string;
  warehouseId: string;
  binLocation: string;
  productStatusId: string;
  conditionId: string;
  warehouseStatusId: string;
  featured: boolean;
  safetyStock?: number;
  leadTimeDays?: number;
  warranty: string;
  warrantyPeriod: string;
  supplierId: string;
}

export function useProductForm({
  initialData,
  onSubmit,
  categories,
}: UseProductFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});
  const [tags, setTags] = useState<string[]>([]);

  const [images, setImages] = useState<{
    file: File;
    preview: string;
    name: string;
    base64?: string;
  }[]>([]);

  const [newTag, setNewTag] = useState("");
  const [fetchedCategories, setFetchedCategories] = useState<CategoryNode[]>(categories);
  const [formData, setFormData] = useState(initialData);
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [dropdowns, setDropdowns] = useState<Partial<FourDropdownData>>({});
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // ─── NEW: Category attribute-filter state ────────────────────────────────
  // undefined  = not yet fetched  → combobox shows spinner, list is empty
  // new Set()  = fetched, none have attributes → combobox shows empty hint
  // new Set([…]) = fetched with results → combobox shows only those categories
  const [attributeCategoryIds, setAttributeCategoryIds] = useState<Set<string> | undefined>(undefined);
  const [attributeIdsLoading, setAttributeIdsLoading] = useState(true);

  // ─── Warranty options ────────────────────────────────────────────────────
  const getWarrantyOptions = () => [
    { value: "manufacturer", label: "Manufacturer Warranty" },
    { value: "seller", label: "Seller Warranty" },
    { value: "no_warranty", label: "No Warranty" },
    { value: "extended", label: "Extended Warranty" },
    { value: "lifetime", label: "Lifetime Warranty" },
  ];

  // ─── Fetch all category IDs that have attributes (runs once on mount) ────
  useEffect(() => {
    const loadAttributeCategoryIds = async () => {
      try {
        setAttributeIdsLoading(true);
        // Broad fetch — adjust page size to your dataset
        const res = await fetchAttributes(1, 500, "", "");
        const all: Attribute[] = res.data || [];

        // Collect every unique categoryId that has at least one attribute
        const ids = new Set(all.map((a: Attribute) => a.categoryId));
        setAttributeCategoryIds(ids);
      } catch (err) {
        console.error("Failed to load attribute category ids", err);
        // Empty Set on error → show nothing, not everything
        setAttributeCategoryIds(new Set());
      } finally {
        setAttributeIdsLoading(false);
      }
    };

    loadAttributeCategoryIds();
  }, []);

  // ─── Fetch dropdowns when step changes ───────────────────────────────────
  useEffect(() => {
    const loadDropdowns = async () => {
      if (dropdownLoading) return;

      try {
        setDropdownLoading(true);

        if (currentStep === 3) {
          const data = await DropdownService.fetchOnlyTaxAndCurrency();
          setDropdowns((prev) => ({
            ...prev,
            taxes: data.taxes,
            currencies: data.currencies,
          }));
        }

        if (currentStep === 3) {
          const data = await DropdownService.fetchOnlyWarehouse();
          setDropdowns((prev) => ({
            ...prev,
            warehouses: data.warehouses,
            warehouseStatus: data.warehouseStatus,
            productStatus: data.productStatus,
            conditions: data.conditions,
          }));
        }
      } catch (error) {
        console.error("Dropdown loading failed", error);
      } finally {
        setDropdownLoading(false);
      }
    };

    loadDropdowns();
  }, [currentStep]);

  // ─── Fetch attributes for the selected category path ─────────────────────
  useEffect(() => {
    if (!selectedPath.length) {
      setAttributes([]);
      return;
    }

    const loadAttributes = async () => {
      try {
        const res = await fetchAttributes(1, 100, "", selectedPath.join(","));
        const allAttributes: Attribute[] = res.data || [];
        const selectedCategoryId = selectedPath.at(-1);

        const filteredAttributes = allAttributes.filter((attr) => {
          if (attr.categoryId === selectedCategoryId) return true;
          if (attr.isForSubcategories && selectedPath.includes(attr.categoryId)) {
            return true;
          }
          return false;
        });

        setAttributes(filteredAttributes);
      } catch (err) {
        console.error("Attribute fetch failed", err);
        setAttributes([]);
      }
    };

    loadAttributes();
  }, [currentStep, selectedPath]);

  // ─── Fetch categories ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await fetchCategories();
        setFetchedCategories(data.data as any || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategoriesData();
  }, []);

  // ─── Category helpers ─────────────────────────────────────────────────────
  const handleCategorySelect = useCallback((level: number, value: string) => {
    setSelectedPath((prev) => {
      const next = prev.slice(0, level);
      if (value) next[level] = value;
      return next;
    });
  }, []);

  /**
   * NEW: Set the entire selectedPath at once from a flat category selection.
   * CategoryStep calls this with the full pathIds array so all levels
   * auto-populate without cascading clicks.
   */
  const handleFullPathSelect = useCallback((pathIds: string[]) => {
    setSelectedPath(pathIds);
  }, []);

  const selectedCategories = useMemo(() => {
    return getSelectedCategoryPath(fetchedCategories || [], selectedPath);
  }, [fetchedCategories, selectedPath]);

  const getCategoriesAtLevelFromHook = useCallback(
    (level: number) => {
      if (!fetchedCategories || !Array.isArray(fetchedCategories)) {
        return [];
      }
      return getCategoriesAtLevel(fetchedCategories, selectedPath, level);
    },
    [fetchedCategories, selectedPath],
  );

  const getSelectedCategory = useCallback(
    (level?: number) => {
      if (selectedCategories.length === 0) return null;
      if (level !== undefined) {
        return selectedCategories[level] || null;
      }
      return selectedCategories[selectedCategories.length - 1];
    },
    [selectedCategories],
  );

  const getAllFields = useCallback(() => {
    const fields: any[] = [];
    return fields;
  }, [selectedCategories]);

  // ─── Step navigation ──────────────────────────────────────────────────────
  const nextStep = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep],
  );

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // ─── Form field handlers ──────────────────────────────────────────────────
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleDynamicFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setDynamicFields((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    [],
  );

  // ─── Tag handlers ─────────────────────────────────────────────────────────
  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  }, [newTag, tags]);

  const onBulkAddTags = (newTagsArray: string[]) => {
    setTags((prevTags) => {
      const combined = [...prevTags, ...newTagsArray];
      return Array.from(new Set(combined));
    });
  };

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  // ─── Image handlers ───────────────────────────────────────────────────────
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray: File[] = Array.isArray(files) ? files : Array.from(files);
      const validFiles = fileArray.filter((file) => file instanceof File);

      const formattedImagesPromises = validFiles.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          base64,
        };
      });

      const formattedImages = await Promise.all(formattedImagesPromises);
      setImages((prev) => [...prev, ...formattedImages]);
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const base64Images = images.map((img) => img.base64 || '');

      const keywordsArray = (formData.keywords as string)
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const finalData = {
        productName: formData.productName,
        sku: formData.sku,
        barcode: formData.barcode,
        brand: formData.brand,
        manufacturer: formData.manufacturer,
        modelNumber: formData.modelNumber,
        description: formData.description,
        shortDescription: formData.shortDescription,
        keywords: keywordsArray,
        tags,
        images: base64Images,
        categoryId: selectedPath.at(-1),
        categoryPath: selectedPath,

        attributes: variants.map((v) => ({
          sku: v.sku,
          attributes: v.attributes,

          pricing: v.marketplacePricing.map((p) => ({
             costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            retailPrice: p.retailPrice,
            discountPercentage: p.discountPercentage,
            taxId: p.taxId || null,
            taxRate: p.taxRate,
            vatExempt: p.vatExempt,
          })),

          stock: {
            stockQuantity: v.stockQuantity,
            minStockLevel: v.minStockLevel,
            maxStockLevel: v.maxStockLevel,
            reorderPoint: v.reorderPoint,
            safetyStock: v.safetyStock,
            leadTimeDays: v.leadTimeDays,
            stockLocation: v.stockLocation,
            warehouseId: v.warehouseId,
            binLocation: v.binLocation,
            productStatusId: v.productStatusId,
            conditionId: v.conditionId,
            featured: v.featured,
            supplierId: v.supplierId,
          },

          warranty: {
            warrantyType: v.warranty,
            warrantyPeriod: v.warrantyPeriod,
          },
        })),
      };

      console.log("📤 Final data being sent to API:", finalData);

      try {
        await createProduct(finalData as any);
        onSubmit(finalData);
        toast.success("Product created successfully!");
        router.push("/dashboard/product");
      } catch (error) {
        console.error("❌ Error creating product:", error);
        toast.error("Failed to create product");
      }
    },
    [formData, selectedPath, tags, images, variants, onSubmit, router]
  );

  return {
    // ── Step ──────────────────────────────────────────────────────────────
    currentStep,
    nextStep,
    prevStep,

    // ── Form data ─────────────────────────────────────────────────────────
    formData,
    handleInputChange,
    handleSubmit,

    // ── Categories ────────────────────────────────────────────────────────
    selectedPath,
    fetchedCategories: fetchedCategories || [],
    selectedCategories,
    getCategoriesAtLevel: getCategoriesAtLevelFromHook,
    handleCategorySelect,
    handleFullPathSelect,       // ← NEW: set entire path at once
    getSelectedCategory,
    getAllFields,

    // ── Attribute filter (for CategoryStep combobox) ───────────────────────
    attributeCategoryIds,       // ← NEW: Set<string> | undefined
    attributeIdsLoading,        // ← NEW: boolean

    // ── Attributes ────────────────────────────────────────────────────────
    attributes,

    // ── Dynamic fields ────────────────────────────────────────────────────
    dynamicFields,
    setDynamicFields,
    handleDynamicFieldChange,

    // ── Dropdowns ─────────────────────────────────────────────────────────
    dropdowns,
    dropdownLoading,

    // ── Tags ──────────────────────────────────────────────────────────────
    tags,
    newTag,
    setNewTag,
    addTag,
    removeTag,
    onBulkAddTags,

    // ── Images ────────────────────────────────────────────────────────────
    images,
    setImages,
    handleImageUpload,
    removeImage,

    // ── Variants ──────────────────────────────────────────────────────────
    variants,
    setVariants,

    // ── Misc ──────────────────────────────────────────────────────────────
    getWarrantyOptions,
  };
}