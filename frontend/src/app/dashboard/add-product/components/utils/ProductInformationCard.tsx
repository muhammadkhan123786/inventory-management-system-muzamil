"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TagIcon,
  X,
  Plus,
  ImageIcon,
  Upload,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/form/Input";
import { Textarea } from "@/components/form/Textarea";
import { Card, CardContent } from "@/components/form/Card";
import { Label } from "@/components/form/Label";
import { Button } from "@/components/form/CustomButton";
import { Badge } from "@/components/form/Badge";

interface ProductInformationCardProps {
  formData: {
    productName: string;
    sku: string;
    barcode: string;
    brand: string;
    manufacturer: string;
    modelNumber: string;
    description: string;
    shortDescription: string;
    keywords: string;
  };
  tags: string[];
  images: {
    file: File;
    preview: string;
    name: string;
  }[];
  newTag: string;
  onInputChange: (field: string, value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onNewTagChange: (value: string) => void;
  onImageUpload: any;
  onRemoveImage: (index: number) => void;
}

export function ProductInformationCard({
  formData,
  tags,
  newTag,
  onInputChange,
  onAddTag,
  onRemoveTag,
  onNewTagChange,
  images,
  onImageUpload,
  onRemoveImage,
}: ProductInformationCardProps) {
  const [keywordInput, setKeywordInput] = useState("");

  // Convert keywords string to array for display
  const keywordsArray = formData.keywords
    ? formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
    : [];

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const newKeyword = keywordInput.trim();
    if (!keywordsArray.includes(newKeyword)) {
      const updatedKeywords = [...keywordsArray, newKeyword].join(", ");
      onInputChange("keywords", updatedKeywords);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updatedKeywords = keywordsArray
      .filter((keyword) => keyword !== keywordToRemove)
      .join(", ");
    onInputChange("keywords", updatedKeywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: "tag" | "keyword") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "tag") onAddTag();
      else handleAddKeyword();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("e.target.files", e.target.files);
      // Pass the FileList directly to the parent's handler
      onImageUpload(e.target.files);
    }
  };

  console.log("Images in Card:", images);
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 -z-10"></div>
      <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500"></div>
        <CardContent className="p-8">
          {/* Header Section */}
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

          <div className="space-y-6">
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
                  className="border-2 border-blue-200 focus:border-blue-500"
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

            {/* Brand, Manufacturer, Model */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <Input
                  value={formData.brand}
                  onChange={(e) => onInputChange("brand", e.target.value)}
                  placeholder="e.g., Pride"
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Manufacturer
                </label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) =>
                    onInputChange("manufacturer", e.target.value)
                  }
                  placeholder="e.g., Pride Mobility"
                  className="border-2 border-cyan-200 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Model Number
                </label>
                <Input
                  value={formData.modelNumber}
                  onChange={(e) => onInputChange("modelNumber", e.target.value)}
                  placeholder="e.g., GO-GO-ELITE"
                  className="border-2 border-sky-200 focus:border-sky-500"
                />
              </div>
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
                className="border-2 border-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) =>
                  onInputChange("shortDescription", e.target.value)
                }
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
                className="border-2 border-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/50">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Product Images
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <AnimatePresence>
                  {images.map((img, index) => (
                    <motion.div
                      key={img.preview}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <img
                        src={img.preview}
                        alt={img.name}
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                      />

                      <button
                        type="button"
                        onClick={() => onRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-blue-600">
                          Primary
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Hidden file input for logic */}
              <input
                type="file"
                id="product-image-upload"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                onClick={() =>
                  document.getElementById("product-image-upload")?.click()
                }
                variant="outline"
                className="w-full border-2 border-blue-300 hover:bg-blue-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Product Image
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Upload multiple images. First image will be the primary product
                image.
              </p>
            </div>

            {/* SEO Keywords Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                SEO Keywords
              </Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "keyword")}
                  placeholder="Add a keyword..."
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
                <Button
                  type="button"
                  onClick={handleAddKeyword}
                  variant="outline"
                  className="border-2 border-blue-300"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {keywordsArray.map((keyword, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1.5 flex items-center gap-2"
                    >
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Tags
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newTag}
                  onChange={(e) => onNewTagChange(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "tag")}
                  placeholder="Add a tag..."
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
                <Button
                  type="button"
                  onClick={onAddTag}
                  variant="outline"
                  className="border-2 border-blue-300"
                >
                  <TagIcon className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1.5 cursor-pointer hover:bg-blue-200"
                    onClick={() => onRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-2" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
