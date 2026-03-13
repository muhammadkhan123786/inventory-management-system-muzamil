"use client";
import React from "react";
import { Star, Database, Trash2 } from "lucide-react";
import { StatusBadge } from "@/app/common-form/StatusBadge";
import { TableActionButton } from "@/app/common-form/TableActionButtons";
import { IProductSource } from "../../../../../../../common/IProduct.source.interface";
import { toast } from "react-hot-toast";

interface TableProps {
    data: (IProductSource & { _id: string })[];
    displayView: "table" | "card";
    onEdit: (item: IProductSource & { _id: string }) => void;
    onDelete: (id: string) => void;
    onStatusChange?: (id: string, newStatus: boolean) => void;
    themeColor: string;
}

// Icon colors for different sources
const getIconGradient = (index: number) => {
    const gradients = [
        "bg-gradient-to-br from-blue-400 to-blue-600",
        "bg-gradient-to-br from-green-400 to-emerald-600",
        "bg-gradient-to-br from-purple-400 to-pink-600",
        "bg-gradient-to-br from-orange-400 to-red-600",
    ];
    return gradients[index % gradients.length];
};

export default function ProductSourceTable({ data, displayView, onEdit, onDelete, onStatusChange, themeColor }: TableProps) {
    // Card View
    if (displayView === "card") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((item, index) => (
                    <div
                        key={item._id}
                        className={`bg-white rounded-3xl border-2 border-blue-200 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:border-blue-400 cursor-pointer transform ${
                            !item.isActive ? "opacity-60" : ""
                        }`}
                    >
                        {/* Header Section with Icon and Toggle */}
                        <div className="p-4 flex items-start justify-between bg-white">
                            <div className={`${getIconGradient(index)} p-3 rounded-xl text-white`}>
                                <Database size={18} />
                            </div>
                            
                            {/* Status Toggle Switch */}
                            <StatusBadge 
                                isActive={!!item.isActive}
                                onChange={(newStatus) => onStatusChange?.(item._id, newStatus)}
                                editable={!item.isDefault}
                            />
                        </div>

                        {/* Content Section */}
                        <div className="px-4 pb-4 space-y-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    {item.productSource}
                                    {item.isDefault && (
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    )}
                                </h3>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4">
                                <TableActionButton
                                    itemName="product source"
                                    fullWidth={true}
                                    onEdit={() => onEdit(item)}
                                    onDelete={() => {
                                        if (item.isDefault) {
                                            return toast.error("Default sources cannot be deleted.");
                                        }
                                        onDelete(item._id);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        <div className="text-5xl mb-3">📭</div>
                        <p>No product sources found.</p>
                    </div>
                )}
            </div>
        );
    }

    // Table View (Default)
    return (
        <div className="bg-white mt-8 shadow-lg border border-gray-200 overflow-x-auto rounded-lg">
            <table className="w-full text-[16px]! text-left min-w-max">
                <thead className="bg-[#ECFEFF] text=[#364153]! border-b-2 border-gray-200 sticky top-0">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">Icon</th>
                        <th className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">Source Name</th>
                        <th className="px-6 py-4 text-center font-bold text-gray-700 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-center font-bold text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item, index) => (
                        <tr key={item._id} className="hover:bg-[#ECFEFF] transition-colors">
                            <td className="px-6 py-4">
                                <div className={`${getIconGradient(index)} p-3 rounded-lg w-fit text-white`}>
                                    <Database size={18} />
                                </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    {item.productSource}
                                    {item.isDefault && (
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge 
                                    isActive={!!item.isActive}
                                    onChange={(newStatus) => onStatusChange?.(item._id, newStatus)}
                                    editable={!item.isDefault}
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <TableActionButton
                                    itemName="product source"
                                    onEdit={() => onEdit(item)}
                                    onDelete={() => {
                                        if (item.isDefault)
                                            return toast.error("Default sources cannot be deleted.");
                                        onDelete(item._id);
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center py-10 text-gray-400">
                                No product sources found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}