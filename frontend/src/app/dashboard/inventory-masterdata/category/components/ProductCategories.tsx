// // src/pages/ProductCategories.tsx
// import React from "react";
// import CategoryTree from "./CategoryView";
// import { ICategory } from "../../../../../../../common/ICategory.interface";


// /* ===== Props Interface ===== */
// type ViewMode = "table" | "tree";
// interface ProductCategoriesProps {
//   viewType: ViewMode;
//   categories: ICategory[];
//   onEdit: (category: ICategory) => void;
//   onDelete: (categoryId: string) => void;
//   onCreate: (data: ICategory) => void;
//   onSub: (parent: ICategory) => void;
//   onSetDefault: (category: ICategory) => void;
//   initialCategoryId: string | null;
// }



// /* ===== Component ===== */
// const ProductCategories: React.FC<ProductCategoriesProps> = ({
//   viewType,
//   categories,
//   onEdit,
//   onDelete,
//   onCreate,
//   onSub,
//   initialCategoryId,
//   onSetDefault,
// }) => {
//   return (
//     <main>
//       <CategoryTree
//         categories={categories}
//         viewType={viewType}
//          onEdit={onEdit}
//         onDelete={onDelete}
//         onSub={onSub}
//         onSetDefault={onSetDefault}
//        />
//     </main>
//   );
// };

// export default ProductCategories;

"use client";
import React from "react";
import { ICategory } from "../../../../../../../common/ICategory.interface";
import { CategoryTable } from "./CategoryTable";
import { CategoryTree } from "./CategoryTree";

interface ProductCategoriesProps {
  categories: ICategory[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  viewType: "tree" | "table";
  onCreate: (payload: ICategory) => Promise<void>;
  onEdit: (cat: ICategory) => void;
  onDelete: (id: string) => void;
  onSub: (parent: ICategory) => void;
  onSetDefault: (cat: ICategory) => void;
  initialCategoryId: string | null;
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  categories,
  loading,
  searchTerm,
  onSearchChange,
  totalCount,
  viewType,
  onEdit,
  onDelete,
  onSub,
  onSetDefault,
}) => {
  // Common props shared by both views
  const sharedProps = {
    data: categories,
    loading,
    searchTerm,
    onSearchChange,
    totalCount,
    onEdit,
    onDelete,
  };

  if (viewType === "table") {
    return (
      <CategoryTable
        {...sharedProps}
        onAddSub={onSub}
      />
    );
  }

  return (
    <CategoryTree
      {...sharedProps}
      onAddSub={onSub}
      onSetDefault={onSetDefault}
    />
  );
};

export default ProductCategories;

