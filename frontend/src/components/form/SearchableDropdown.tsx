"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import clsx from "clsx";

/* =======================
   Types
======================= */

export interface SelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label: string;
  value?: string | null;
  options: SelectOption[] ;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

/* =======================
   Component
======================= */

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select option",
  helperText,
  required,
  disabled,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || "";

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="space-y-1.5">
      {/* Label */}
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-[6px] rounded-xl",
          "border bg-white text-left transition-all",
          "focus:outline-none focus:ring-4",
          open
            ? "border-purple-500 ring-purple-500/20"
            : "border-slate-300",
          error &&
            "border-red-500 ring-red-500/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={clsx(
            selectedLabel ? "text-slate-800" : "text-slate-400"
          )}
        >
          {selectedLabel || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={clsx(
            "text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="relative">
          <div className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-[6px] border-b">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full outline-none text-sm text-slate-700"
              />
            </div>

            {/* Options */}
            <div className="max-h-56 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={clsx(
                      "w-full flex items-center justify-between px-4 py-[6px] text-sm",
                      "hover:bg-slate-50 transition",
                      value === opt.value &&
                        "bg-purple-50 text-purple-600 font-semibold"
                    )}
                  >
                    {opt.label}
                    {value === opt.value && (
                      <Check size={16} />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-400">
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helper / Error */}
      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-slate-400">{helperText}</p>
        )
      )}
    </div>
  );
};

export default SearchableSelect;
