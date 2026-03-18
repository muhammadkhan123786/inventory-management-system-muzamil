"use client";
import React, { useState } from "react";
import { ICategory } from "../../../../../../../common/ICategory.interface";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Tag,
  CheckCircle2,
  XCircle,
  Star,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

interface TreeProps {
  data: ICategory[];
  loading: any;
  /** Controlled by CategoryDashboard */
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  onEdit: (cat: ICategory) => void;
  onDelete: (id: string) => void;
  onAddSub: (parent: ICategory) => void;
  onSetDefault: (cat: ICategory) => void;
}

export const CategoryTree: React.FC<TreeProps> = ({
  data,
  loading,
  searchTerm,
  onSearchChange,
  totalCount,
  onEdit,
  onDelete,
  onAddSub,
  onSetDefault,
}) => {
  // All nodes start expanded by default
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {}
  );

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (
    node: ICategory,
    level: number = 1,
    parentPath: string = ""
  ) => {
    // Default: expanded unless explicitly set to false
    const isExpanded = expandedNodes[node._id!] !== false;
    const hasChildren = node.children && node.children.length > 0;
    const currentPath = parentPath
      ? `${parentPath} > ${node.categoryName}`
      : node.categoryName;

    const getIcon = () => {
      if (level === 1) return <Folder size={18} />;
      if (level === 2) return <Layers size={18} />;
      return <Tag size={18} />;
    };

    const colors = ["bg-[#0ea5e9]", "bg-[#d946ef]", "bg-[#10b981]"];
    const currentColor = colors[Math.min(level - 1, colors.length - 1)];

    return (
      <div key={node._id} className="w-full">
        <div className="group flex items-center justify-between hover:bg-slate-50/80 transition-all p-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-4">
            <div
              style={{ paddingLeft: `${(level - 1) * 24}px` }}
              className="flex items-center"
            >
              {/* Expand/collapse toggle */}
              <button
                onClick={() => toggleNode(node._id!)}
                className={`p-1 hover:bg-slate-200 rounded transition-colors mr-2 ${
                  !hasChildren ? "invisible" : ""
                }`}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-slate-400" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400" />
                )}
              </button>

              <div className={`p-2 rounded-lg shadow-sm text-white ${currentColor}`}>
                {getIcon()}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-[14px]">
                  {node.categoryName}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    level === 1
                      ? "bg-blue-50 border-blue-100 text-blue-500"
                      : level === 2
                      ? "bg-fuchsia-50 border-fuchsia-100 text-fuchsia-500"
                      : "bg-emerald-50 border-emerald-100 text-emerald-500"
                  }`}
                >
                  Level {level}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {currentPath}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Status & default badges */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${
                  node.isActive
                    ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                    : "bg-red-50 border-red-100 text-red-500"
                }`}
              >
                {node.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {node.isActive ? "Active" : "Inactive"}
              </div>

              <button
                onClick={() => !node.isDefault && onSetDefault(node)}
                className="transition-transform active:scale-90"
              >
                {node.isDefault ? (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-amber-100 bg-amber-50 text-amber-500 text-[10px] font-bold shadow-sm">
                    <Star size={11} fill="currentColor" />
                    Default
                  </div>
                ) : (
                  <Star
                    size={16}
                    className="text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
                  />
                )}
              </button>
            </div>

            {/* Action buttons — visible on row hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => onAddSub(node)}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-[10px] border border-[#D1D5DC] bg-[#F3F4F6] text-black/70 transition-all duration-200 hover:bg-[#DCFCE7] hover:border-[#22C55E] hover:text-[#22C55E]"
              >
                <Plus size={14} />
                Add Sub
              </button>

              <button
                onClick={() => onEdit(node)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-[#DBEAFE] hover:border-[#8EC5FF] rounded-[10px] border border-[#D1D5DC]"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(node._id!)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-[10px] border border-[#D1D5DC] hover:border-red-500 hover:bg-[#FFE2E2]"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Render children recursively */}
        {hasChildren && isExpanded && (
          <div className="w-full bg-slate-50/20">
            {node.children!.map((child) => renderNode(child, level + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl">
      {/* Search bar — controlled by dashboard */}
      <div className="flex items-center gap-4 bg-white p-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2 pl-2 text-gray-500 whitespace-nowrap">
          <Search size={18} />
          <span className="text-sm font-medium">Search:</span>
        </div>
        <input
          type="text"
          placeholder="Search categories by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 py-2 outline-none text-sm"
        />
        <div className="bg-[#EEF2FF] text-[#6366F1] px-4 py-1.5 rounded-xl text-xs font-bold mr-2">
          {totalCount} categories
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <div className="p-20 text-center text-slate-400 italic">
          {searchTerm
            ? `No categories found for "${searchTerm}"`
            : "No categories found."}
        </div>
      )}

      {/* Tree nodes */}
      {!loading && data.length > 0 && (
        <div className="p-4 border-b border-[#F3F4F6]">
          {data.map((rootNode) => renderNode(rootNode))}
        </div>
      )}
    </div>
  );
};