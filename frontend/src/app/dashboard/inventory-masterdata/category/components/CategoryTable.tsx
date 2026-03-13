"use client";
import React from "react";
import {
  Folder,
  Layers,
  Tag,
  CheckCircle2,
  XCircle,
  Star,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { ICategory } from "../../../../../../../common/ICategory.interface";

// Use the interface based on your JSON structure
// export interface ICategory {
//   _id: string;
//   categoryName: string;
//   parentId: string | null;
//   isActive: boolean;
//   isDefault: boolean;
//   children?: ICategory[];
// }

interface Props {
  data: ICategory[];
  onEdit: (cat: ICategory) => void;
  onDelete: (id: string) => void;
  onAddSub: (parent: ICategory) => void;
  //  onSetDefault: (cat: ICategory) => void;
}

export const CategoryTable: React.FC<Props> = ({
  data,
  onEdit,
  onDelete,
  onAddSub,
}) => {
  const renderRows = (
    categories: ICategory[],
    level: number = 1,
    parentPath: string = ""
  ) => {
    return categories.map((cat) => {
      const currentPath = parentPath
        ? `${parentPath} > ${cat.categoryName}`
        : cat.categoryName;

      // Icon & Color Logic exactly like your target design
      const Icon = level === 1 ? Folder : level === 2 ? Layers : Tag;
      const iconColors = [
        "bg-[#0ea5e9]", // Level 1: Blue
        "bg-[#d946ef]", // Level 2: Fuchsia/Pink
        "bg-[#10b981]", // Level 3+: Emerald
      ];
      const currentColor = iconColors[Math.min(level - 1, 2)];

      return (
        <React.Fragment key={cat._id}>
          <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100">
            {/* Category Hierarchy & Path */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Visual Indentation for hierarchy awareness */}
                <div
                  className={`p-2.5 rounded-xl text-white shadow-sm ${currentColor}`}
                  style={{ marginLeft: `${(level - 1) * 8}px` }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 text-[15px]">
                    {cat.categoryName}
                  </span>
                  <span className="text-[12px] text-slate-400 font-medium">
                    {currentPath}
                  </span>
                </div>
              </div>
            </td>

            {/* Level Badge */}
            <td className="px-4 py-4 text-center">
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${level === 1
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : level === 2
                      ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  }`}
              >
                Level {level}
              </span>
            </td>

            {/* Active Status Badge */}
            <td className="px-4 py-4 text-center">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${cat.isActive
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-red-50 border-red-200 text-red-600"
                  }`}
              >
                {cat.isActive ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                {cat.isActive ? "Active" : "Inactive"}
              </div>
            </td>

            {/* Default Category Star */}
            <td className="px-4 py-4 text-center">
              {cat.isDefault ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-[11px] font-bold">
                  <Star size={13} fill="currentColor" />
                  Default
                </div>
              ) : (
                <div className="text-slate-200 flex justify-center">
                  <Star size={18} />
                </div>
              )}
            </td>

            {/* Exact Actions Buttons from Image */}
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onAddSub(cat)}
                  className="flex items-center gap-1
    px-3 py-1.5
    text-[11px] font-bold
    rounded-[10px]
    border border-[#D1D5DC]
    bg-[#F8F9FF]
    text-black/80
    transition-all duration-200
    hover:bg-[#DCFCE7]
    hover:border-[#22C55E]
    hover:text-[#22C55E]
  "
                >
                  <Plus size={14} />
                  Sub
                </button>
                <button
                  onClick={() => onEdit(cat)}
                  className="p-1.5 text-black/80 hover:text-indigo-600 hover:bg-[#DBEAFE] hover:border-[#8EC5FF]  rounded-[10px] border border-[#D1D5DC]"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(cat._id!)}
                  className="flex items-center justify-center gap-2 p-1.5 text-black/80 hover:text-red-500 rounded-[10px] border border-[#D1D5DC] hover:border-red-500 hover:bg-[#FFE2E2]"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </td>
          </tr>

          {/* RECURSION: If this category has children, render them immediately below */}
          {cat.children &&
            cat.children.length > 0 &&
            renderRows(cat.children, level + 1, currentPath)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="w-full bg-white  overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="border-b border-slate-100">
            <tr className="text-slate-500 text-[12px] uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Category Hierarchy</th>
              <th className="px-4 py-4 text-center">Level</th>
              <th className="px-4 py-4 text-center">Active</th>
              <th className="px-4 py-4 text-center">Default</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              renderRows(data)
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-slate-400 font-medium"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
