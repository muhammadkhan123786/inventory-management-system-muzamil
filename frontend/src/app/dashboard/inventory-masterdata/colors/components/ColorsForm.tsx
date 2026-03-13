"use client";
import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Palette, Pipette } from "lucide-react";
import { z } from "zod";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { IColor } from "../../../../../../../common/IColor.interface";
import { useFormActions } from "@/hooks/useFormActions";

// Validation Schema
const colorSchemaValidation = z.object({
  colorName: z.string().min(1, "Color name is required."),
  colorCode: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex code"),
  isActive: z.boolean(),
  isDefault: z.boolean(),
});

type FormData = z.infer<typeof colorSchemaValidation>;

interface Props {
  editingData: IColor | null;
  onClose: () => void;
  onRefresh: () => void;
  themeColor: string;
}

const ColorsForm = ({ editingData, onClose, themeColor }: Props) => {
  // Use the hook for mutations
  const { createItem, updateItem, isSaving } = useFormActions(
    "/colors",
    "colors",
    "Color"
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(colorSchemaValidation),
    defaultValues: {
      colorName: "",
      colorCode: "#FE6B1D",
      isActive: true,
      isDefault: false,
    },
  });

  const isDefaultValue = useWatch({ control, name: "isDefault" });
  const colorCodeValue = useWatch({ control, name: "colorCode" });

  useEffect(() => {
    if (editingData) {
      reset({
        colorName: editingData.colorName,
        colorCode: editingData.colorCode,
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
      title={editingData ? "Edit Color" : "Add New Color"}
      icon={<Palette size={24} />}
      onClose={onClose}
      themeColor={themeColor}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color Name Input */}
          <FormInput
            label="Color Name *"
            placeholder="e.g. Royal Blue"
            {...register("colorName")}
            error={errors.colorName?.message}
          />

          {/* Color Picker Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Pipette size={16} /> Select Color
            </label>
            <div className="flex items-center gap-3 h-[50px]">
              <Controller
                control={control}
                name="colorCode"
                render={({ field }) => (
                  <>
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-16 h-full p-1 rounded-lg border border-gray-200 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex-1 h-full px-3 border border-gray-200 rounded-lg outline-none font-mono uppercase text-sm focus:ring-2 focus:ring-orange-300"
                      placeholder="#000000"
                    />
                  </>
                )}
              />
            </div>
            {errors.colorCode && (
              <span className="text-red-500 text-xs">{errors.colorCode.message}</span>
            )}
          </div>
        </div>

        {/* Status Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 bg-gray-50 p-4 rounded-xl">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormToggle
                label="Active Status"
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
                label="Set as Default"
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
          label={editingData ? "Update Color" : "Save Color"}
          icon={<Save size={20} />}
          loading={isSaving}
          themeColor={themeColor}
          onCancel={onClose}
        />
      </form>
    </FormModal>
  );
};

export default ColorsForm;