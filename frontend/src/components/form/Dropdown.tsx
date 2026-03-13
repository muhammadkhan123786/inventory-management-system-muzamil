'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'Select...',
      className = '',
      disabled = false,
      required = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync internal state with external value for React Hook Form compatibility
    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <div ref={ref} className={`relative w-full ${className}`}>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div ref={dropdownRef} className="relative">
          {/* Trigger Button - Styled to match image_d2510f.png */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between gap-2
              px-4 h-[45px] text-sm
              bg-white border border-slate-200
              rounded-xl transition-all duration-200
              text-slate-600
              ${isOpen ? 'border-purple-400 ring-2 ring-purple-100' : 'hover:border-slate-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
            `}
          >
            <span className={`truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-purple-500' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu - Styled to match the scrollable list in image_d2c8f3.png */}
          {isOpen && (
            <div className="absolute z-[100] w-full mt-1.5 bg-white border border-slate-200  shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-1">
                {options.length > 0 ? (
                  options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2 text-sm
                        transition-colors text-left
                        ${
                          value === option.value
                            ? 'bg-purple-50 text-purple-700 font-medium'
                            : 'hover:text-white  hover:bg-gray-600'
                        }
                      `}
                    >
                      <span>{option.label}</span>
                      {value === option.value && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400 italic">No options available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CSS for the scrollbar matching the figma design */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}</style>
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;