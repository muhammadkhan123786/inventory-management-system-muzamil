import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/form/Card";
import { Label } from "@/components/form/Label";

interface UploadedImage {
  id: string;
  preview: string;
  progress: number;
  isUploading: boolean;
}

interface ImageUploadSectionProps {
  uploadedImages: UploadedImage[];
  onFilesUpload: (files: FileList) => void;
  onRemoveImage: (index: number, imageId: string) => void;
  isAnalyzing: boolean;
  
}

export function ImageUploadSection({
  uploadedImages,
  onFilesUpload,
  onRemoveImage,
  isAnalyzing,
  
}: ImageUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesUpload(files);
    }
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          Product Images
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Upload Product Images
            </Label>
            <p className="text-sm text-gray-600 mb-4">
              Upload images to auto-generate descriptions with AI. Drag & drop
              or click to select multiple images.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-100/50 scale-[1.02]"
                : "border-blue-300 bg-white/50 hover:bg-blue-50/50"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
              multiple
            />

            {isAnalyzing ? (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="h-12 w-12 text-blue-500" />
                </motion.div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing Images with AI...
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Generating tags, descriptions, and keywords
                </p>
                <div className="max-w-xs mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${uploadedImages.find(img => img.isUploading)?.progress || 0}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {uploadedImages.find(img => img.isUploading)?.progress || 0}% complete
                </p>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="cursor-pointer block text-center"
              >
                <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports: JPG, PNG, WebP (Max 5MB each)
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                  <Upload className="h-5 w-5" />
                  Select Images
                </div>
              </label>
            )}
          </div>

          {/* Uploaded Images Grid */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Uploaded Images ({uploadedImages.length})
                </Label>
                <span className="text-xs text-gray-500">
                  First image will be used as primary for AI analysis
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploadedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-blue-200 shadow-md bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {(image.progress > 0 && image.progress < 100) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center">
                            {image.isUploading ? (
                              <>
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <span className="text-xs text-white">
                                  {image.progress}%
                                </span>
                              </>
                            ) : (
                              <div className="text-white text-sm">
                                Uploading...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveImage(index, image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 z-10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                    {image.progress === 100 && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        ✓
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}