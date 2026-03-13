"use client";

import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronRight, Layers, Loader2 } from "lucide-react";
import { Badge } from "@/components/form/Badge";
import { Card, CardContent } from "@/components/form/Card";
import { LEVEL_STYLES, CategoryStepProps } from "../../types/product";
import { flattenCategories, FlatCategory } from "../utils/flattenCategories";
import {
  SearchableCombobox,
  ComboboxItemConfig,
} from "@/components/SearchableCombobox";

// ─── Extended props ────────────────────────────────────────────────────────────
interface EnhancedCategoryStepProps extends CategoryStepProps {
  /**
   * IDs of categories that have at least one attribute.
   * - undefined  → still loading, show spinner
   * - Set (even empty) → loaded, filter strictly
   */
  attributeCategoryIds?: Set<string>;
  /** true while the Set is being fetched */
  attributeIdsLoading?: boolean;
  onFullPathSelect?: (pathIds: string[]) => void;
}

// ─── Combobox config ──────────────────────────────────────────────────────────
const categoryConfig: ComboboxItemConfig<FlatCategory> = {
  getKey: (c) => c.id,
  getLabel: (c) => c.categoryName,
  getSubLabel: (c) => (c.path.length > 1 ? c.path.slice(0, -1).join(" › ") : ""),
  getRightLabel: (c) => `L${c.level}`,
  getSearchFields: (c) => [c.categoryName, ...c.path],
};

// ─── Component ────────────────────────────────────────────────────────────────
export function CategoryStep({
  categories,
  selectedPath = [],
  selectedCategories = [],
  handleCategorySelect,
  attributes,
  attributeCategoryIds,
  attributeIdsLoading = false,
  onFullPathSelect,
}: EnhancedCategoryStepProps) {
  const [inputValue, setInputValue] = useState("");

  const allFlat: FlatCategory[] = useMemo(
    () => flattenCategories(categories ?? []),
    [categories]
  );

  const filterable: FlatCategory[] = useMemo(() => {
    if (attributeIdsLoading || attributeCategoryIds === undefined) return [];
    return allFlat.filter((c) => attributeCategoryIds.has(c.id));
  }, [allFlat, attributeCategoryIds, attributeIdsLoading]);

  const selectedFlat = useMemo(
    () =>
      selectedPath.length
        ? allFlat.find((c) => c.id === selectedPath[selectedPath.length - 1]) ?? null
        : null,
    [allFlat, selectedPath]
  );

  const handleSelect = useCallback(
    (cat: FlatCategory) => {
      setInputValue(cat.path.join(" › "));
      if (onFullPathSelect) {
        onFullPathSelect(cat.pathIds);
      } else {
        cat.pathIds.forEach((id, level) => handleCategorySelect?.(level, id));
      }
    },
    [onFullPathSelect, handleCategorySelect]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    if (onFullPathSelect) {
      onFullPathSelect([]);
    } else {
      handleCategorySelect?.(0, "");
    }
  }, [onFullPathSelect, handleCategorySelect]);

  const isLoading = attributeIdsLoading || attributeCategoryIds === undefined;

  return (
    <motion.div
      key="step-category"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* ── Glow background (original style) ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 -z-10" />

      <Card className="border-0 shadow-2xl  bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        {/* Top gradient bar (original style) */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />

        <CardContent className="p-8">
          {/* ── Header (original style) ── */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shrink-0"
            >
              <Layers className="h-7 w-7 text-white" />
            </motion.div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Product Categories
              </h2>
              <p className="text-sm text-gray-600">
                {isLoading
                  ? "Loading categories…"
                  : `${filterable.length} categories available`}
              </p>
            </div>

            {/* Spinner while loading */}
            {isLoading && (
              <Loader2 className="h-5 w-5 text-purple-400 animate-spin shrink-0" />
            )}
          </div>

          {/* ── Searchable Combobox ── */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Badge className={LEVEL_STYLES[0]?.badge}>
                  Category
                </Badge>
                Select Category
              </label>

              <SearchableCombobox<FlatCategory>
                items={filterable}
                inputValue={inputValue}
                isSelected={!!selectedFlat}
                onInputChange={setInputValue}
                onSelect={handleSelect}
                onClear={handleClear}
                config={categoryConfig}
                placeholder={
                  isLoading
                    ? "Loading categories…"
                    : filterable.length === 0
                      ? "No categories with attributes found"
                      : "Search or select a category…"
                }
                disabled={isLoading}
                isLoading={isLoading}
                colorTheme="purple"
              />

              {/* Zero-result hint */}
              {!isLoading && filterable.length === 0 && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                  No categories have attributes configured yet. Add attributes to a category first.
                </p>
              )}
            </div>

            {/* ── Category Path Preview (original style) ── */}
            {selectedCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-purple-50 via-cyan-50 to-teal-50 rounded-xl border-2 border-purple-200"
              >
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Selected Category Path:
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCategories.map((cat, index) => (
                    <div key={cat._id} className="flex items-center gap-2">
                      {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <Badge
                        className={
                          LEVEL_STYLES[index]?.subCat ||
                          "bg-green-100 text-green-700 border border-green-300 px-3 py-1.5 text-sm"
                        }
                      >
                        {cat.categoryName}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Attributes found (original completion style) ── */}
            <AnimatePresence>
              {selectedCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 rounded-xl border-2 ${attributes && attributes.length > 0
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                    : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${attributes && attributes.length > 0
                        ? "bg-green-500"
                        : "bg-amber-400"
                        }`}
                    >
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      {attributes && attributes.length > 0 ? (
                        <>
                          <p className="text-sm font-bold text-green-900">
                            Category Selection Complete!
                          </p>
                          <p className="text-xs text-green-700">
                            {attributes.length} attribute{attributes.length !== 1 ? "s" : ""} found.
                            Click "Next" to continue with product details.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-amber-900">
                            No attributes for this category
                          </p>
                          <p className="text-xs text-amber-700">
                            Try selecting a more specific sub-category.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}