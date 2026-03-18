"use client";
import React from "react";
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Phone,
  Clock,
  Package,
  Star,
} from "lucide-react";
import { TableActionButton } from "@/app/common-form/TableActionButtons";
import { StatusBadge } from "@/app/common-form/StatusBadge";
import { WarehouseWithPopulated } from "./WareHousesClient";
import { toast } from "react-hot-toast";

interface Props {
  data: WarehouseWithPopulated[];
  displayView: "table" | "card";
  onEdit: (item: WarehouseWithPopulated) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: boolean) => void;
  themeColor: string;
}

const getIconGradient = (index: number) => {
  const gradients = [
    "bg-gradient-to-br from-orange-400 to-red-600",
    "bg-gradient-to-br from-yellow-400 to-orange-600",
    "bg-gradient-to-br from-pink-400 to-red-600",
    "bg-gradient-to-br from-amber-400 to-orange-600",
  ];
  return gradients[index % gradients.length];
};

const WareHousesTable = ({ 
  data, 
  displayView, 
  onEdit, 
  onDelete, 
  onStatusChange,
  themeColor 
}: Props) => {
  const formatTime = (time?: string | Date) => {
    if (!time) return "N/A";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCapacity = (capacity?: number) =>
    capacity ? capacity.toLocaleString() : "0";

  // Card View
  if (displayView === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item, index) => (
          <div
            key={item._id}
            className={`bg-white rounded-3xl border-2 border-orange-200 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:border-orange-400 cursor-pointer transform ${
              !item.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="p-4 flex items-start justify-between bg-white">
              <div className={`${getIconGradient(index)} p-3 rounded-xl text-white`}>
                <WarehouseIcon size={18} />
              </div>
              <StatusBadge 
                isActive={!!item.isActive}
                onChange={(newStatus) => onStatusChange?.(item._id!, newStatus)}
                editable={!item.isDefault}
              />
            </div>

            <div className="px-4 pb-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  Warehouse #{item._id?.substring(0, 6) ?? "N/A"}
                  {item.isDefault && (
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.person?.firstName ?? ""} {item.person?.lastName ?? ""}
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>{item.contact?.mobileNumber ?? "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="truncate">
                    {item.address?.address}, {item.address?.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>{formatTime(item.openTime)} - {formatTime(item.closeTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-gray-400" />
                  <span>Capacity: {formatCapacity(item.capacity)}</span>
                </div>
              </div>

              <div className="pt-4">
                <TableActionButton
                  itemName="warehouse"
                  fullWidth={true}
                  onEdit={() => onEdit(item)}
                  onDelete={() => {
                    if (item.isDefault) {
                      return toast.error("Default warehouses cannot be deleted.");
                    }
                    onDelete(item._id!);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p>No warehouses found.</p>
          </div>
        )}
      </div>
    );
  }

  // Table View
  return (
    <div className="bg-white mt-8 shadow-lg border border-gray-200 overflow-x-auto rounded-lg">
      <table className="w-full text-[16px] text-left min-w-max">
        <thead className="bg-[#FFF1E6] border-b-2 border-gray-200 sticky top-0">
          <tr>
            <th className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">Icon</th>
            <th className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">Warehouse & Manager</th>
            <th className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">Contact & Location</th>
            <th className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">Timings</th>
            <th className="px-6 py-4 text-center font-bold text-gray-700 whitespace-nowrap">Capacity</th>
            <th className="px-6 py-4 text-center font-bold text-gray-700 whitespace-nowrap">Status</th>
            <th className="px-6 py-4 text-center font-bold text-gray-700 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <tr key={item._id} className="hover:bg-[#FFF1E6] transition-colors">
              <td className="px-6 py-4">
                <div className={`${getIconGradient(index)} p-3 rounded-lg w-fit text-white`}>
                  <WarehouseIcon size={18} />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">
                        Warehouse #{item._id?.substring(0, 6) ?? "N/A"}
                      </span>
                      {item.isDefault && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.person?.firstName ?? ""} {item.person?.lastName ?? ""}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col text-sm text-gray-600 gap-1">
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {item.contact?.mobileNumber ?? "N/A"}
                  </span>
                  <span className="flex items-center gap-1 text-xs max-w-[200px]">
                    <MapPin size={12} className="mt-0.5" />
                    <span>
                      {item.address?.address}, {item.address?.city}
                    </span>
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col text-sm text-gray-600 gap-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatTime(item.openTime)}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <Clock size={12} /> {formatTime(item.closeTime)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCapacity(item.capacity)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Avail: {formatCapacity(item.availableCapacity)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <StatusBadge 
                  isActive={!!item.isActive}
                  onChange={(newStatus) => onStatusChange?.(item._id!, newStatus)}
                  editable={!item.isDefault}
                />
              </td>
              <td className="px-6 py-4 text-center">
                <TableActionButton
                  itemName="warehouse"
                  onEdit={() => onEdit(item)}
                  onDelete={() => {
                    if (item.isDefault) {
                      return toast.error("Default warehouses cannot be deleted.");
                    }
                    onDelete(item._id!);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WareHousesTable;