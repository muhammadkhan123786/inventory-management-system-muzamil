'use client'
import React from 'react'
import { useState, useCallback, useEffect } from "react";
import { AISuggestionsPanel } from './AISuggestionsPanel';
import ImageUpload from "./ImageUpload" // Make sure this component exists

interface UploadedImage {
  id: string;
  preview: string;
  file?: File;
  progress: number;
  isUploading: boolean;
}

interface AIResponse {
  success: boolean;
  imageCount: number;
  imageUrls: any;
  ai: {
    shortDescription: string;
    description: string;
    tags: string[];
    keywords: string;
  };
}

interface ImageUploadSectionsProps {
  images: string[];
  tags: string[];
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
  onInputChange: (field: string, value: string) => void;
  onAddTag: () => void;
  onRemoveTag?: (tag: string) => void;
  onNewTagChange: (value: string) => void;
  onImageUpload: (files: FileList | File[]) => void;
onRemoveImage: (index: number, imageId: string) => void;
  setImage: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const ImageUploadSections = ({ 
  images, 
  tags, 
  onImageUpload,  
  onAddTag, 
  onInputChange, 
  onNewTagChange, 
  onRemoveImage,
  setImage, 
  formData 
}: ImageUploadSectionsProps) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<{
    tags: string[];
    description: string;
    shortDescription: string;
    keywords: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync images from parent
  useEffect(() => {
    if (images.length > 0 && uploadedImages.length === 0) {
      const initialImages = images.map((img, index) => ({
        id: `img-init-${index}`,
        preview: img,
        progress: 100,
        isUploading: false
      }));
      setUploadedImages(initialImages);
    }
  }, [images]);

  // Unified AI Analysis Logic
  const handleAnalyzeWithAI = async () => {
    // Collect all files currently in state
    
    const filesToAnalyze = uploadedImages
      .map(img => img.file)
      .filter((file): file is File => !!file);

    if (filesToAnalyze.length === 0) {
      alert("Please upload new images to analyze.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const data = new FormData();
      filesToAnalyze.forEach(file => data.append('images', file));

      const response = await fetch(`${BASE_URL}/ai`, {
        method: 'POST',
        body: data,
      });

      
      const result: AIResponse = await response.json();
      if (result.success && result.ai) {
        // 1. Remove duplicates from AI tags immediately
        const uniqueTags = Array.from(new Set(result.ai.tags.map(t => t.trim())));
        const suggestions = {
          ...result.ai,
          tags: uniqueTags
        };
// setImage((prevImages = []): string[] => {
  
//   const combinedImages = [...prevImages, ...result.imageUrls];
//   return Array.from(new Set(combinedImages));
// });
setImage(result.imageUrls);
 setAiSuggestions(suggestions);

        // 2. Auto-fill form if empty
        if (!formData.description) onInputChange("description", suggestions.description);
        if (!formData.shortDescription) onInputChange("shortDescription", suggestions.shortDescription);
        if (!formData.keywords) onInputChange("keywords", suggestions.keywords);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFilesUpload = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    // Create local previews and keep track of files
    const newImages: UploadedImage[] = imageFiles.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      preview: URL.createObjectURL(file),
      file: file,
      progress: 100,
      isUploading: false,
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
    
    // Upload to parent/cloud storage
    await onImageUpload(imageFiles);
  }, [onImageUpload]);

  const handleRemoveImage = useCallback((index: number, imageId: string) => {
    const img = uploadedImages.find(i => i.id === imageId);
    if (img?.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
    
    onRemoveImage(index, imageId);
    setUploadedImages(prev => prev.filter(i => i.id !== imageId));
  }, [uploadedImages, onRemoveImage]);

  const applyAllSuggestions = useCallback(() => {
    if (!aiSuggestions) return;

    // 1. Update text fields
    onInputChange("description", aiSuggestions.description);
    onInputChange("shortDescription", aiSuggestions.shortDescription);
    onInputChange("keywords", aiSuggestions.keywords);

    console.log("Applying tags:", aiSuggestions.tags);
    // 2. Add all tags at once
    if (aiSuggestions.tags.length > 0) {
      aiSuggestions.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          onNewTagChange(tag);
          onAddTag();
        }
      });
    }

    setAiSuggestions(null);
  }, [aiSuggestions, onInputChange, tags, onNewTagChange, onAddTag]);

  return (
    <div className="space-y-4">
      < ImageUpload
        uploadedImages={uploadedImages}
        onFilesUpload={handleFilesUpload}
        onRemoveImage={handleRemoveImage}
        isAnalyzing={isAnalyzing}
      />

      {/* Manual Trigger for AI - Better for Multi-image Context */}
      {uploadedImages.length > 0 && !aiSuggestions && (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "✨"}
            {isAnalyzing ? "Analyzing All Images..." : "Generate AI Description , KeyWord & Tags"}
          </button>
        </div>
      )}

      {aiSuggestions && (
        <AISuggestionsPanel
          suggestions={aiSuggestions}
          onApplySuggestion={onInputChange}
          onApplyAll={applyAllSuggestions}
          onAddTag={(tag) => {
            onNewTagChange(tag);
            onAddTag();
          }}
          onClose={() => setAiSuggestions(null)}
        />
      )}
    </div>
  );
}

export default ImageUploadSections;