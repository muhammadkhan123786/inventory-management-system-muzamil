import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Tag, X } from "lucide-react";
import { Label } from "@/components/form/Label";

interface AISuggestion {
  tags: string[];
  description: string;
  shortDescription: string;
  keywords: string;
}

interface AISuggestionsPanelProps {
  suggestions: AISuggestion | null;
  onApplySuggestion: (field: string, value: string) => void;
  onApplyAll: () => void;
  onAddTag: (tag: string) => void;
  onClose: () => void; // New prop to close the panel
}

export function AISuggestionsPanel({
  suggestions,
  onApplySuggestion,
  onApplyAll,
  onAddTag,
  onClose
}: AISuggestionsPanelProps) {
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  if (!suggestions) return null;

  const handleApply = (field: string, value: string) => {
    onApplySuggestion(field, value);
    setAppliedFields(prev => new Set(prev).add(field));
  };

  const handleApplyAll = () => {
    onApplyAll();
    setAppliedFields(new Set(['description', 'shortDescription', 'keywords']));
    // Don't close immediately, let user see the checkmarks
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const isApplied = (field: string) => appliedFields.has(field);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-lg relative"
    >
      {/* Close button */}
      <button
      type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start justify-between mb-4 pr-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              AI Suggestions Ready!
            </h4>
            <p className="text-sm text-gray-600">
              Review and apply auto-generated content
            </p>
          </div>
        </div>
        <button
        type="button"
          onClick={handleApplyAll}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Apply All
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold text-gray-600 mb-2 block">
            Suggested Tags:
          </Label>
          <div className="flex flex-wrap gap-2">
            {suggestions.tags.map((tag, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onAddTag(tag)}
                type="button"
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-300 hover:bg-green-200 transition-colors flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-600 block">
            Suggested Description:
          </Label>
          <div className="bg-white p-4 rounded-lg border border-green-200 text-sm text-gray-700 relative">
            {suggestions.description}
            <button
              onClick={() => handleApply("description", suggestions.description)}
              className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                isApplied("description")
                  ? "bg-green-600 text-white"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isApplied("description") ? "✓ Applied" : "Apply"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-600 block">
            Suggested Short Description:
          </Label>
          <div className="bg-white p-4 rounded-lg border border-green-200 text-sm text-gray-700 relative">
            {suggestions.shortDescription}
            <button
              onClick={() => handleApply("shortDescription", suggestions.shortDescription)}
              className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                isApplied("shortDescription")
                  ? "bg-green-600 text-white"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isApplied("shortDescription") ? "✓ Applied" : "Apply"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-600 block">
            Suggested SEO Keywords:
          </Label>
          <div className="bg-white p-4 rounded-lg border border-green-200 text-sm text-gray-700 relative">
            {suggestions.keywords}
            <button
              onClick={() => handleApply("keywords", suggestions.keywords)}
              className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                isApplied("keywords")
                  ? "bg-green-600 text-white"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              type="button"
            >
              {isApplied("keywords") ? "✓ Applied" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}