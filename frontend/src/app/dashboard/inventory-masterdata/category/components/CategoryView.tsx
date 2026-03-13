"use client";
import React from "react";
import { ICategory } from "../../../../../../../common/ICategory.interface";
import { CategoryTable } from "./CategoryTable";
import { CategoryTree } from "./CategoryTree";

type ViewMode = "table" | "tree";

interface Props {
  categories: ICategory[];
  viewType: ViewMode;
  loading?: boolean;
  onEdit: (category: ICategory) => void;
  onDelete?: (id: string) => void;
  onSub: (category: ICategory) => void;
  onSetDefault: (category: ICategory) => void;
}

export const CategoryView: React.FC<Props> = ({
  categories,
  viewType,
  loading,
  onEdit,
  onDelete = () => {},
  onSub,
  onSetDefault,
}) => {


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conditional Content Rendering */}
      <div>
        {viewType === "table" ? (
          <CategoryTable
            data={categories}
            onAddSub={onSub}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <CategoryTree
            data={categories}
            onAddSub={onSub}
            onSetDefault={onSetDefault}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">
            No categories found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
