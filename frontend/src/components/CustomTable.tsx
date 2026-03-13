// src/components/CustomTable.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  headerAction?: React.ReactNode;
  // Pagination Props
  showPagination?: boolean;
  paginationType?: 'simple' | 'numbers';
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Style Props
  hideRowBorders?: boolean;
}

export default function CustomTable<T>({ 
  columns, 
  data, 
  title, 
  headerAction,
  showPagination = false,
  paginationType = 'simple',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hideRowBorders = false
}: CustomTableProps<T>) {
  return (
    <div className="w-full rounded-2xl  bg-card shadow-sm overflow-hidden">
      
      {/* 1. Header Section: Bottom Border as per Image */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between p-6 bg-card">
          {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
          {headerAction && <div className="flex gap-2">{headerAction}</div>}
        </div>
      )}

      {/* 2. Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left ">
          <thead>
            <tr className="border-b ">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-5 text-[13px] font-semibold text-muted-foreground uppercase tracking-wider ${col.className}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-transparent">
            {data.map((item, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={`transition-colors hover:bg-muted/30'}`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-5 text-sm font-medium text-foreground/90">
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Reusable Pagination Section */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/50">
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground">{(currentPage - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(currentPage * 10, totalPages * 10)}</span> of <span className="text-foreground">{totalPages * 10}</span> results
          </div>

          <div className="flex items-center gap-2">
            {paginationType === 'simple' ? (
              <>
                <button 
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              // Numbered Pagination Style
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onPageChange?.(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-secondary border border-border'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}