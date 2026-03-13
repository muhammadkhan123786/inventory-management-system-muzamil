"use client";
import { useState } from "react";
import { Edit2, Trash2, AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

interface ActionProps {
  onEdit: () => void;
  onDelete: () => void;
  itemName?: string; 
  fullWidth?: boolean;
}

export const TableActionButton = ({ onEdit, onDelete, itemName = "item", fullWidth = false }: ActionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => {
    onDelete();
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={`flex ${fullWidth ? "w-full gap-2" : "justify-center gap-3"}`}>
        <button
          onClick={onEdit}
          className={`flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-xl transition-all font-semibold ${
            fullWidth ? "flex-1 justify-center" : ""
          }`}
          title="Edit"
        >
          <Edit2 size={18} /> Edit
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 bg-blue-50 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>

     {isModalOpen &&
  typeof window !== "undefined" &&
  createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-linear-to-br from-red-500 to-rose-500 shadow-lg shadow-red-100 shrink-0">
              <Trash2 className="h-4 w-4 text-white" />
            </div>

            <h3 className="text-lg font-semibold text-[#1A1C2E]">
              Confirm Deletion
            </h3>
          </div>

          <p className="text-[#6B7280] text-sm leading-relaxed mb-2 pr-4">
            Are you sure you want to delete this {itemName}? This action cannot be undone.
          </p>

          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] hover:text-white font-medium text-sm hover:bg-[#10b981] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 rounded-lg bg-linear-to-br from-red-500 to-rose-500 text-white font-medium text-sm transition-all active:scale-95 shadow-md"
            >
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  )
}

    </>
  );
};