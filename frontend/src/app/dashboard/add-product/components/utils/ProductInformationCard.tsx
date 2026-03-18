"use client";
import { useState, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, TagIcon, X, Plus } from "lucide-react";
import { Input } from "@/components/form/Input";
import { Textarea } from "@/components/form/Textarea";
import { Card, CardContent } from "@/components/form/Card";
import { Label } from "@/components/form/Label";
import { Button } from "@/components/form/CustomButton";
import { Badge } from "@/components/form/Badge";
import ImageUploadSections from "./ImageUploadSections";
import { BasicInfoStepProps } from "../../types/product";

// ─── Reusable chip-input (used for both keywords & tags) ──────────────────────

interface ChipInputProps {
  label: string;
  placeholder: string;
  value: string; // comma-separated string stored in formData
  onChange: (next: string) => void;
  colorClass?: string;
}

function ChipInput({
  label,
  placeholder,
  value,
  onChange,
  colorClass = "blue",
}: ChipInputProps) {
  const [input, setInput] = useState("");

  const chips = value
    ? value
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const add = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || chips.includes(trimmed)) return;
    onChange([...chips, trimmed].join(", "));
    setInput("");
  }, [input, chips, onChange]);

  const remove = useCallback(
    (chip: string) => {
      onChange(
        chips
          .filter((c) => c !== chip)
          .join(", ")
      );
    },
    [chips, onChange]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`border-2 border-${colorClass}-200 focus:border-${colorClass}-500`}
        />
        <Button
          type="button"
          onClick={add}
          variant="outline"
          className={`border-2 border-${colorClass}-300 whitespace-nowrap`}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {chips.map((chip) => (
              <motion.div
                key={chip}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  className={`bg-${colorClass}-100 text-${colorClass}-700 px-3 py-1.5 flex items-center gap-2`}
                >
                  {chip}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => remove(chip)}
                  />
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function ProductInformationCard({
  formData,
  images,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  setImage,
}: BasicInfoStepProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 -z-10" />

      <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500" />

        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg"
            >
              <FileText className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Basic Information
              </h2>
              <p className="text-sm text-gray-600">
                Product name, SKU, descriptions, and images
              </p>
            </div>
          </div>

          {/* Image upload + AI */}
          <ImageUploadSections
            images={images}
            formData={formData}
            onInputChange={onInputChange}
            onImageUpload={onImageUpload}
            onRemoveImage={onRemoveImage}
            setImage={setImage}
          />

          <div className="space-y-6 mt-6">
            {/* Product Name & SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.productName}
                  onChange={(e) => onInputChange("productName", e.target.value)}
                  placeholder="e.g., Travel Mobility Scooter Pro"
                   className="border-2 border-cyan-200 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.sku}
                  onChange={(e) => onInputChange("sku", e.target.value)}
                  placeholder="e.g., MS-TRAV-001"
                  className="border-2 border-cyan-200 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Brand / Manufacturer / Model */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(
                [
                  { field: "brand", label: "Brand", placeholder: "e.g., Pride", color: "cyan" },
                  { field: "manufacturer", label: "Manufacturer", placeholder: "e.g., Pride Mobility", color: "cyan" },
                  { field: "modelNumber", label: "Model Number", placeholder: "e.g., GO-GO-ELITE", color: "cyan" },
                ] as const
              ).map(({ field, label, placeholder, color }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                  </label>
                  <Input
                    value={formData[field]}
                    onChange={(e) => onInputChange(field, e.target.value)}
                    placeholder={placeholder}
                    className={`border-2 border-${color}-200 focus:border-${color}-500`}
                  />
                </div>
              ))}
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barcode / EAN
              </label>
              <Input
                value={formData.barcode}
                onChange={(e) => onInputChange("barcode", e.target.value)}
                placeholder="e.g., 5060123456789"
                 className="border-2 border-cyan-200 focus:border-cyan-500"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => onInputChange("shortDescription", e.target.value)}
                placeholder="Brief one-line description (max 160 characters)"
                rows={2}
                maxLength={160}
                className="border-2 border-cyan-200 focus:border-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/160 characters
              </p>
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => onInputChange("description", e.target.value)}
                placeholder="Detailed product description, features, benefits..."
                rows={6}
                 className="border-2 border-cyan-200 focus:border-cyan-500"
              />
            </div>

            {/* Keywords — Enter or comma to add */}
            <ChipInput
              label="SEO Keywords"
              placeholder="Type a keyword and press Enter..."
              value={formData.keywords}
              onChange={(val) => onInputChange("keywords", val)}
              colorClass="cyan"
            />

            {/* Tags — same behaviour as keywords */}
            <ChipInput
              label="Product Tags"
              placeholder="Type a tag and press Enter..."
              value={formData.tags}
              onChange={(val) => onInputChange("tags", val)}
              colorClass="cyan"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}