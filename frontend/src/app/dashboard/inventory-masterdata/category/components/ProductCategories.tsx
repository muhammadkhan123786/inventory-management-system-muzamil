// src/pages/ProductCategories.tsx
import React from "react";
import CategoryTree from "./CategoryView";
import { ICategory } from "../../../../../../../common/ICategory.interface";


/* ===== Props Interface ===== */
type ViewMode = "table" | "tree";
interface ProductCategoriesProps {
  viewType: ViewMode;
  categories: ICategory[];
  onEdit: (category: ICategory) => void;
  onDelete: (categoryId: string) => void;
  onCreate: (data: ICategory) => void;
  onSub: (parent: ICategory) => void;
  onSetDefault: (category: ICategory) => void;
  initialCategoryId: string | null;
}



/* ===== Component ===== */
const ProductCategories: React.FC<ProductCategoriesProps> = ({
  viewType,
  categories,
  onEdit,
  onDelete,
  onCreate,
  onSub,
  initialCategoryId,
  onSetDefault,
}) => {
  return (
    <main>
      <CategoryTree
        categories={categories}
        viewType={viewType}
         onEdit={onEdit}
        onDelete={onDelete}
        onSub={onSub}
        onSetDefault={onSetDefault}
       />
    </main>
  );
};

export default ProductCategories;

