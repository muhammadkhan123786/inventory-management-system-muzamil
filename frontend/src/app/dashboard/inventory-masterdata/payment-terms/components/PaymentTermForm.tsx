"use client";
import React, { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, FileText } from "lucide-react";
import { z } from "zod";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { useFormActions } from "@/hooks/useFormActions";

const paymentTermSchemaValidation = z.object({
  paymentTerm: z.string().min(1, "Payment term name is required."),
  description: z.string().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
});

type FormData = z.infer<typeof paymentTermSchemaValidation>;

interface Props {
  editingData: (any & { _id?: string }) | null;
  onClose: () => void;
  onRefresh: () => void; // Optional in usage
  themeColor: string;
}

const PaymentTermForm = ({
  editingData,
  onClose,
  themeColor,
}: Props) => {
  // Use the hook for mutations
  const { createItem, updateItem, isSaving } = useFormActions(
    "/payment-terms",
    "paymentTerms",
    "Payment Term"
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(paymentTermSchemaValidation),
    defaultValues: {
      paymentTerm: "",
      description: "",
      isActive: true,
      isDefault: false,
    },
  });

  const isDefaultValue = useWatch({ control, name: "isDefault" });

  useEffect(() => {
    if (editingData) {
      reset({
        paymentTerm: editingData.paymentTerm,
        description: editingData.description || "",
        isActive: Boolean(editingData.isActive),
        isDefault: Boolean(editingData.isDefault),
      });
    }
  }, [editingData, reset]);

  const onSubmit = async (values: FormData) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const payload = { ...values, userId: user.id || user._id };

    if (editingData?._id) {
      // Update Mutation
      updateItem(
        { id: editingData._id, payload },
        {
          onSuccess: () => {
            onClose(); // List will refresh automatically
          }
        }
      );
    } else {
      // Create Mutation
      createItem(payload, {
        onSuccess: () => {
          onClose(); // List will refresh automatically
        }
      });
    }
  };

  return (
    <FormModal
      title={editingData ? "Edit Payment Term" : "Add Payment Term"}
      icon={<FileText size={24} />}
      onClose={onClose}
      themeColor={themeColor}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormInput
          label="Payment Term *"
          placeholder="e.g. Net 30, Due on Receipt"
          {...register("paymentTerm")}
          error={errors.paymentTerm?.message}
        />

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Description
          </label>
          <textarea
            placeholder="e.g. Payment is due 30 days after invoice date"
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 transition-all border-gray-200 resize-none h-20 focus:ring-blue-300"
            {...register("description")}
          />
        </div>

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
          label={editingData ? "Update Term" : "Create"}
          icon={<Save size={20} />}
          loading={isSaving}
          themeColor={themeColor}
          onCancel={onClose}
        />
      </form>
    </FormModal>
  );
};

export default PaymentTermForm;
