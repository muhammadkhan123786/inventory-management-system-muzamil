"use client";
import { useState, useCallback, useEffect } from "react";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import ImageUpload from "./ImageUpload";
import { AIResponse, ImageItem, UploadedImage, BASE_URL } from "../../types/product";

interface ImageUploadSectionsProps {
  images: ImageItem[];
  formData: {
    description: string;
    shortDescription: string;
    keywords: string;
    tags: string;
    [key: string]: any;
  };
  onInputChange: (field: string, value: string) => void;
  onImageUpload: (files: FileList | File[]) => Promise<void> | void;
  onRemoveImage: (index: number) => void;
  /** Called with server-stored URLs after AI upload */
  setImage: (urls: string[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toUploadedImage(img: ImageItem, index: number): UploadedImage {
  return {
    id: `img-init-${index}`,
    preview: img.preview,
    file: img.file,
    progress: 100,
    isUploading: false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUploadSections({
  images,
  formData,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  setImage,
}: ImageUploadSectionsProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AIResponse["ai"] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync parent images into local state on first render
  useEffect(() => {
    if (images.length > 0 && uploadedImages.length === 0) {
      setUploadedImages(images.map(toUploadedImage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // ─── File upload handler ────────────────────────────────────────────────────
  const handleFilesUpload = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (!imageFiles.length) return;

      const newImages: UploadedImage[] = imageFiles.map((file, i) => ({
        id: `img-${Date.now()}-${i}`,
        preview: URL.createObjectURL(file),
        file,
        progress: 100,
        isUploading: false,
      }));

      setUploadedImages((prev) => [...prev, ...newImages]);
      await onImageUpload(imageFiles);
    },
    [onImageUpload]
  );

  // ─── Remove handler ─────────────────────────────────────────────────────────
  const handleRemoveImage = useCallback(
    (index: number, imageId: string) => {
      const img = uploadedImages.find((i) => i.id === imageId);
      if (img?.preview.startsWith("blob:")) URL.revokeObjectURL(img.preview);
      setUploadedImages((prev) => prev.filter((i) => i.id !== imageId));
      onRemoveImage(index);
    },
    [uploadedImages, onRemoveImage]
  );

  // ─── AI analysis ────────────────────────────────────────────────────────────
  const handleAnalyzeWithAI = async () => {
    const files = uploadedImages
      .map((img) => img.file)
      .filter((f): f is File => Boolean(f));

    if (!files.length) {
      alert("Please upload images to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const body = new FormData();
      files.forEach((f) => body.append("images", f));

      const res = await fetch(`${BASE_URL}/ai`, { method: "POST", body });
      const result: AIResponse = await res.json();

      if (result.success && result.ai) {
        const { description, shortDescription, keywords, tags } = result.ai;

        setAiSuggestions(result.ai);

        // Store server URLs so the DB receives URLs, not large base64 blobs
        if (result.imageUrls?.length) setImage(result.imageUrls);

        // Auto-fill only empty fields
        if (!formData.description) onInputChange("description", description);
        if (!formData.shortDescription) onInputChange("shortDescription", shortDescription);
        if (!formData.keywords) onInputChange("keywords", keywords);
        if (!formData.tags) onInputChange("tags", tags);
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ─── Apply all AI suggestions ───────────────────────────────────────────────
  const applyAllSuggestions = useCallback(() => {
    if (!aiSuggestions) return;
    onInputChange("description", aiSuggestions.description);
    onInputChange("shortDescription", aiSuggestions.shortDescription);
    onInputChange("keywords", aiSuggestions.keywords);
    onInputChange("tags", aiSuggestions.tags);
    setAiSuggestions(null);
  }, [aiSuggestions, onInputChange]);

  return (
    <div className="space-y-4">
      <ImageUpload
        uploadedImages={uploadedImages}
        onFilesUpload={handleFilesUpload}
        onRemoveImage={handleRemoveImage}
        isAnalyzing={isAnalyzing}
      />

      {uploadedImages.length > 0 && !aiSuggestions && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {isAnalyzing ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "✨"
            )}
            {isAnalyzing
              ? "Analyzing images…"
              : "Generate AI Description, Keywords & Tags"}
          </button>
        </div>
      )}

      {aiSuggestions && (
        <AISuggestionsPanel
          suggestions={aiSuggestions}
          onApplySuggestion={onInputChange}
          onApplyAll={applyAllSuggestions}
          onClose={() => setAiSuggestions(null)}
        />
      )}
    </div>
  );
}