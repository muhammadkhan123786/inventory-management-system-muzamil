"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/form/Dialog";
import { Button } from "@/components/form/CustomButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/form/Tabs";
import { Save, Loader2, Edit2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProductForm } from "./hooks/useProductForm";
import { BasicInfoTab } from "../Product/EditProduct/BasicInfoTabEdit";
import { PricingSupplierTab } from "../Product/EditProduct/PricingSupplierTabEdit";
import { StockTab } from "../Product/EditProduct/StockTabEdit";
import { VariantsTab } from "../Product/EditProduct/VariantsTabEdit";

interface ProductQuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSave: (data: any) => Promise<void>;
  onFullEdit?: () => void;
  categories?: any[]; // optional — now fetched internally by hook
}

export function ProductQuickEditDialog({
  open,
  onOpenChange,
  product,
  onSave,
  onFullEdit,
}: ProductQuickEditDialogProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    formData,
    isSaving,
    updateField,
    handleSupplierChange,
    handleSave,
    suppliers,
    warehouses,
    productStatuses,
    conditions,
    warehouseStatuses,
    categories,        // ✅ from hook now
    attributeOptions,  // ✅ from hook now
  } = useProductForm(product, onSave, onOpenChange);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const base64Images = await Promise.all(
        Array.from(files).map((file) => fileToBase64(file))
      );
      updateField("images", [...(formData?.images || []), ...base64Images]);
      toast.success(`${base64Images.length} image(s) added!`);
    } catch {
      toast.error("Failed to process images");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData?.images?.filter((_: any, i: number) => i !== index) || [];
    updateField("images", newImages);
    toast.success("Image removed");
  };

  const handleAddTag = () => {
    const tag = prompt("Enter tag name:");
    if (tag?.trim() && formData) {
      updateField("tags", [...(formData.tags || []), tag.trim()]);
    }
  };

  const handleRemoveTag = (index: number) => {
    if (!formData) return;
    updateField("tags", formData.tags?.filter((_: any, i: number) => i !== index) || []);
  };

  if (!product || !formData) return null;

  const profit = (formData.price || 0) - (formData.costPrice || 0);
  const margin = formData.price ? (profit / formData.price) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-scroll flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quick Edit Product
              </DialogTitle>
              <DialogDescription>
                Make quick changes to {formData.productName}
              </DialogDescription>
            </div>
            {onFullEdit && (
              <Button variant="outline" size="sm" onClick={onFullEdit}>
                <Edit2 className="h-4 w-4 mr-2" /> Full Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing-supplier">Pricing & Supplier</TabsTrigger>
            <TabsTrigger value="stock">Stock & Warranty</TabsTrigger>
            <TabsTrigger value="variants">
              Variants{" "}
              {formData.attributes?.length > 1 && `(${formData.attributes.length})`}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 px-1">
            <TabsContent value="basic" className="mt-0">
              <BasicInfoTab
                formData={formData}
                updateField={updateField}
                isUploadingImage={isUploadingImage}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                fileInputRef={fileInputRef}
              />
            </TabsContent>

            <TabsContent value="pricing-supplier" className="mt-0">
              <PricingSupplierTab
                formData={formData}
                updateField={updateField}
                onSupplierChange={handleSupplierChange}
                suppliers={suppliers}
                profit={profit}
                margin={margin}
              />
            </TabsContent>

            <TabsContent value="stock" className="mt-0">
              <StockTab
                formData={formData}
                updateField={updateField}
                warehouses={warehouses}
                productStatuses={productStatuses}
                conditions={conditions}
                warehouseStatuses={warehouseStatuses}
              />
            </TabsContent>

            <TabsContent value="variants" className="mt-0">
              {/* ✅ categories & attributeOptions now from hook — never empty */}
              <VariantsTab
                formData={formData}
                categories={categories}
                attributeOptions={attributeOptions}
                updateField={updateField}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              All IDs preserved during update
              {formData.supplierName && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  Supplier: {formData.supplierName}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}