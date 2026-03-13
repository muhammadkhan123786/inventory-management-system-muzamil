"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Layers, Search, Pencil, Trash2, 
  ChevronDown, Hash, Type, 
  CheckSquare, List, Star, Tag
} from "lucide-react";
import { IAttribute } from "../../../../../../../common/IProductAttributes.interface";
import { ICategory } from "../../../../../../../common/ICategory.interface";
import axios from "axios";
import { flattenCategories, FlatCategory } from "./flattenCategories"; // Import your existing utility

interface AttributeTableProps {
  data: IAttribute[];
  onEdit: (item: IAttribute) => void;
  onDelete: (id: string) => void;
}

const AttributeTable = ({ data, onEdit, onDelete }: AttributeTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response?.data?.data || response?.data || []);
      } catch (error) { 
        console.error("Error fetching categories:", error); 
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Create flat categories list with paths
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  // Create a map of categoryId -> FlatCategory for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, FlatCategory>();
    flatCategories.forEach(cat => {
      map.set(cat.id, cat);
    });
    return map;
  }, [flatCategories]);

  // Gradient definitions from your request
  const gradients = [
    "from-[#F6339A] to-[#AD46FF]", // Pink-Purple
    "from-[#2B7FFF] to-[#00B8DB]"  // Blue-Cyan
  ];

  // Group attributes by category - now using category name and path
  const groupedData = useMemo(() => {
    return data.reduce((acc, curr) => {
      // Get category info from map
      const categoryInfo = curr.categoryId ? categoryMap.get(curr.categoryId) : null;
      
      // Use category name if available, otherwise fallback to ID or "Global Attributes"
      const groupName = categoryInfo?.name || curr.categoryId || "Global Attributes";
      
      // Store both the name and the full path for breadcrumb
      if (!acc[groupName]) {
        acc[groupName] = {
          items: [],
          path: categoryInfo?.path || []
        };
      }
      acc[groupName].items.push(curr);
      return acc;
    }, {} as Record<string, { items: IAttribute[], path: string[] }>);
  }, [data, categoryMap]);

  const TypeBadge = ({ type }: { type: string }) => {
    const types: Record<string, { label: string; icon: any; color: string; bg: string }> = {
      select: { label: "Dropdown", icon: ChevronDown, color: "text-[#6366F1]", bg: "bg-[#EEF2FF]" },
      text: { label: "Text", icon: Type, color: "text-[#0EA5E9]", bg: "bg-[#F0F9FF]" },
      number: { label: "Number", icon: Hash, color: "text-[#F59E0B]", bg: "bg-[#FFFBEB]" },
      checkbox: { label: "Checkbox", icon: CheckSquare, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
      list: { label: "List", icon: List, color: "text-[#D946EF]", bg: "bg-[#FDF4FF]" },
    };
    const config = types[type] || types.text;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg w-fit ${config.bg} ${config.color} border border-current/10`}>
        <Icon size={12} />
        <span className="text-[11px] font-bold uppercase tracking-wider">{config.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto p-4">
      {/* Search Header */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 pl-4 text-gray-500 whitespace-nowrap">
           <Search size={18} />
           <span className="text-sm font-medium">Filter by Category:</span>
        </div>
        <input
          type="text"
          placeholder="Search attributes..."
          className="flex-1 py-2 outline-none text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="bg-[#EEF2FF] text-[#6366F1] px-4 py-1.5 rounded-xl text-xs font-bold mr-2">
          {data.length} attributes
        </div>
      </div>

      {Object.entries(groupedData).map(([groupName, { items, path }], index) => {
        const filteredItems = items.filter(i => 
          i.attributeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filteredItems.length === 0) return null;
        
        console.log("group", groupName); // Now shows category name

        // Alternate gradients based on index
        const currentGradient = gradients[index % gradients.length];
        const iconBg = index % 2 === 0 ? "bg-[#F6339A]" : "bg-[#2B7FFF]";

        // Create breadcrumb path
        const breadcrumbPath = path.length > 0 
          ? path.join(" › ") 
          : "Global Attributes";

        return (
          <div key={groupName} className="relative bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            {/* THE TOP GRADIENT BORDER */}
            <div className={`h-[6px] w-full bg-gradient-to-r ${currentGradient}`} />

            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-white shadow-lg`}>
                  <Tag size={24} fill="white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">{groupName}</h3>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">
                    {breadcrumbPath}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase">
                {filteredItems.length} attributes
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/30 border-y border-gray-50">
                  <tr className="text-gray-400 text-[11px] uppercase font-bold tracking-[0.1em]">
                    <th className="px-8 py-4 text-left">Attribute Name</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-center">Active</th>
                    <th className="px-6 py-4 text-center">Default</th>
                    <th className="px-6 py-4 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredItems.map((attr) => (
                    <tr key={attr._id} className="group hover:bg-gray-50/40 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#AD46FF]/10 text-[#AD46FF] flex items-center justify-center">
                            <Layers size={14} />
                          </div>
                          <span className="font-semibold text-gray-700">{attr.attributeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5"><TypeBadge type={attr.type} /></td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                            attr.isActive ? "bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20" : "bg-[#FFF1F2] text-[#F43F5E] border-[#F43F5E]/20"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${attr.isActive ? "bg-[#10B981]" : "bg-[#F43F5E]"}`} />
                            {attr.isActive ? "ACTIVE" : "INACTIVE"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            attr.isDefault ? "bg-[#FFFBEB] text-[#F59E0B] border border-[#F59E0B]/30" : "bg-gray-50 text-gray-300 border border-gray-100"
                          }`}>
                            <Star size={14} fill={attr.isDefault ? "#F59E0B" : "none"} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 pr-8">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onEdit(attr)} className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => onDelete(attr._id!)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttributeTable;