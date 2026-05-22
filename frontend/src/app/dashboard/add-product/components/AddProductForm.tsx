// "use client";
// import { AnimatePresence } from "framer-motion";
// import { STEPS } from "../data/productData";
// import { useProductForm } from "../hooks/useProductForm";
// import { AnimatedBackground } from "./AnimatedBackground";
// import { FormHeader } from "./FormHeader";
// import { StepIndicator } from "./StepIndicator";
// import { NavigationButtons } from "./NavigationButtons";
// import { CategoryStep } from "./steps/CategoryStep";
// import { BasicInfoStep } from "./steps/BasicInfoStep";
// import { AttributesAndPricingStep } from "./steps/AttributesAndPricingStep";
// import { Toaster, toast } from "sonner";

// export default function AddProductForm() {
//   const {
//     currentStep,
//     formData,
//     selectedPath,
//     fetchedCategories,
//     selectedCategories,
//     getCategoriesAtLevel,
//     handleCategorySelect,
//     dynamicFields,
//     dropdowns,
//     getSelectedCategory,
//     getAllFields,
//     handleInputChange,
//     handleDynamicFieldChange,
//     handleSubmit,
//     handleImageUpload,
//     removeImage,
//     nextStep,
//     prevStep,
//     attributes,
//     getWarrantyOptions,
//     handleFullPathSelect,
//     attributeCategoryIds,
//     attributeIdsLoading,
//     variants,
//     setVariants,
//     images,
//     setServerImageUrls,
//   } = useProductForm({
//     initialData: {
//       productName: "",
//       sku: "",
//       barcode: "",
//       brand: "",
//       manufacturer: "",
//       modelNumber: "",
//       description: "",
//       shortDescription: "",
//       keywords: "",
//       tags: "",
//       images: [],
//       variants: [],
//     },
//     onSubmit: async () => {},
//     categories: [],
//   });

//   // ✅ STEP 1: Category Validation
//   const validateStep1 = (): boolean => {
//     if (!selectedPath || selectedPath.length === 0) {
//       toast.error("Please select a category", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }
//     return true;
//   };

//   // ✅ STEP 2: Basic Information Validation
//   const validateStep2 = (): boolean => {
//     // Product Name validation
//     if (!formData.productName || formData.productName.trim() === "") {
//       toast.error("Product Name is required", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     // SKU validation
//     if (!formData.sku || formData.sku.trim() === "") {
//       toast.error("SKU Code is required", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     // Description validation
//     if (!formData.description || formData.description.trim() === "") {
//       toast.error("Product Description is required", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     if (formData.productName.length < 3) {
//       toast.error("Product Name must be at least 3 characters long", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     return true;
//   };

//   // ✅ STEP 3: Attributes & Pricing Validation
//   const validateStep3 = (): boolean => {
//     // Check if variants exist
//     if (!variants || variants.length === 0) {
//       toast.error("Please configure product details (SKU, Pricing, Warranty)", {
//         duration: 4000,
//         position: "top-right",
//       });
//       return false;
//     }

//     const variant = variants[0]; // Get the first variant

//     // SKU Validation
//     if (!variant.sku || variant.sku.trim() === "") {
//       toast.error("Product SKU is required", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     // Pricing Validation
//     const costPrice = variant.pricing?.costPrice;
//     const sellingPrice = variant.pricing?.sellingPrice;

//     if (!costPrice || costPrice <= 0) {
//       toast.error("Cost Price is required and must be greater than 0", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     if (!sellingPrice || sellingPrice <= 0) {
//       toast.error("Selling Price is required and must be greater than 0", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }

//     if (sellingPrice < costPrice) {
//       toast.warning("Selling Price is less than Cost Price. You will incur a loss on each sale.", {
//         duration: 4000,
//         position: "top-right",
//       });
//       // Warning doesn't block submission, but we show it
//     }

//     // Warranty Validation
//     if (!variant.warrantyPeriod) {
//       toast.error("Warranty Period is required", {
//         duration: 3000,
//         position: "top-right",
//       });
//       return false;
//     }





//   //   const variant = variants[0];
  
//   // // Stock validation (optional - sirf agar required karna ho toh)
//   // if (!variant.stockQuantity && variant.stockQuantity !== 0) {
//   //   toast.error("Stock Quantity is required", { duration: 3000 });
//   //   return false;
//   // }
  
//   // if (!variant.minStockLevel && variant.minStockLevel !== 0) {
//   //   toast.error("Minimum Stock Level is required", { duration: 3000 });
//   //   return false;
//   // }
  
//   // if (!variant.maxStockLevel && variant.maxStockLevel !== 0) {
//   //   toast.error("Maximum Stock Level is required", { duration: 3000 });
//   //   return false;
//   // }
  
//   // if (!variant.reorderPoint && variant.reorderPoint !== 0) {
//   //   toast.error("Reorder Point is required", { duration: 3000 });
//   //   return false;
//   // }
  
//   // if (!variant.supplierId) {
//   //   toast.error("Supplier is required", { duration: 3000 });
//   //   return false;
//   // }
  
//   // if (!variant.warehouseId) {
//   //   toast.error("Warehouse is required", { duration: 3000 });
//   //   return false;
//   // }
  

    
//     // Attributes Validation (if any are required)
//     const requiredAttributes = attributes.filter((a: any) => a.isRequired);
//     const missingAttributes = requiredAttributes.filter(
//       (attr: any) => !variant.attributes?.[attr._id]
//     );

//     if (missingAttributes.length > 0) {
//       const attrNames = missingAttributes.map((a: any) => `"${a.attributeName}"`).join(", ");
//       toast.error(`Required attributes missing: ${attrNames}`, {
//         duration: 4000,
//         position: "top-right",
//       });
//       return false;
//     }

//     return true;
//   };

//   // ✅ Handle Next Button Click with Validation
//   const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     if (currentStep === 1) {
//       if (validateStep1()) {
//         nextStep(e);
//       }
//       return;
//     }

//     if (currentStep === 2) {
//       if (validateStep2()) {
//         nextStep(e);
//       }
//       return;
//     }
//   };

//   // ✅ Handle Final Submit with Step 3 Validation
//   const handleFinalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (currentStep === 3) {
//       if (!validateStep3()) {
//         return; // Stop submission if validation fails
//       }
//     }

//     // Proceed with form submission
//     handleSubmit(e);
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <CategoryStep
//             selectedPath={selectedPath ?? []}
//             categories={fetchedCategories ?? []}
//             selectedCategories={selectedCategories ?? []}
//             getCategoriesAtLevel={getCategoriesAtLevel}
//             handleCategorySelect={handleCategorySelect}
//             attributes={attributes}
//             onFullPathSelect={handleFullPathSelect}
//             attributeCategoryIds={attributeCategoryIds}
//             attributeIdsLoading={attributeIdsLoading}
//           />
//         );

//       case 2:
//         return (
//           <BasicInfoStep
//             formData={formData}
//             images={images}
//             onInputChange={handleInputChange}
//             onImageUpload={handleImageUpload}
//             onRemoveImage={removeImage}
//             setImage={setServerImageUrls}
//           />
//         );

//       case 3:
//         return (
//           <AttributesAndPricingStep
//             formData={formData}
//             attributes={attributes}
//             dynamicFields={dynamicFields}
//             getAllFields={getAllFields}
//             onInputChange={handleInputChange}
//             onDynamicFieldChange={handleDynamicFieldChange}
//             currencies={dropdowns.currencies ?? []}
//             taxes={dropdowns.taxes ?? []}
//             warehouses={dropdowns.warehouses ?? []}
//             warehouseStatus={dropdowns.warehouseStatus ?? []}
//             productStatus={dropdowns.productStatus ?? []}
//             conditions={dropdowns.conditions ?? []}
//             warrantyOptions={getWarrantyOptions()}
//             variants={variants}
//             setVariants={setVariants}
//           />
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="space-y-6 relative pb-20">
//       <Toaster position="top-right" richColors />
//       <AnimatedBackground />
//       <FormHeader
//         currentStep={currentStep}
//         totalSteps={STEPS.length}
//         stepTitle={STEPS[currentStep - 1].title}
//       />
//       <StepIndicator steps={STEPS} currentStep={currentStep} />

//       <form onSubmit={handleFinalSubmit} className="space-y-6">
//         <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
//         <NavigationButtons
//           currentStep={currentStep}
//           totalSteps={STEPS.length}
//           onPrev={prevStep}
//           onNext={handleNextClick}
//         />
//       </form>
//     </div>
//   );
// }







"use client";
import { useState, useEffect } from "react";
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
import { Toaster, toast } from "sonner";
import { ProductVariant } from "../hooks/useProductForm";

