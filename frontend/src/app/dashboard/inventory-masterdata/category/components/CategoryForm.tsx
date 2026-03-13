"use client";
import React, { useState, useMemo, useEffect } from "react"; // Added useEffect
import { Check, Star } from "lucide-react";
import axios from "axios";

import { ICategory } from "../../../../../../../common/ICategory.interface";
import { createCategory, updateCategory } from "@/hooks/useCategory";
import { Button, FormInput, SearchableSelect } from "@/components/form";

interface Props {
  editingData: ICategory | null;
  allCategories: ICategory[];
  onClose: () => void;
  onRefresh: () => void;
  initialCategoryId?: string | null; 
}

const CategoryForm = ({
  editingData,
  allCategories = [],
  onClose,
  onRefresh,
  
  initialCategoryId, 
}: Props) => {

  /* ============================
     2️⃣ Auto-fill Logic (NEW)
  ============================ */
  useEffect(() => {
    // If we are adding a NEW category and a parent was pre-selected via the Tree "+" button
    if (!editingData && initialCategoryId) {
      setFormData((prev) => ({
        ...prev,
        parentId: initialCategoryId,
      }));
      setIsSubCategory(true);
    }
  }, [initialCategoryId, editingData]);

  /* ... Flattening Logic remains the same ... */
 const flattenCategories = (
  categories: ICategory[] = [],
  parent: ICategory | null = null
): ICategory[] => {
  let result: ICategory[] = [];

  for (const cat of categories) {
    const parentId =
      parent?._id ??
      (typeof cat.parentId === "string"
        ? cat.parentId
        : cat.parentId?._id ?? null);

    result.push({
      ...cat,
      parentId,
    });

    if (cat.children?.length) {
      result = result.concat(flattenCategories(cat.children, cat));
    }
  }

  return result;
};


  const flatCategories = useMemo(() => flattenCategories(allCategories), [allCategories]);

  const getParentIdString = (parent: any): string => {
    if (!parent) return "";
    if (typeof parent === "string") return parent;
    return parent._id || "";
  };

  /* ============================
     3️⃣ State Management
  ============================ */
  const [isSubCategory, setIsSubCategory] = useState<boolean>(
    !!editingData?.parentId || !!initialCategoryId // Set true if parent exists
  );

  const [formData, setFormData] = useState({
    categoryName: editingData?.categoryName || "",
    parentId: getParentIdString(editingData?.parentId) || (initialCategoryId ?? ""), // Fallback to initial
    isActive: editingData?.isActive ?? true,
    isDefault: editingData?.isDefault ?? false,
  });

  const categoryOptions = useMemo(() => {
    const getFullPath = (cat: ICategory): string => {
      if (!cat.parentId) return cat.categoryName;
      const parent = flatCategories.find(c => c._id === (typeof cat.parentId === "string" ? cat.parentId : cat.parentId?._id));
      return parent ? `${getFullPath(parent)} > ${cat.categoryName}` : cat.categoryName;
    };

    return flatCategories
      .filter((cat) => cat._id !== editingData?._id)
      .map((cat) => ({
        value: cat._id || "",
        label: getFullPath(cat),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [flatCategories, editingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload: Partial<ICategory> = {
        categoryName: formData.categoryName,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        userId: savedUser._id || savedUser.id,
        // Logic: if parentId has a value, use it.
...(formData.parentId && { parentId: formData.parentId }),

};

      if (editingData?._id) {
        await updateCategory(editingData._id, payload as any);
      } else {
        console.log("pay", payload);
        await createCategory(payload as any);
      }

      onRefresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Operation failed");
      }
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="animate-in slide-in-from-top-2 duration-200">
            
            <SearchableSelect
            label="Parent Category"
              options={categoryOptions}
              value={formData.parentId}
              onChange={(val: string) => {
                setFormData({ ...formData, parentId: val });
                setIsSubCategory(!!val); // Auto-toggle sub-category status if value exists
              }}
              placeholder="Search & Select Parent..."

            />
            <p className="text-[11px] text-slate-400 mt-2 ml-1">
              {formData.parentId ? "Adding as a Sub-category" : "Adding as a Root category"}
            </p>
          </div>
        </div>

        <FormInput
          label="Category Name"
          value={formData.categoryName}
          placeholder="e.g., Mobility Scooters"
          onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
          required
        />

        {/* ... Checkbox Cards stay exactly the same ... */}
        <div className="space-y-4">
            {/* Active Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-[1.5rem] border transition-all ${formData.isActive ? "border-emerald-100 bg-emerald-50/20" : "border-slate-100 bg-white"}`}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00C853] flex items-center justify-center text-white"><Check size={20}/></div>
                    <div><h4 className="font-bold text-[#2D3748] text-[15px]">Active Status</h4></div>
                </div>
                <input type="checkbox" checked={formData.isActive} onChange={() => setFormData({...formData, isActive: !formData.isActive})} />
            </div>

            {/* Default Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-[1.5rem] border transition-all ${formData.isDefault ? "border-amber-200 bg-amber-50/20" : "border-[#FFF59D] bg-white"}`}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFA000] flex items-center justify-center text-white"><Star size={20} fill="white"/></div>
                    <div><h4 className="font-bold text-[#2D3748] text-[15px]">Default Category</h4></div>
                </div>
                <input type="checkbox" checked={formData.isDefault} onChange={() => setFormData({...formData, isDefault: !formData.isDefault})} />
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">
            {editingData ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;