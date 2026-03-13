"use client";
import React, { useEffect, useState } from "react";
import { Save, Warehouse as WarehouseIcon } from "lucide-react";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import {
  getAll,
  createItem,
  updateItem,
  PaginatedResponse,
  ApiErrorResponse,
} from "../../../../../helper/apiHelper";
import { warehouseDto } from "../../../../../../../common/DTOs/warehouse.dto";
import { IWarehouseStatus } from "../../../../../../../common/IWarehouse.status.interface";
import axios from "axios";
interface Props {
  editingData: (warehouseDto & { _id?: string }) | null;
  onClose: () => void;
  onRefresh: () => void;
  themeColor: string;
}
const WareHousesForm = ({
  editingData,
  onClose,
  onRefresh,
  themeColor,
}: Props) => {
  const [warehouseStatuses, setWarehouseStatuses] = useState<
    { _id: string; statusName: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<warehouseDto>({
    wareHouseStatusId: "",
    openTime: new Date("2000-01-01T09:00:00"),
    closeTime: new Date("2000-01-01T18:00:00"),
    capacity: 0,
    availableCapacity: 0,
    isActive: true,
    isDefault: false,
    person: { firstName: "", middleName: "", lastName: "" },
    contact: { mobileNumber: "", phoneNumber: "", emailId: "" },
    address: { address: "", zipCode: "", city: "", country: "", userId: "" },
  });
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const res: PaginatedResponse<IWarehouseStatus> =
          await getAll<IWarehouseStatus>("/warehouse-status");
        const mapped = res.data
          .filter((ws): ws is IWarehouseStatus & { _id: string } => !!ws._id)
          .map((ws) => ({
            _id: ws._id,
            statusName: ws.wareHouseStatus || "Unknown",
          }));
        setWarehouseStatuses(mapped);
      } catch (error: unknown) {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
          console.error(
            "Error fetching warehouse statuses:",
            error.response?.data?.message || error.message
          );
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };
    loadStatuses();
  }, [editingData]);

  useEffect(() => {
    if (!editingData) return;

    const addressObj = editingData.address || {};
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { id: "" };
    setFormData({
      ...editingData,
      wareHouseStatusId: editingData.wareHouseStatusId || "",
      openTime: editingData.openTime
        ? new Date(editingData.openTime)
        : new Date("2000-01-01T09:00:00"),
      closeTime: editingData.closeTime
        ? new Date(editingData.closeTime)
        : new Date("2000-01-01T18:00:00"),
      person: {
        firstName: editingData.person?.firstName || "",
        middleName: editingData.person?.middleName || "",
        lastName: editingData.person?.lastName || "",
      },
      contact: {
        mobileNumber: editingData.contact?.mobileNumber || "",
        phoneNumber: editingData.contact?.phoneNumber || "",
        emailId: editingData.contact?.emailId || "",
      },
      address: {
        address: addressObj.address || "",
        zipCode: addressObj.zipCode || "",
        city: addressObj.city || "",
        country: addressObj.country || "",
        userId: addressObj.userId || user.id || user._id || "",
      },
    });
  }, [editingData]);
  const handleFormChange = <K extends keyof warehouseDto>(
    field: K,
    value: warehouseDto[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const updateNested = <
    K extends keyof warehouseDto,
    J extends keyof warehouseDto[K]
  >(
    parent: K,
    key: J,
    value: warehouseDto[K][J]
  ) => {
    setFormData((prev) => {
      const parentData = prev[parent];
      if (parentData && typeof parentData === "object") {
        return {
          ...prev,
          [parent]: {
            ...parentData,
            [key]: value,
          } as warehouseDto[K],
        };
      }
      return prev;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not found in localStorage");
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;

      if (!userId) throw new Error("User ID not found");
      const payload: warehouseDto & { userId: string } = {
        userId: userId,
        wareHouseStatusId:
          formData.wareHouseStatusId || warehouseStatuses[0]?._id,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        capacity: Number(formData.capacity) || 0,
        availableCapacity: Number(formData.availableCapacity) || 0,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        person: {
          firstName: (formData.person.firstName || "").trim(),
          middleName: (formData.person.middleName || "").trim(),
          lastName: (formData.person.lastName || "").trim(),
        },
        contact: {
          mobileNumber: formData.contact.mobileNumber || "",
          phoneNumber: formData.contact.phoneNumber || "",
          emailId: formData.contact.emailId || "",
        },
        address: {
          address: formData.address.address || "",
          zipCode: formData.address.zipCode || "",
          city: formData.address.city || "",
          country: formData.address.country || "",
          userId: userId,
        },
      };

      if (!payload.person.firstName) throw new Error("First Name is required");
      if (!payload.contact.mobileNumber)
        throw new Error("Mobile Number is required");
      if (!payload.contact.emailId) throw new Error("Email ID is required");
      if (!payload.address.address) throw new Error("Address is required");

      if (editingData?._id) {
        await updateItem("/warehouses", editingData._id, payload);
      } else {
        await createItem("/warehouses", payload);
      }

      onRefresh();
      onClose();
    } catch (error: unknown) {
      console.error("Submit error:", error);
      if (axios.isAxiosError(error)) {
        alert(
          `Server Error: ${error.response?.data?.message || error.message}`
        );
      } else {
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "09:00";
    }
    return date.toTimeString().slice(0, 5);
  };
  return (
    <FormModal
      title={editingData ? "Edit Warehouse" : "Add New Warehouse"}
      icon={<WarehouseIcon size={24} />}
      onClose={onClose}
      themeColor={themeColor}
      width="w-[95vw] max-w-[1000px]"
      className="min-w-[350px] max-h-[90vh]"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">
            Warehouse Status *
          </label>
          <select
            className="w-full border border-gray-300 rounded-xl p-2"
            value={formData.wareHouseStatusId || ""}
            onChange={(e) =>
              handleFormChange("wareHouseStatusId", e.target.value)
            }
            required
          >
            <option value="">Select Status</option>
            {warehouseStatuses.map((status) => (
              <option key={status._id} value={status._id}>
                {status.statusName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Open Time *"
            type="time"
            value={formatTime(formData.openTime)}
            onChange={(e) =>
              handleFormChange(
                "openTime",
                new Date(`2000-01-01T${e.target.value}:00`)
              )
            }
            required
          />
          <FormInput
            label="Close Time *"
            type="time"
            value={formatTime(formData.closeTime)}
            onChange={(e) =>
              handleFormChange(
                "closeTime",
                new Date(`2000-01-01T${e.target.value}:00`)
              )
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Total Capacity *"
            type="number"
            min="0"
            value={formData.capacity || 0}
            onChange={(e) =>
              handleFormChange("capacity", Number(e.target.value) || 0)
            }
            required
          />
          <FormInput
            label="Available Capacity *"
            type="number"
            min="0"
            value={formData.availableCapacity || 0}
            onChange={(e) => {
              const value = Number(e.target.value) || 0;

              handleFormChange(
                "availableCapacity",
                value > formData.capacity ? formData.capacity : value
              );
            }}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="First Name *"
            value={formData.person.firstName || ""}
            onChange={(e) =>
              updateNested("person", "firstName", e.target.value)
            }
            required
          />
          <FormInput
            label="Middle Name"
            value={formData.person.middleName || ""}
            onChange={(e) =>
              updateNested("person", "middleName", e.target.value)
            }
          />
          <FormInput
            label="Last Name *"
            value={formData.person.lastName || ""}
            onChange={(e) => updateNested("person", "lastName", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Mobile Number *"
            value={formData.contact.mobileNumber || ""}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9+]/g, "");
              if (value.indexOf("+") > 0) {
                value = value.replace(/\+/g, "");
              }

              updateNested("contact", "mobileNumber", value);
            }}
            inputMode="tel"
            placeholder="+923001234567"
            required
          />

          <FormInput
            label="Phone Number"
            value={formData.contact.phoneNumber || ""}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9+]/g, "");
              if (value.indexOf("+") > 0) {
                value = value.replace(/\+/g, "");
              }
              updateNested("contact", "phoneNumber", value);
            }}
            inputMode="tel"
            placeholder="+922112345678"
          />

          <FormInput
            label="Email ID *"
            type="email"
            value={formData.contact.emailId || ""}
            onChange={(e) => updateNested("contact", "emailId", e.target.value)}
            required
          />
        </div>
        <FormInput
          label="Address *"
          value={formData.address.address || ""}
          onChange={(e) => updateNested("address", "address", e.target.value)}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormInput
            label="Zip Code"
            value={formData.address.zipCode || ""}
            onChange={(e) =>
              updateNested(
                "address",
                "zipCode",
                e.target.value.replace(/\D/g, "")
              )
            }
            inputMode="numeric"
            placeholder="e.g. 54000"
          />

          <FormInput
            label="City"
            value={formData.address.city || ""}
            onChange={(e) => updateNested("address", "city", e.target.value)}
          />
          <FormInput
            label="Country"
            value={formData.address.country || ""}
            onChange={(e) => updateNested("address", "country", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormToggle
            label="Active"
            checked={formData.isActive ?? true}
            onChange={(val) => handleFormChange("isActive", val)}
            disabled={formData.isDefault}
          />
          <FormToggle
            label="Default"
            checked={formData.isDefault ?? false}
            onChange={(val) => handleFormChange("isDefault", val)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: themeColor }}
        >
          <Save size={20} />
          {loading
            ? "Processing..."
            : editingData
            ? "Update Warehouse"
            : "Save Warehouse"}
        </button>
      </form>
    </FormModal>
  );
};
export default WareHousesForm;
