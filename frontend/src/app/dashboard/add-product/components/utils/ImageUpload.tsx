// components/utils/ImageUploadSection.tsx
'use client'
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface UploadedImage {
  id: string;
  preview: string;
  file?: File;
  progress: number;
  isUploading: boolean;
}

interface ImageUploadSectionProps {
  uploadedImages: UploadedImage[];
  onFilesUpload: (files: FileList) => Promise<void>;
  onRemoveImage: (index: number, imageId: string) => void;
  isAnalyzing: boolean;
}

const ImageUploadSection = ({
  uploadedImages,
  onFilesUpload,
  onRemoveImage,
  isAnalyzing,
}: ImageUploadSectionProps) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesUpload(files);
    }
  }, [onFilesUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesUpload(e.target.files);
    }
  }, [onFilesUpload]);

  const handleBrowseClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        onFilesUpload(target.files);
      }
    };
    input.click();
  }, [onFilesUpload]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative group"
      >
        <div className="border-3 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 p-8 transition-all duration-300 hover:shadow-lg">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Drag & Drop Product Images
              </h3>
              <p className="text-gray-600 mb-4">
                Upload high-quality images (JPEG, PNG, WebP, GIF). 
                <span className="block text-sm text-gray-500 mt-1">
                  First image will be used as the main product image
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleBrowseClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ImageIcon className="h-5 w-5" />
                Browse Files
              </button>
              
              {uploadedImages.length > 0 && !isAnalyzing && (
                <button
                  type="button"
                  onClick={() => document.getElementById('ai-generate-btn')?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate with AI
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Supports JPG, PNG, WebP, GIF • Max 10MB per image • Max 10 images
            </p>
          </div>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
        </div>
      </div>

      {/* Image Preview Grid */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Uploaded Images ({uploadedImages.length}/10)
            </h4>
            {uploadedImages.some(img => img.isUploading) && (
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                Uploading...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {uploadedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square"
                >
                  <div className="relative h-full w-full rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                    <img
                      src={image.preview}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    
                    {/* Main Image Indicator */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-lg font-medium shadow-md">
                        Main Image
                      </div>
                    )}
                    
                    {/* Progress Bar */}
                    {image.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-3/4 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${image.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index, image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    {/* Image Number */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Upload Status */}
          {uploadedImages.some(img => img.isUploading) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Uploading images...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(uploadedImages.filter(img => img.progress === 100).length / uploadedImages.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden AI Button for external trigger */}
      <button id="ai-generate-btn" className="hidden" aria-hidden="true"></button>
    </div>
  );
};

export default ImageUploadSection;