"use client";
import React, { useMemo } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { ICategory } from "../../../../../../../common/ICategory.interface";
import { flattenCategories, FlatCategory } from "./flattenCategories";

interface Props {
  categories: ICategory[];
  field: ControllerRenderProps<any, "categoryId">;
  error?: string;
}

const CategorySelect: React.FC<Props> = ({ categories, field, error }) => {
  const flatCategories: FlatCategory[] = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  return (
    <div className="space-y-1">
      <select
        {...field}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                   bg-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select a category</option>

        {flatCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {/* {cat.level > 1 && "— ".repeat(cat.level - 1)} */}
            {cat.level > 1 && "└ "}
            {cat.path.join(" > ")}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CategorySelect;