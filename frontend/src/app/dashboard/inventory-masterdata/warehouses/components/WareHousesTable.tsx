"use client";
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Phone,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { TableActionButton } from "@/app/common-form/TableActionButtons";
import { WarehouseWithPopulated } from "./WareHousesClient";

interface Props {
  data: WarehouseWithPopulated[];
  onEdit: (item: WarehouseWithPopulated) => void;
  onDelete: (id: string) => void;
  themeColor: string;
}

const WareHousesTable = ({ data, onEdit, onDelete, themeColor }: Props) => {
  const formatTime = (time?: string | Date) => {
    if (!time) return "N/A";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCapacity = (capacity?: number) =>
    capacity ? capacity.toLocaleString() : "0";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-white" style={{ backgroundColor: themeColor }}>
            <tr>
              <th className="px-6 py-4">Warehouse & Manager</th>
              <th className="px-6 py-4">Contact & Location</th>
              <th className="px-6 py-4">Timings</th>
              <th className="px-6 py-4 text-center">Capacity</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-blue-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <WarehouseIcon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">
                            Warehouse #{item._id?.substring(0, 6) ?? "N/A"}
                          </span>
                          {item.isDefault && (
                            <Star size={14} className="text-yellow-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.person?.firstName ?? ""}{" "}
                          {item.person?.lastName ?? ""}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm text-gray-600 gap-1">
                      <span className="flex items-center gap-1">
                        <Phone size={12} />{" "}
                        {item.contact?.mobileNumber ?? "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {item.contact?.phoneNumber ?? "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {item.contact?.emailId ?? "N/A"}
                      </span>

                      <span className="flex items-start gap-1 text-xs max-w-[200px]">
                        <MapPin size={12} className="mt-0.5" />
                        <span>
                          {item.address?.address}, {item.address?.city},{" "}
                          {item.address?.country}
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
                      <span className="text-xs font-mono text-green-600 flex items-center gap-1">
                        <Package size={10} /> {formatCapacity(item.capacity)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Available: {formatCapacity(item.availableCapacity)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        {item.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle size={10} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-xs">
                            <XCircle size={10} /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <TableActionButton
                      onEdit={() => onEdit(item)}
                      onDelete={() => {
                        if (item.isDefault) {
                          alert("Default item cannot be deleted.");
                          return;
                        }
                        if (item._id) {
                          onDelete(item._id);
                        }
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  No warehouses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WareHousesTable;
