"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attributeSchemaValidation } from "./AttributeSchema";
import { FormInput, SearchableSelect, Button } from "@/components/form"; 

import Dropdown from "@/components/form/Dropdown";
import { Check, Star, AlertCircle, X, Plus } from "lucide-react";
import { createAttribute, updateAttribute } from "@/hooks/useAttributes";
import axios from "axios";
import { IAttribute } from "../../../../../../../common/IProductAttributes.interface";
import { ICategory } from "../../../../../../../common/ICategory.interface";
import  CategorySelect  from "./CategoryTreeSelect"

interface Props {
  editingData: IAttribute | null;
  onClose: () => void;
  onRefresh: () => void;
  themeColor: string;
}

const AttributeForm = ({
  editingData,
  onClose,
  onRefresh,
  themeColor,
}: Props) => {
  // Local state for the "Live" typing experience in the input
  const [currentTyping, setCurrentTyping] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attributeSchemaValidation),
    defaultValues: editingData
      ? {
          attributeName: editingData.attributeName,
          type: editingData.type,
          isRequired: editingData.isRequired ?? false,
          status: editingData.status ?? "active",
          categoryId: editingData?.categoryId || "",
          isDefault: editingData?.isDefault ?? false,
          options: editingData.options ?? [],
        
        }
      : {
          attributeName: "",
          type: "text",
          isRequired: false,
          status: "active",
          categoryId: "",
          isDefault: false,
          options: [],
          unit: "",
        },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  
  // Watch values for conditional logic
  const selectedType = watch("type");
  const optionsList = watch("options") || [];

  // Show options only for specific types
  const showOptionsField = ["list", "dropdown", "checkbox", "radio"].includes(selectedType);

  const handleAddOption = () => {
    if (!currentTyping.trim()) return;
    
    const newOption = { 
      label: currentTyping.trim(), 
      value: currentTyping.trim().toLowerCase().replace(/\s+/g, "_"), 
      sort: optionsList.length + 1 
    };

    setValue("options", [...optionsList, newOption]);
    setCurrentTyping(""); // Clear input
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllCategories(response?.data?.data || response?.data || []);
      } catch (error) { console.error(error); }
    };
    fetchCategories();
  }, []);

  const flatCategories = useMemo(() => {
    const flatten = (cats: ICategory[]): ICategory[] => {
      return cats.reduce((acc: ICategory[], cat) => {
        acc.push(cat);
        if (cat.children) acc.push(...flatten(cat.children));
        return acc;
      }, []);
    };
    return flatten(allCategories);
  }, [allCategories]);

  // const categoryOptions = useMemo(() => {
  //   return flatCategories.map(cat => ({ value: cat._id, label: cat.categoryName }));
  // }, [flatCategories]);

  const categoryOptions = useMemo(() => {
  return flatCategories
    .filter(cat => cat._id)
    .map(cat => ({
      value: cat._id!,            // now guaranteed
      label: cat.categoryName,
    }));
}, [flatCategories]);

console.log("error", errors)
  const onSubmit = async (data: any) => {
         const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload: Partial<IAttribute> = {
        attributeName: data.attributeName,
        type: data.type,
        isRequired: data.isRequired,
        status: data.status,
        categoryId: data.categoryId || null,
        isForSubcategories: data.isForSubcategories,
        isDefault: data.isDefault,
        userId: savedUser.id || savedUser._id,
        options: data.options || [],

      };
    console.log("Data", data);
    setIsSubmitting(true);
    try {
      if (editingData?._id) await updateAttribute(editingData._id, data);
      else await createAttribute(payload);
      onRefresh();
      onClose();
    } catch (err: any) { 
      alert(err?.response?.data?.message || "Operation failed"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      
      {/* Category Selection */}
      {/* <div className="space-y-1">        
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            // <SearchableSelect
            // label="Category"
            //   options={categoryOptions}
            //   value={field.value}
            //   onChange={field.onChange}
            //   placeholder="Select a category"
             
            // />
          )}
        />
      </div> */}
      {/* Category Selection */}
<div className="space-y-2">
  <label className="text-sm font-semibold text-slate-700">
    Category <span className="text-red-500">*</span>
  </label>

  <Controller
    name="categoryId"
    control={control}
    render={({ field }) => (
      <CategorySelect
        categories={allCategories}
        field={field}
        error={errors.categoryId?.message}
      />
    )}
  />
</div>

      {/* Attribute Name */}
      <div className="space-y-1">        
        <Controller
          name="attributeName"
          control={control}
          render={({ field }) => (
            <FormInput
              label="Attribute Name"
              {...field}
              required
              placeholder="e.g., Brand, Model, Color"
              className="rounded-xl border-slate-200"
              error={errors.attributeName?.message}
            />
          )}
        />
      </div>

      {/* Attribute Type */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">
          Attribute Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Dropdown
              {...field}
              options={[
                { label: "Text", value: "text" },
                { label: "List", value: "list" },
                { label: "Checkbox", value: "checkbox" },
                { label: "Dropdown", value: "dropdown" },
                { label: "Radio", value: "radio" },
                { label: "Number", value: "number" },
                { label: "Date", value: "date" },
                { label: "Textarea", value: "textarea" },
              ]}
              className="rounded-xl border-slate-200 h-[45px]"
            />
          )}
        />
        <p className="text-[11px] text-slate-400 mt-1">Select the type of this attribute</p>
      </div>

      {/* EXACT UI MATCH FOR OPTIONS/VALUES SECTION */}
      {showOptionsField && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Options/Values <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={currentTyping}
                  onChange={(e) => setCurrentTyping(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddOption(); }}}
                  className="w-full h-[45px] px-4 rounded-xl border-2 border-indigo-500/40 focus:border-purple-900 focus:ring-4 focus:ring-purple-900/20 outline-none transition-all shadow-sm font-medium text-slate-700"
                  placeholder="Type an option..."
                />
              </div>
              <button 
                type="button"
                onClick={() => setCurrentTyping("")}
                className="w-[45px] h-[45px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddOption}
            className="w-full h-[35px] border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-semibold hover:bg-slate-50 transition-all bg-white shadow-sm"
          >
            <Plus size={18} /> Add Option
          </button>

          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 italic">Enter the {selectedType} options</p>
            
            {/* THE PREVIEW BOX */}
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 min-h-[90px]">
              <p className="text-[11px] font-bold text-indigo-500 mb-3 uppercase tracking-wider">Preview:</p>
              <div className="flex flex-wrap gap-2">
                {/* Real-time typing pill */}
                {currentTyping && (
                  <div className="flex items-center gap-2 bg-indigo-100/80 text-indigo-600 px-4 py-1.5 rounded-full border border-indigo-200 opacity-60 italic">
                    <span className="text-xs font-bold">{currentTyping}</span>
                  </div>
                )}
                
                {/* Saved options pills */}
                {optionsList.map((opt: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full border border-indigo-200 shadow-sm"
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = optionsList.filter((_: any, i: number) => i !== idx);
                        setValue("options", newOpts);
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Cards (Active, Default, Required) */}
      <div className="space-y-3">
        {/* Active Status */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-100">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Active Status</h4>
                  <p className="text-[11px] text-slate-400">Make this attribute available for use</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={field.value === 'active'} 
                onChange={(e) => field.onChange(e.target.checked ? 'active' : 'inactive')}
                className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          )}
        />

        {/* Default Attribute */}
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-3 rounded-2xl border border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-100">
                  <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Default Attribute</h4>
                  <p className="text-[11px] text-slate-400">Set as default for this category</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={field.value} 
                onChange={field.onChange}
                className="w-5 h-5 rounded-lg border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          )}
        />

        {/* Required Field */}
        <Controller
          name="isRequired"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-3 rounded-2xl border border-red-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-md shadow-red-100">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Important/Required</h4>
                  <p className="text-[11px] text-slate-400">Mark as important or required field</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={field.value} 
                onChange={field.onChange}
                className="w-5 h-5 rounded-lg border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer"
              />
            </div>
          )}
        />
      </div>    

      <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">
           {isSubmitting ? "Processing..." : editingData ? "Update Attribute" : "+ Add Attribute"}
          </Button>
        </div>
    </form>
  );
};

export default AttributeForm;