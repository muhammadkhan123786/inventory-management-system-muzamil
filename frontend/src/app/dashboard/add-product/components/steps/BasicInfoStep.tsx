"use client";
import { useCallback } from "react";
import { ProductInformationCard } from "../utils/ProductInformationCard";
import { BasicInfoStepProps } from "../../types/product";

export function BasicInfoStep({
  formData,
  images,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  setImage,
}: BasicInfoStepProps) {
  const handleRemoveImage = useCallback(
    (index: number) => {
      const preview = images[index]?.preview;
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      onRemoveImage(index);
    },
    [images, onRemoveImage]
  );

  return (
    <ProductInformationCard
      formData={formData}
      images={images ?? []}
      onInputChange={onInputChange}
      onImageUpload={onImageUpload}
      onRemoveImage={handleRemoveImage}
      setImage={setImage}
    />
  );
}