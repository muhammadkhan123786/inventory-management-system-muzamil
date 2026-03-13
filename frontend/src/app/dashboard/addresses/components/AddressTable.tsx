"use client";
import React from "react";
import { TableActionButton } from "@/app/common-form/TableActionButtons";
import { StatusBadge } from "@/app/common-form/StatusBadge";
import { Star, MapPin, Trash2 } from "lucide-react";

interface Props {
  data: any[];
  displayView: "table" | "card";
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  themeColor: string;
}

const getIconGradient = (index: number) => {
  const gradients = [
    "bg-linear-to-br from-blue-400 to-blue-600",
    "bg-linear-to-br from-green-400 to-emerald-600",
    "bg-linear-to-br from-purple-400 to-pink-600",
    "bg-linear-to-br from-orange-400 to-red-600",
  ];
  return gradients[index % gradients.length];
};

const AddressTable = ({ data, displayView, onEdit, onDelete, themeColor }: Props) => {
  if (displayView === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item, index) => (
          <div
            key={item._id}
            className="bg-white rounded-3xl border-2 border-blue-200 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:border-blue-400 hover:scale-105 hover:-translate-y-3 cursor-pointer transform"
          >
            <div className="p-4 flex items-start justify-between bg-white">
              <div className={`${getIconGradient(index)} p-3 rounded-xl text-white`}>
                <MapPin size={18} />
              </div>
              <StatusBadge isActive={!!item.isActive} />
            </div>

            <div className="px-4 pb-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {item.address}
                </h3>
                <p className="text-xs text-gray-400">Lat: {item.latitude}, Long: {item.longitude}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => onEdit(item)}
                  className="flex-1 flex text-sm items-center justify-center gap-1 py-1 px-3 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg font-semibold transition-all hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p>No addresses found.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white mt-8 shadow-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-[16px]! text-left">
        <thead className="bg-[#ECFEFF] text-[#364153]! border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 font-bold text-gray-700">Icon</th>
            <th className="px-6 py-4 font-bold text-gray-700">Full Address</th>
            <th className="px-6 py-4 font-bold text-gray-700">Location</th>
            <th className="px-6 py-4 text-center font-bold text-gray-700">Zip Code</th>
            <th className="px-6 py-4 text-center font-bold text-gray-700">Status</th>
            <th className="px-6 py-4 text-center font-bold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <tr key={item._id} className="hover:bg-[#ECFEFF] transition-colors">
              <td className="px-6 py-4">
                <div className={`${getIconGradient(index)} p-3 rounded-lg w-fit text-white`}>
                  <MapPin size={18} />
                </div>
              </td>
              <td className="px-6 py-4 font-bold text-gray-900">
                <div className="flex items-center gap-2">
                  {item.address}
                  {item.isDefault && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="text-xs text-gray-400 font-normal">
                   Lat: {item.latitude || '0'}, Long: {item.longitude || '0'}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {item.cityId?.cityName || 'N/A'}, {item.countryId?.countryName || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center font-mono text-sm text-gray-600">
                {item.zipCode || '-----'}
              </td>
              <td className="px-6 py-4 text-center">
                <StatusBadge isActive={!!item.isActive} />
              </td>
              <td className="px-6 py-4 text-center">
                <TableActionButton onEdit={() => onEdit(item)} onDelete={() => onDelete(item._id)} />
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-400">No addresses found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddressTable;