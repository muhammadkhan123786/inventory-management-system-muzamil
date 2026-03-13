import { useCallback } from "react";
import { ProductInformationCard } from "../utils/ProductInformationCard";
import {  
  BasicInfoStepProps,  
} from "../../types/product";

type Props = BasicInfoStepProps;

export function BasicInfoStep({
  formData,
  tags,
  images,
  newTag,
  onInputChange,
  onAddTag,
  onRemoveTag,
  onNewTagChange,
  onImageUpload,
  onRemoveImage,  
}: Props) {

  const handleRemoveImage = useCallback(
  (index: number) => {
    URL.revokeObjectURL(images[index]?.preview);
    onRemoveImage(index);
  },
  [images, onRemoveImage]
);

  return (
    <ProductInformationCard
      formData={formData}
      tags={tags}
      images={images || []}
      newTag={newTag}
      onInputChange={onInputChange}
      onAddTag={onAddTag}
      onRemoveTag={onRemoveTag}
      onNewTagChange={onNewTagChange}
      onImageUpload={onImageUpload}
      onRemoveImage={handleRemoveImage}
      
    />
  );
}