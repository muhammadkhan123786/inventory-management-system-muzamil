"use client";
import { AnimatePresence } from "framer-motion";

// Data
import { STEPS } from "../data/productData";
// Hooks
import { useProductForm } from "../hooks/useProductForm";

// Components
import { AnimatedBackground } from "./AnimatedBackground";
import { FormHeader } from "./FormHeader";
import { StepIndicator } from "./StepIndicator";
import { StepCard } from "./StepCard";
import { NavigationButtons } from "./NavigationButtons";
import { CategoryStep } from "./steps/CategoryStep";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { AttributesAndPricingStep } from "./steps/AttributesAndPricingStep";
import { Toaster } from "sonner";

const MARKETPLACE_OPTIONS = [
  { value: "amazon", label: "Amazon", icon: "🏪" },
  { value: "ebay", label: "eBay", icon: "🛒" },
  { value: "shopify", label: "Shopify", icon: "🏬" },
  { value: "etsy", label: "Etsy", icon: "🎨" },
  { value: "walmart", label: "Walmart", icon: "🏪" },
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
    tags,
    images,
    newTag,
    dropdowns,
    getSelectedCategory,
    getAllFields,
    handleInputChange,
    handleDynamicFieldChange,
    handleSubmit,
    addTag,
    removeTag,
    handleImageUpload,
    removeImage,
    nextStep,
    prevStep,
    setNewTag,
    attributes,
    onBulkAddTags,
    getWarrantyOptions,
    handleFullPathSelect,
    attributeCategoryIds,
    attributeIdsLoading,

    // ✅ Destructure lifted variants state
    variants,
    setVariants,
    setImages,
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
      images: [],
      variants: [],
    },
    onSubmit: async (data) => {
      try {
        const apiData = transformDataForAPI(data);
        // console.log("API Payload:", apiData);
        // const res = await createProduct(apiData);

      } catch (error) {
        console.error("Error submitting product data:", error);
      }
    },
    categories: [],
  });

  // Transform data to match your database schema
  const transformDataForAPI = (data: any) => {
    return {
      productInfo: {
        name: data.productName,
        sku: data.sku,
        barcode: data.barcode,
        brand: data.brand,
        manufacturer: data.manufacturer,
        modelNumber: data.modelNumber,
        description: data.description,
        shortDescription: data.shortDescription,
        keywords: data.keywords,
        images: data.images,
        categoryId: data.finalCategoryId,
        categoryPath: data.categoryPath,
        tags: data.tags,
        dynamicFields: data.dynamicFields,
      },
      // ✅ Variants already structured by the hook
      variants: data.variants,
    };
  };




  const renderStepContent = () => {

    switch (currentStep) {
      case 1:
        return (

          <CategoryStep
            selectedPath={selectedPath || []}
            categories={fetchedCategories || []}
            selectedCategories={selectedCategories || []}
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
            tags={tags}
            images={images}
            newTag={newTag}
            onInputChange={handleInputChange}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onNewTagChange={setNewTag}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            setImage={setImages}
            onBulkAddTags={onBulkAddTags}

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
            currencies={dropdowns.currencies || []}
            taxes={dropdowns.taxes || []}
            warehouses={dropdowns.warehouses || []}
            warehouseStatus={dropdowns.warehouseStatus || []}
            productStatus={dropdowns.productStatus || []}
            conditions={dropdowns.conditions || []}
            warrantyOptions={getWarrantyOptions()}
            marketplaces={MARKETPLACE_OPTIONS}
            // ✅ Pass lifted state down
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
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onPrev={prevStep}
          onNext={nextStep}
        // nextLabel={
        //   currentStep === STEPS.length ? "Create Product" : "Next Step"
        // }
        />
      </form>
    </div>
  );
}