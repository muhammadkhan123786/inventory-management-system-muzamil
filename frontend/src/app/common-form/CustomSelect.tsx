"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";

export const CustomSelect = ({
  options = [], // default empty array to avoid undefined
  value,
  onChange,
  placeholder,
  error,
  isSearchable = false,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ✅ Safe filtering
  const filteredOptions = options.filter((opt: any) =>
    (opt?.label ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        width: rect.width,
      });
    }
  };

  const toggleDropdown = () => {
    if (isOpen) setSearchTerm("");
    setIsOpen(!isOpen);
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      const timer = setTimeout(() => searchInputRef.current?.focus(), 10);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt?.id === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={toggleDropdown}
        className={`w-full h-10 px-3 bg-gray-100 rounded-[10px] flex items-center justify-between cursor-pointer transition-all border-2
          ${isOpen ? "border-purple-400 bg-white" : error ? "border-red-400" : "border-purple-100"}`}
      >
        <span
          className={`text-sm truncate ${selectedOption ? "text-indigo-950" : "text-gray-400"}`}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen &&
        createPortal(
          <div
            className="absolute z-[999999] bg-white rounded-[10px] shadow-2xl border border-gray-200 overflow-hidden"
            style={{
              top: `${coords.top + 4}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isSearchable && (
              <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-purple-400 transition-all"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <div className="max-h-[200px] overflow-y-auto p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt: any) => (
                  <button
                    key={opt?.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(opt?.id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full group flex items-center px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#10B981] mb-0.5 text-left"
                  >
                    <span
                      className={`text-sm truncate flex-1 whitespace-pre-line ${
                        value === opt?.id
                          ? "font-bold text-[#10B981] group-hover:text-white"
                          : "text-indigo-950 group-hover:text-white"
                      }`}
                    >
                      {opt?.label ?? "Unnamed"}
                    </span>
                    {value === opt?.id && (
                      <Check
                        size={16}
                        className="ml-2 text-[#10B981] group-hover:text-white"
                      />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-gray-400">
                  No results found
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