// SimplePricing interface
interface SimplePricing {
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId: string;
  taxRate: number;
  vatExempt: boolean;
}

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
    onSubmit: async () => {},
    categories: [],
  });

  // ✅ PERSISTED STATE FOR STEP 3 (Data will survive back/forward navigation)
  const [step3Sku, setStep3Sku] = useState<string>("");
  const [step3Attributes, setStep3Attributes] = useState<Record<string, any>>({});
  const [step3Pricing, setStep3Pricing] = useState<SimplePricing>({
    costPrice: 0,
    sellingPrice: 0,
    retailPrice: 0,
    discountPercentage: 0,
    taxId: '',
    taxRate: 0,
    vatExempt: false,
  });
  const [step3Stock, setStep3Stock] = useState<Partial<ProductVariant>>({
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    safetyStock: 0,
    leadTimeDays: 0,
    stockLocation: '',
    warehouseId: '',
    binLocation: '',
    productStatusId: '',
    conditionId: '',
    supplierId: '',
    warehouseStatusId: '',
    featured: false,
  });
  const [step3Warranty, setStep3Warranty] = useState<{
    warranty: string;
    warrantyPeriod: string;
  }>({
    warranty: '',
    warrantyPeriod: '',
  });

  // Load data when coming back to step 3
  useEffect(() => {
    if (currentStep === 3 && variants.length > 0) {
      const variant = variants[0];
      if (variant) {
        setStep3Sku(variant.sku || '');
        setStep3Attributes(variant.attributes || {});
        if (variant.pricing) {
          setStep3Pricing(variant.pricing);
        }
        setStep3Stock({
          stockQuantity: variant.stockQuantity || 0,
          minStockLevel: variant.minStockLevel || 0,
          maxStockLevel: variant.maxStockLevel || 0,
          reorderPoint: variant.reorderPoint || 0,
          safetyStock: variant.safetyStock || 0,
          leadTimeDays: variant.leadTimeDays || 0,
          stockLocation: variant.stockLocation || '',
          warehouseId: variant.warehouseId || '',
          binLocation: variant.binLocation || '',
          productStatusId: variant.productStatusId || '',
          conditionId: variant.conditionId || '',
          supplierId: variant.supplierId || '',
          warehouseStatusId: variant.warehouseStatusId || '',
          featured: variant.featured || false,
        });
        setStep3Warranty({
          warranty: variant.warranty || '',
          warrantyPeriod: variant.warrantyPeriod || '',
        });
      }
    }
  }, [currentStep, variants]);

  // Step 1 validation
  const validateStep1 = (): boolean => {
    if (!selectedPath || selectedPath.length === 0) {
      toast.error("Please select a category", { duration: 3000, position: "top-right" });
      return false;
    }
    return true;
  };

  // Step 2 validation
  const validateStep2 = (): boolean => {
    if (!formData.productName || formData.productName.trim() === "") {
      toast.error("Product Name is required", { duration: 3000, position: "top-right" });
      return false;
    }
    if (!formData.sku || formData.sku.trim() === "") {
      toast.error("SKU Code is required", { duration: 3000, position: "top-right" });
      return false;
    }
    if (!formData.description || formData.description.trim() === "") {
      toast.error("Product Description is required", { duration: 3000, position: "top-right" });
      return false;
    }
    return true;
  };

  // Step 3 validation
  const validateStep3 = (): boolean => {
    if (!step3Sku || step3Sku.trim() === "") {
      toast.error("Product SKU is required", { duration: 3000, position: "top-right" });
      return false;
    }
    if (!step3Pricing.costPrice || step3Pricing.costPrice <= 0) {
      toast.error("Cost Price is required and must be greater than 0", { duration: 3000, position: "top-right" });
      return false;
    }
    if (!step3Pricing.sellingPrice || step3Pricing.sellingPrice <= 0) {
      toast.error("Selling Price is required and must be greater than 0", { duration: 3000, position: "top-right" });
      return false;
    }
    if (!step3Warranty.warrantyPeriod) {
      toast.error("Warranty Period is required", { duration: 3000, position: "top-right" });
      return false;
    }
    return true;
  };

  // Handle Next
  const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentStep === 1 && validateStep1()) {
      nextStep(e);
      return;
    }

    if (currentStep === 2 && validateStep2()) {
      nextStep(e);
      return;
    }
  };

  // Handle Final Submit
  const handleFinalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (currentStep === 3) {
      if (!validateStep3()) {
        return;
      }
      
      // Build variant from persisted state
      const variant: ProductVariant = {
        id: `variant-${Date.now()}`,
        sku: step3Sku,
        attributes: step3Attributes,
        marketplacePricing: [],
        pricing: { ...step3Pricing },
        stockQuantity: step3Stock.stockQuantity || 0,
        minStockLevel: step3Stock.minStockLevel || 0,
        maxStockLevel: step3Stock.maxStockLevel || 0,
        reorderPoint: step3Stock.reorderPoint || 0,
        safetyStock: step3Stock.safetyStock || 0,
        leadTimeDays: step3Stock.leadTimeDays || 0,
        stockLocation: step3Stock.stockLocation || '',
        warehouseId: step3Stock.warehouseId || '',
        binLocation: step3Stock.binLocation || '',
        productStatusId: step3Stock.productStatusId || '',
        conditionId: step3Stock.conditionId || '',
        supplierId: step3Stock.supplierId || '',
        warehouseStatusId: step3Stock.warehouseStatusId || '',
        featured: step3Stock.featured || false,
        warranty: step3Warranty.warranty,
        warrantyPeriod: step3Warranty.warrantyPeriod,
      };
      
      setVariants([variant]);
    }

    handleSubmit(e);
  };

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
            variants={variants}
            setVariants={setVariants}
            // Pass persisted state and setters
            persistedSku={step3Sku}
            onSkuChange={setStep3Sku}
            persistedAttributes={step3Attributes}
            onAttributesChange={setStep3Attributes}
            persistedPricing={step3Pricing}
            onPricingChange={setStep3Pricing}
            persistedStock={step3Stock}
            onStockChange={setStep3Stock}
            persistedWarranty={step3Warranty}
            onWarrantyChange={setStep3Warranty}
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

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onPrev={prevStep}
          onNext={handleNextClick}
        />
      </form>
    </div>
  );
}