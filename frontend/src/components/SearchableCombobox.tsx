"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Tells the combobox how to read/display each item of type T.
 */
export interface ComboboxItemConfig<T> {
  /** Unique identifier for each item */
  getKey: (item: T) => string;
  /** Primary text shown in the dropdown row (bold) */
  getLabel: (item: T) => string;
  /** Secondary text shown below the label (e.g. SKU, email) */
  getSubLabel?: (item: T) => string;
  /** Right-side primary text (e.g. "£20.00") */
  getRightLabel?: (item: T) => string;
  /** Right-side secondary text (e.g. "Stock: 12") */
  getRightSubLabel?: (item: T) => string;
  
  getSearchFields: (item: T) => string[];
}

export interface SearchableComboboxProps<T> {
  /** All items to display / filter */
  items: T[];
 
  inputValue: string;
 
  isSelected: boolean;
  
  onInputChange: (value: string) => void;
  /** Called when the user clicks an item in the list */
  onSelect: (item: T) => void;
  /** Called when the user clicks the × button */
  onClear: () => void;
  /**
   * Fired exactly once, the first time the dropdown opens.
   * Use this to lazily trigger an API fetch (fire-once optimisation).
   */
  onFirstOpen?: () => void;
  /** Rendering config */
  config: ComboboxItemConfig<T>;
  /** Input placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Show a "Loading…" state in the list */
  isLoading?: boolean;
  /** Tailwind class(es) added to the outer wrapper div */
  className?: string;
  /** Colour theme for border / hover / text accents */
  colorTheme?: "indigo" | "blue" | "emerald" | "teal" | "purple";
}

// ─── Theme map ─────────────────────────────────────────────────────────────────

const themes = {
  indigo: {
    input:     "hover:border-indigo-300 focus:border-indigo-400",
    panel:     "border-indigo-100",
    itemHover: "hover:bg-indigo-50",
    labelHover:"group-hover:text-indigo-700",
    rightPrice:"text-indigo-600",
  },
  blue: {
    input:     "hover:border-blue-300 focus:border-blue-400",
    panel:     "border-blue-100",
    itemHover: "hover:bg-blue-50",
    labelHover:"group-hover:text-blue-700",
    rightPrice:"text-blue-600",
  },
  emerald: {
    input:     "hover:border-emerald-300 focus:border-emerald-400",
    panel:     "border-emerald-100",
    itemHover: "hover:bg-emerald-50",
    labelHover:"group-hover:text-emerald-700",
    rightPrice:"text-emerald-600",
  },
  teal: {
    input:     "hover:border-teal-300 focus:border-teal-400",
    panel:     "border-teal-100",
    itemHover: "hover:bg-teal-50",
    labelHover:"group-hover:text-teal-700",
    rightPrice:"text-teal-600",
  },
  purple: {
    input:     "hover:border-purple-300 focus:border-purple-400",
    panel:     "border-purple-100",
    itemHover: "hover:bg-purple-50",
    labelHover:"group-hover:text-purple-700",
    rightPrice:"text-purple-600",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function SearchableCombobox<T>({
  items,
  inputValue,
  isSelected,
  onInputChange,
  onSelect,
  onClear,
  onFirstOpen,
  config,
  placeholder = "Search…",
  disabled = false,
  isLoading = false,
  className = "",
  colorTheme = "indigo",
}: SearchableComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const theme      = themes[colorTheme];

  // ── Close when clicking outside ─────────────────────────────────────────
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Filtered items based on current inputValue ───────────────────────────
  const filtered = items.filter((item) => {
    const q = inputValue.toLowerCase();
    return config.getSearchFields(item).some((f) => f.toLowerCase().includes(q));
  });

  // ── First open: fire the lazy-load callback once ─────────────────────────
  const openDropdown = useCallback(() => {
    if (!hasOpened) {
      setHasOpened(true);
      onFirstOpen?.();
    }
    setIsOpen(true);
  }, [hasOpened, onFirstOpen]);

  // ── Input change: pass value up, open list ───────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
    setIsOpen(true);
  };

  // ── User picks an item ────────────────────────────────────────────────────
  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  // ── Clear button ──────────────────────────────────────────────────────────
  const handleClear = () => {
    onClear();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* ── Text input (IS the search box) ── */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          onChange={handleChange}
          onFocus={openDropdown}
          onClick={openDropdown}
          className={`w-full h-10 px-3 pr-8 rounded-md border-2 border-gray-200
                      focus:outline-none transition-colors text-sm bg-white
                      placeholder:text-gray-400 disabled:opacity-50
                      disabled:cursor-not-allowed ${theme.input}`}
        />

        {/* × clear button — only when something is selected or typed */}
        {(isSelected || inputValue) && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2
                       text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Dropdown list ── */}
      {isOpen && (
        <ul
          className={`absolute z-50 top-full mt-1 w-full bg-white rounded-lg
                      shadow-xl border-2 max-h-52 overflow-y-auto
                      divide-y divide-gray-50 ${theme.panel}`}
        >
          {isLoading ? (
            <li className="px-3 py-3 text-sm text-gray-400 text-center">
              Loading…
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-3 text-sm text-gray-400 text-center">
              No results found.
            </li>
          ) : (
            filtered.map((item) => (
              <li
                key={config.getKey(item)}
                // Prevent input blur from firing before onClick registers
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className={`flex items-center justify-between px-3 py-2.5
                            cursor-pointer transition-colors text-sm group
                            ${theme.itemHover}`}
              >
                {/* Left: label + sub-label */}
                <div className="min-w-0">
                  <p className={`font-medium text-gray-900 truncate ${theme.labelHover}`}>
                    {config.getLabel(item)}
                  </p>
                  {config.getSubLabel && (
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {config.getSubLabel(item)}
                    </p>
                  )}
                </div>

                {/* Right: price / stock / etc. */}
                {(config.getRightLabel || config.getRightSubLabel) && (
                  <div className="text-right text-xs text-gray-500 shrink-0 ml-3">
                    {config.getRightSubLabel && (
                      <p>{config.getRightSubLabel(item)}</p>
                    )}
                    {config.getRightLabel && (
                      <p className={`font-semibold ${theme.rightPrice}`}>
                        {config.getRightLabel(item)}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}