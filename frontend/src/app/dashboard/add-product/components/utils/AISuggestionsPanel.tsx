"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Label } from "@/components/form/Label";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AISuggestions {
  /** Comma-separated string */
  tags: string;
  description: string;
  shortDescription: string;
  /** Comma-separated string */
  keywords: string;
}

interface AISuggestionsPanelProps {
  suggestions: AISuggestions;
  onApplySuggestion: (field: string, value: string) => void;
  onApplyAll: () => void;
  onClose: () => void;
}

// ─── Field row ────────────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string;
  value: string;
  field: string;
  applied: boolean;
  onApply: (field: string, value: string) => void;
}

function FieldRow({ label, value, field, applied, onApply }: FieldRowProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-600 block">{label}</Label>
      <div className="bg-white p-4 rounded-lg border border-green-200 text-sm text-gray-700 relative pr-24">
        <p className="whitespace-pre-wrap leading-relaxed">{value}</p>
        <button
          type="button"
          onClick={() => onApply(field, value)}
          className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
            applied
              ? "bg-green-600 text-white cursor-default"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
          disabled={applied}
        >
          {applied ? "✓ Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function AISuggestionsPanel({
  suggestions,
  onApplySuggestion,
  onApplyAll,
  onClose,
}: AISuggestionsPanelProps) {
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const handleApply = useCallback(
    (field: string, value: string) => {
      onApplySuggestion(field, value);
      setApplied((prev) => new Set(prev).add(field));
    },
    [onApplySuggestion]
  );

  const handleApplyAll = useCallback(() => {
    onApplyAll();
    setApplied(new Set(["description", "shortDescription", "keywords", "tags"]));
    setTimeout(onClose, 1500);
  }, [onApplyAll, onClose]);

  const fields: { label: string; field: keyof AISuggestions }[] = [
    { label: "Suggested Tags (comma-separated)", field: "tags" },
    { label: "Suggested Description", field: "description" },
    { label: "Suggested Short Description", field: "shortDescription" },
    { label: "Suggested SEO Keywords (comma-separated)", field: "keywords" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-lg relative"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pr-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">AI Suggestions Ready!</h4>
            <p className="text-sm text-gray-600">Review and apply auto-generated content</p>
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

      {/* Fields */}
      <div className="space-y-4">
        {fields.map(({ label, field }) => (
          <FieldRow
            key={field}
            label={label}
            value={suggestions[field]}
            field={field}
            applied={applied.has(field)}
            onApply={handleApply}
          />
        ))}
      </div>
    </motion.div>
  );
}