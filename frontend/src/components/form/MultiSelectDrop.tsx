"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string | string[];
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  hideOnSelect?: boolean; // New prop to control closing behavior
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ 
    label, 
    options, 
    value, 
    onChange, 
    multiple, 
    placeholder = "Select...", 
    className = "", 
    disabled = false, 
    error,
    hideOnSelect = false 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Filter options based on search
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDisplayLabel = () => {
      if (multiple && Array.isArray(value)) {
        if (value.length === 0) return placeholder;
        // Show count instead of all labels to save space
        return `${value.length} selected`;
      }
      const selectedOption = options.find((opt) => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    };

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];
        onChange?.(newValues);
        
        // Only close if hideOnSelect is true
        if (hideOnSelect) {
          setIsOpen(false);
          setSearchTerm(""); // Clear search when closing
        }
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const isSelected = (optionValue: string) => {
      return multiple && Array.isArray(value)
        ? value.includes(optionValue)
        : value === optionValue;
    };

    const removeSelected = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening dropdown
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.filter((v) => v !== optionValue);
        onChange?.(newValues);
      }
    };

    // For multiple selection, show chips in the button
    const renderSelectedChips = () => {
      if (!multiple || !Array.isArray(value) || value.length === 0) {
        return <span className="truncate text-sm text-gray-700">{getDisplayLabel()}</span>;
      }

      // Find selected options
      const selectedOptions = options.filter(opt => value.includes(opt.value));
      
      // Show only first 2 chips in the button
      const displayChips = selectedOptions.slice(0, 2);
      const remainingCount = selectedOptions.length - 2;

      return (
        <div className="flex flex-wrap gap-1.5 items-center">
          {displayChips.map(option => (
            <div 
              key={option.value}
              className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium"
            >
              <span>{option.label}</span>
              <button
                type="button"
                onClick={(e) => removeSelected(option.value, e)}
                className="hover:bg-orange-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {remainingCount > 0 && (
            <span className="text-sm text-gray-500 ml-1">+{remainingCount} more</span>
          )}
        </div>
      );
    };

    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        {label && <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg bg-white transition-all ${
              error ? "border-red-500 shadow-sm" : "border-gray-200 focus:ring-2 focus:ring-orange-500"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-300"}`}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {multiple ? renderSelectedChips() : getDisplayLabel()}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              <div className="py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        isSelected(option.value) 
                          ? "bg-orange-50 text-orange-600 font-medium" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected(option.value) && <Check className="w-4 h-4 stroke-[3px]" />}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
export default Dropdown;