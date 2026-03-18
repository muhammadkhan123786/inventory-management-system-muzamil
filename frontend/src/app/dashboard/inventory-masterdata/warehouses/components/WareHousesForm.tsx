"use client";
import React, { useEffect, useState } from "react";
import { Save, Warehouse as WarehouseIcon } from "lucide-react";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
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
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Create Zod validation schema matching TaxForm pattern
const warehouseSchemaValidation = z.object({
  wareHouseStatusId: z.string().min(1, "Warehouse status is required."),
  openTime: z.string().min(1, "Open time is required."),
  closeTime: z.string().min(1, "Close time is required."),
  capacity: z.number().min(0, "Capacity must be 0 or greater."),
  availableCapacity: z.number().min(0, "Available capacity must be 0 or greater."),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  person: z.object({
    firstName: z.string().min(1, "First name is required."),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required."),
  }),
  contact: z.object({
    mobileNumber: z.string().min(1, "Mobile number is required."),
    phoneNumber: z.string().optional(),
    emailId: z.string().email("Invalid email format").min(1, "Email is required."),
  }),
  address: z.object({
    address: z.string().min(1, "Address is required."),
    zipCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    userId: z.string().optional(),
  }),
}).refine(
  (data) => data.availableCapacity <= data.capacity,
  {
    message: "Available capacity cannot exceed total capacity.",
    path: ["availableCapacity"],
  }
);

type FormData = z.infer<typeof warehouseSchemaValidation>;

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

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(warehouseSchemaValidation),
    defaultValues: {
      wareHouseStatusId: "",
      openTime: "09:00",
      closeTime: "18:00",
      capacity: 0,
      availableCapacity: 0,
      isActive: true,
      isDefault: false,
      person: {
        firstName: "",
        middleName: "",
        lastName: "",
      },
      contact: {
        mobileNumber: "",
        phoneNumber: "",
        emailId: "",
      },
      address: {
        address: "",
        zipCode: "",
        city: "",
        country: "",
        userId: "",
      },
    },
  });

  const isDefaultValue = useWatch({ control, name: "isDefault" });
  const capacityValue = watch("capacity");

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
  }, []);

  useEffect(() => {
    if (!editingData) return;

    const addressObj = editingData.address || {};
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { id: "" };
    
    // Format times for time input
    const formatTimeForInput = (time?: string | Date) => {
      if (!time) return "09:00";
      const date = new Date(time);
      return date.toTimeString().slice(0, 5);
    };

    reset({
      wareHouseStatusId: editingData.wareHouseStatusId || "",
      openTime: formatTimeForInput(editingData.openTime),
      closeTime: formatTimeForInput(editingData.closeTime),
      capacity: editingData.capacity || 0,
      availableCapacity: editingData.availableCapacity || 0,
      isActive: Boolean(editingData.isActive),
      isDefault: Boolean(editingData.isDefault),
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
  }, [editingData, reset]);

  const handleSubmitForm = async (values: FormData) => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not found in localStorage");
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;

      if (!userId) throw new Error("User ID not found");

      const payload: any = {
        userId: userId,
        wareHouseStatusId: values.wareHouseStatusId,
        openTime: new Date(`2000-01-01T${values.openTime}:00`),
        closeTime: new Date(`2000-01-01T${values.closeTime}:00`),
        capacity: Number(values.capacity),
        availableCapacity: Number(values.availableCapacity),
        isActive: values.isActive,
        isDefault: values.isDefault,
        person: {
          firstName: values.person.firstName.trim(),
          middleName: values.person.middleName?.trim() || "",
          lastName: values.person.lastName.trim(),
        },
        contact: {
          mobileNumber: values.contact.mobileNumber,
          phoneNumber: values.contact.phoneNumber || "",
          emailId: values.contact.emailId,
        },
        address: {
          address: values.address.address.trim(),
          zipCode: values.address.zipCode || "",
          city: values.address.city || "",
          country: values.address.country || "",
          userId: userId,
        },
      };

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

  return (
    <FormModal
      title={editingData ? "Edit Warehouse" : "Add New Warehouse"}
      icon={<WarehouseIcon size={24} />}
      onClose={onClose}
      themeColor={themeColor}
    >
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6 p-4">
        {/* Warehouse Status - Custom styled select matching FormInput style */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">
            Warehouse Status <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none transition-all bg-white"
            {...register("wareHouseStatusId")}
          >
            <option value="">Select Status</option>
            {warehouseStatuses.map((status) => (
              <option key={status._id} value={status._id}>
                {status.statusName}
              </option>
            ))}
          </select>
          {errors.wareHouseStatusId && (
            <p className="text-red-500 text-sm">{errors.wareHouseStatusId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Open Time"
            type="time"
            {...register("openTime")}
            error={errors.openTime?.message}
            required
          />
          <FormInput
            label="Close Time"
            type="time"
            {...register("closeTime")}
            error={errors.closeTime?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Total Capacity"
            type="number"
            min="0"
            step="1"
            {...register("capacity", { valueAsNumber: true })}
            error={errors.capacity?.message}
            required
          />
          <FormInput
            label="Available Capacity"
            type="number"
            min="0"
            step="1"
            {...register("availableCapacity", { 
              valueAsNumber: true,
              validate: (value) => value <= capacityValue || "Available capacity cannot exceed total capacity"
            })}
            error={errors.availableCapacity?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="First Name"
            {...register("person.firstName")}
            error={errors.person?.firstName?.message}
            required
          />
          <FormInput
            label="Middle Name"
            {...register("person.middleName")}
            error={errors.person?.middleName?.message}
          />
          <FormInput
            label="Last Name"
            {...register("person.lastName")}
            error={errors.person?.lastName?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Mobile Number"
            {...register("contact.mobileNumber")}
            inputMode="tel"
            placeholder="+923001234567"
            error={errors.contact?.mobileNumber?.message}
            required
          />

          <FormInput
            label="Phone Number"
            {...register("contact.phoneNumber")}
            inputMode="tel"
            placeholder="+922112345678"
            error={errors.contact?.phoneNumber?.message}
          />

          <FormInput
            label="Email ID"
            type="email"
            {...register("contact.emailId")}
            error={errors.contact?.emailId?.message}
            required
          />
        </div>

        <FormInput
          label="Address"
          {...register("address.address")}
          error={errors.address?.address?.message}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Zip Code"
            {...register("address.zipCode")}
            inputMode="numeric"
            placeholder="e.g. 54000"
            error={errors.address?.zipCode?.message}
          />

          <FormInput
            label="City"
            {...register("address.city")}
            error={errors.address?.city?.message}
          />
          <FormInput
            label="Country"
            {...register("address.country")}
            error={errors.address?.country?.message}
          />
        </div>

        {/* Toggles Section - Using Controller exactly like TaxForm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormToggle
                label="Active"
                checked={field.value}
                onChange={field.onChange}
                disabled={isDefaultValue}
              />
            )}
          />
          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <FormToggle
                label="Default"
                checked={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  if (val) setValue("isActive", true);
                }}
              />
            )}
          />
        </div>

        <FormButton
          type="submit"
          label={editingData ? "Update Warehouse" : "Create"}
          icon={<Save size={20} />}
          loading={loading}
          themeColor={themeColor}
          onCancel={onClose}
        />
      </form>
    </FormModal>
  );
};

export default WareHousesForm;