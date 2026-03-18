"use client";
import { AnimatePresence } from "framer-motion";
import { STEPS } from "../data/productData";
import { useProductForm } from "../hooks/useProductForm";
import { AnimatedBackground } from "./AnimatedBackground";
import { FormHeader } from "./FormHeader";
import { StepIndicator } from "./StepIndicator";
import { NavigationButtons } from "./NavigationButtons";
import { CategoryStep } from "./steps/CategoryStep";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { AttributesAndPricingStep } from "./steps/AttributesAndPricingStep";
import { Toaster } from "sonner";

const MARKETPLACE_OPTIONS = [
  { value: "amazon",      label: "Amazon",      icon: "🏪" },
  { value: "ebay",        label: "eBay",        icon: "🛒" },
  { value: "shopify",     label: "Shopify",     icon: "🏬" },
  { value: "etsy",        label: "Etsy",        icon: "🎨" },
  { value: "walmart",     label: "Walmart",     icon: "🏪" },
  { value: "own-website", label: "Own Website", icon: "🌐" },
];

export default function AddProductForm() {
  const {
    currentStep,
    formData,
    selectedPath,
    fetchedCategories,
    selectedCategories,
    getCategoriesAtLevel,
    handleCategorySelect,
    dynamicFields,
    dropdowns,
    getSelectedCategory,
    getAllFields,
    handleInputChange,
    handleDynamicFieldChange,
    handleSubmit,
    handleImageUpload,
    removeImage,
    nextStep,
    prevStep,
    attributes,
    getWarrantyOptions,
    handleFullPathSelect,
    attributeCategoryIds,
    attributeIdsLoading,
    variants,
    setVariants,
    images,
    // ✅ Use setServerImageUrls — NOT setImages — as the `setImage` prop.
    //    setImages holds ImageItem[] for previews; setServerImageUrls stores
    //    the permanent URLs returned by the AI upload endpoint.
    setServerImageUrls,
  } = useProductForm({
    initialData: {
      productName: "",
      sku: "",
      barcode: "",
      brand: "",
      manufacturer: "",
      modelNumber: "",
      description: "",
      shortDescription: "",
      keywords: "",
      tags: "",
      images: [],
      variants: [],
    },
    onSubmit: async () => {
      // Hook already calls createProduct; add any post-submit side-effects here.
    },
    categories: [],
  });

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategoryStep
            selectedPath={selectedPath ?? []}
            categories={fetchedCategories ?? []}
            selectedCategories={selectedCategories ?? []}
            getCategoriesAtLevel={getCategoriesAtLevel}
            handleCategorySelect={handleCategorySelect}
            attributes={attributes}
            onFullPathSelect={handleFullPathSelect}
            attributeCategoryIds={attributeCategoryIds}
            attributeIdsLoading={attributeIdsLoading}
          />
        );

      case 2:
        return (
          <BasicInfoStep
            formData={formData}
            images={images}
            onInputChange={handleInputChange}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            // ✅ Correct prop: server URLs after AI upload, not the local ImageItem setter
            setImage={setServerImageUrls}
          />
        );

      case 3:
        return (
          <AttributesAndPricingStep
            formData={formData}
            attributes={attributes}
            dynamicFields={dynamicFields}
            getAllFields={getAllFields}
            onInputChange={handleInputChange}
            onDynamicFieldChange={handleDynamicFieldChange}
            currencies={dropdowns.currencies ?? []}
            taxes={dropdowns.taxes ?? []}
            warehouses={dropdowns.warehouses ?? []}
            warehouseStatus={dropdowns.warehouseStatus ?? []}
            productStatus={dropdowns.productStatus ?? []}
            conditions={dropdowns.conditions ?? []}
            warrantyOptions={getWarrantyOptions()}
            marketplaces={MARKETPLACE_OPTIONS}
            variants={variants}
            setVariants={setVariants}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <Toaster position="top-right" richColors />
      <AnimatedBackground />
      <FormHeader
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepTitle={STEPS[currentStep - 1].title}
      />
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onPrev={prevStep}
          onNext={nextStep}
        />
      </form>
    </div>
  );
}