"use client";
import { useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Save, Upload, X } from "lucide-react";
import { z } from "zod";
import { IIcons } from "../../../../../../common/master-interfaces/IIcons.interface";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { useFormActions } from "@/hooks/useFormActions";
import { toast } from "react-hot-toast";

// Validation Schema
const iconSchemaValidation = z.object({
  iconName: z.string().min(1, "Icon name is required."),
  icon: z.string().min(1, "Icon file is required."),
  isActive: z.boolean(),
  isDefault: z.boolean(),
});

type FormData = z.infer<typeof iconSchemaValidation>;

type IconWithId = IIcons & { _id: string };

interface Props {
  editingData: IconWithId | null;
  onClose: () => void;
  onRefresh: () => void;
  themeColor: string;
}

const IconsForm = ({ editingData, onClose, themeColor }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createItem, updateItem, isSaving } = useFormActions(
    "/icons",
    "icons",
    "Icon"
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(iconSchemaValidation),
    defaultValues: {
      iconName: "",
      icon: "",
      isActive: true,
      isDefault: false,
    },
  });

  // Watch values to handle logic like JobTitle (Default must be Active)
  const isDefaultValue = useWatch({ control, name: "isDefault" });
  const iconPreview = useWatch({ control, name: "icon" });

  useEffect(() => {
    if (editingData) {
      reset({
        iconName: editingData.iconName,
        icon: editingData.icon,
        isActive: Boolean(editingData.isActive),
        isDefault: Boolean(editingData.isDefault),
      });
    }
  }, [editingData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("icon", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormData) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const payload = { ...values, userId: user.id || user._id };

    if (editingData?._id) {
      updateItem(
        { id: editingData._id, payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error updating icon");
          }
        }
      );
    } else {
      createItem(payload, {
        onSuccess: () => {
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Error creating icon");
        }
      });
    }
  };

  return (
    <FormModal 
      title={editingData ? "Edit Icon" : "Add New Icon"} 
      icon={<ImageIcon size={24} />} 
      onClose={onClose} 
      themeColor={themeColor}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        {/* Icon Name Input */}
        <FormInput 
          label="Icon Name *" 
          placeholder="e.g. Shopping Cart"
          {...register("iconName")}
          error={errors.iconName?.message}
        />

        {/* Custom Icon Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Icon File (Preview) *</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 group ${
              errors.icon ? "border-red-500" : "border-gray-300 hover:border-blue-400"
            }`}
          >
            {iconPreview ? (
              <div className="relative">
                <img src={iconPreview} alt="Preview" className="h-24 w-24 object-contain" />
                <button 
                  type="button"
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setValue("icon", ""); 
                  }}
                >
                  <X size={16}/>
                </button>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-500" size={32} />
                </div>
                <p className="text-sm text-gray-500 font-medium">Click to upload icon image</p>
                <p className="text-xs text-gray-400 mt-1">SVG, PNG or JPG (Max 2MB)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          {errors.icon && <p className="text-xs text-red-500 mt-1">{errors.icon.message}</p>}
        </div>

        {/* Toggles - Matching JobTitle Logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormToggle 
                label="Active" 
                checked={field.value} 
                onChange={field.onChange}
                disabled={isDefaultValue} // Cannot deactivate if it's default
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
                  if (val) setValue("isActive", true); // Auto-activate if set to default
                }} 
              />
            )}
          />
        </div>

        <FormButton 
          type="submit" 
          label={editingData ? "Update Icon" : "Create"} 
          icon={<Save size={20} />} 
          loading={isSaving}
          themeColor={themeColor}
          onCancel={onClose}
        />
      </form>
    </FormModal>
  );
};

export default IconsForm;