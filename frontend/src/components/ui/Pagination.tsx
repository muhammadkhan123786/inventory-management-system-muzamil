import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  // "Unlimited" pages ke liye: sirf current page ke agay pichay ke 2 pages dikhayega
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white border border-gray-100 mt-6 rounded-2xl shadow-sm">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-600">
          Page <span className="font-bold text-gray-900">{currentPage}</span> of{" "}
          <span className="font-bold text-gray-900">{totalPages}</span>
        </p>
      </div>

      <div className="flex flex-1 justify-between sm:justify-end items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} /> Prev
        </button>

        <div className="hidden md:flex gap-1">
          {currentPage > 3 && (
            <button
              onClick={() => onPageChange(1)}
              className="w-10 h-10 rounded-xl text-sm border hover:bg-gray-50"
            >
              1
            </button>
          )}
          {currentPage > 4 && (
            <span className="px-2 self-center text-gray-400">...</span>
          )}

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                currentPage === page
                  ? "bg-linear-to-r from-blue-600 via-cyan-500 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-orange-50 border border-transparent"
              }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 3 && (
            <span className="px-2 self-center text-gray-400">...</span>
          )}
          {currentPage < totalPages - 2 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-10 h-10 rounded-xl text-sm border hover:bg-gray-50"
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
