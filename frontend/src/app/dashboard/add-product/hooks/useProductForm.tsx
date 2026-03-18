"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  CategoryNode,
  UseProductFormProps,
  Attribute,
  FourDropdownData,
  ProductFormData,
  ImageItem,
} from "../types/product";
import { getCategoriesAtLevel, getSelectedCategoryPath } from "../utils/categoryHelpers";
import { fetchCategories } from "@/hooks/useCategory";
import { DropdownService } from "@/helper/dropdown.service";
import { fetchAttributes } from "@/hooks/useAttributes";
import { createProduct } from "@/helper/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Variant types ─────────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function csvToArray(csv: string): string[] {
  return csv.split(",").map((s) => s.trim()).filter(Boolean);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useProductForm({ initialData, onSubmit, categories }: UseProductFormProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<ProductFormData>(initialData);

  // Local image objects (preview + base64 for non-AI path)
  const [images, setImages] = useState<ImageItem[]>([]);
  // Server URLs returned by the AI upload endpoint — used at submit time when available
  const [serverImageUrls, setServerImageUrls] = useState<string[]>([]);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [fetchedCategories, setFetchedCategories] = useState<CategoryNode[]>(categories);
  const [dropdowns, setDropdowns] = useState<Partial<FourDropdownData>>({});
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeCategoryIds, setAttributeCategoryIds] = useState<Set<string> | undefined>(undefined);
  const [attributeIdsLoading, setAttributeIdsLoading] = useState(true);

  // ─── Warranty options ──────────────────────────────────────────────────────
  const getWarrantyOptions = useCallback(
    () => [
      { value: "manufacturer", label: "Manufacturer Warranty" },
      { value: "seller", label: "Seller Warranty" },
      { value: "no_warranty", label: "No Warranty" },
      { value: "extended", label: "Extended Warranty" },
      { value: "lifetime", label: "Lifetime Warranty" },
    ],
    []
  );

  // ─── One-time: fetch all category IDs that have attributes ────────────────
  useEffect(() => {
    (async () => {
      try {
        setAttributeIdsLoading(true);
        const res = await fetchAttributes(1, 500, "", "");
        const ids = new Set<string>((res.data ?? []).map((a: Attribute) => a.categoryId));
        setAttributeCategoryIds(ids);
      } catch {
        setAttributeCategoryIds(new Set());
      } finally {
        setAttributeIdsLoading(false);
      }
    })();
  }, []);

  // ─── Fetch dropdowns only when step 3 is first reached ────────────────────
  useEffect(() => {
    if (currentStep !== 3 || dropdownLoading) return;
    (async () => {
      try {
        setDropdownLoading(true);
        const [taxCurrency, warehouse] = await Promise.all([
          DropdownService.fetchOnlyTaxAndCurrency(),
          DropdownService.fetchOnlyWarehouse(),
        ]);
        setDropdowns({
          taxes: taxCurrency.taxes,
          currencies: taxCurrency.currencies,
          warehouses: warehouse.warehouses,
          warehouseStatus: warehouse.warehouseStatus,
          productStatus: warehouse.productStatus,
          conditions: warehouse.conditions,
        });
      } catch (err) {
        console.error("Dropdown loading failed", err);
      } finally {
        setDropdownLoading(false);
      }
    })();
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch attributes whenever selectedPath changes ────────────────────────
  useEffect(() => {
    if (!selectedPath.length) {
      setAttributes([]);
      return;
    }
    (async () => {
      try {
        const res = await fetchAttributes(1, 100, "", selectedPath.join(","));
        const all: Attribute[] = res.data ?? [];
        const leafId = selectedPath.at(-1);
        setAttributes(
          all.filter(
            (attr) =>
              attr.categoryId === leafId ||
              (attr.isForSubcategories && selectedPath.includes(attr.categoryId))
          )
        );
      } catch {
        setAttributes([]);
      }
    })();
  }, [selectedPath]);

  // ─── Fetch categories once ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        setFetchedCategories(data.data ?? []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    })();
  }, []);

  // ─── Category helpers ──────────────────────────────────────────────────────
  const handleCategorySelect = useCallback((level: number, value: string) => {
    setSelectedPath((prev) => {
      const next = prev.slice(0, level);
      if (value) next[level] = value;
      return next;
    });
  }, []);

  const handleFullPathSelect = useCallback((pathIds: string[]) => {
    setSelectedPath(pathIds);
  }, []);

  const selectedCategories = useMemo(
    () => getSelectedCategoryPath(fetchedCategories ?? [], selectedPath),
    [fetchedCategories, selectedPath]
  );

  const getCategoriesAtLevelFromHook = useCallback(
    (level: number) =>
      Array.isArray(fetchedCategories)
        ? getCategoriesAtLevel(fetchedCategories, selectedPath, level)
        : [],
    [fetchedCategories, selectedPath]
  );

  const getSelectedCategory = useCallback(
    (level?: number) => {
      if (!selectedCategories.length) return null;
      return level !== undefined
        ? (selectedCategories[level] ?? null)
        : selectedCategories[selectedCategories.length - 1];
    },
    [selectedCategories]
  );

  // ─── Step navigation ───────────────────────────────────────────────────────
  const nextStep = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentStep < 5) {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep]
  );

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // ─── Form field handlers ───────────────────────────────────────────────────
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDynamicFieldChange = useCallback((fieldName: string, value: any) => {
    setDynamicFields((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  // ─── Image handlers ────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f instanceof File);
    const formatted = await Promise.all(
      fileArray.map(async (file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        base64: await fileToBase64(file),
      }))
    );
    setImages((prev) => [...prev, ...formatted]);
    // New local upload invalidates any stale server URLs
    setServerImageUrls([]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const preview = prev[index]?.preview;
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      return prev.filter((_, i) => i !== index);
    });
    setServerImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Called by ImageUploadSections after the AI endpoint uploads images to the
   * server and returns permanent URLs. These URLs are what gets stored in the DB.
   */
  const handleSetServerImageUrls = useCallback((urls: string[]) => {
    setServerImageUrls(urls);
  }, []);

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      /**
       * Image priority:
       *  1. serverImageUrls  → AI was used; images already on server as proper URLs
       *  2. base64 strings   → no AI; send raw data and let the backend store them
       */
      const imagePayload: string[] =
        serverImageUrls.length > 0
          ? serverImageUrls
          : images.map((img) => img.base64 ?? "").filter(Boolean);

      const payload = {
        productName: formData.productName,
        sku: formData.sku,
        barcode: formData.barcode,
        brand: formData.brand,
        manufacturer: formData.manufacturer,
        modelNumber: formData.modelNumber,
        description: formData.description,
        shortDescription: formData.shortDescription,
        keywords: csvToArray(formData.keywords),
        tags: csvToArray(formData.tags),
        images: imagePayload,
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

      try {
        await createProduct(payload as any);
        onSubmit(payload);
        toast.success("Product created successfully!");
        router.push("/dashboard/product");
      } catch (err) {
        console.error("Error creating product:", err);
        toast.error("Failed to create product");
      }
    },
    [formData, selectedPath, images, serverImageUrls, variants, onSubmit, router]
  );

  return {
    // Step
    currentStep, nextStep, prevStep,
    // Form
    formData, handleInputChange, handleSubmit,
    // Categories
    selectedPath,
    fetchedCategories: fetchedCategories ?? [],
    selectedCategories,
    getCategoriesAtLevel: getCategoriesAtLevelFromHook,
    handleCategorySelect,
    handleFullPathSelect,
    getSelectedCategory,
    getAllFields: useCallback(() => [], []),
    // Attribute filter
    attributeCategoryIds,
    attributeIdsLoading,
    // Attributes
    attributes,
    // Dynamic fields
    dynamicFields,
    setDynamicFields,
    handleDynamicFieldChange,
    // Dropdowns
    dropdowns,
    dropdownLoading,
    // Images — local ImageItem[] for previews
    images,
    setImages,
    handleImageUpload,
    removeImage,
    // Server URLs after AI upload — pass this as the `setImage` prop
    setServerImageUrls: handleSetServerImageUrls,
    serverImageUrls,
    // Variants
    variants,
    setVariants,
    // Misc
    getWarrantyOptions,
  };
}