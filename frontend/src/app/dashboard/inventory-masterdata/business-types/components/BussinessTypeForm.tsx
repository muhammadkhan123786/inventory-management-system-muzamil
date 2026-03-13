"use client";
import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Briefcase } from "lucide-react";
import { z } from "zod";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { IBusinessTypes } from "../../../../../../../common/suppliers/IBusiness.types.interface";
import { useFormActions } from "@/hooks/useFormActions"; // Humari generic hook

// Schema Validation (Same as before)
const businessTypeSchemaValidation = z.object({
    businessTypeName: z.string().min(1, "Business type name is required."),
    isActive: z.boolean(),
    isDefault: z.boolean(),
});

type FormData = z.infer<typeof businessTypeSchemaValidation>;

interface Props {
    editingData: (IBusinessTypes & { _id?: string }) | null;
    onClose: () => void;
    onRefresh: () => void; // Ab ye optional ho jayega
    themeColor: string;
}

const BussinessTypeForm = ({ editingData, onClose, themeColor }: Props) => {
    // 1. Hook call karein (Wahi endpoint aur key jo Client mein use ki)
    const { createItem, updateItem, isSaving } = useFormActions(
        "/business-types",
        "businessTypes",
        "Business Type"
    );

    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(businessTypeSchemaValidation),
        defaultValues: {
            businessTypeName: "",
            isActive: true,
            isDefault: false,
        },
    });

    const isDefaultValue = useWatch({ control, name: "isDefault" });

    useEffect(() => {
        if (editingData) {
            reset({
                businessTypeName: editingData.businessTypeName,
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
            // 2. Update Mutation
            updateItem(
                { id: editingData._id, payload },
                {
                    onSuccess: () => {
                        onClose(); // List khud refresh ho jayegi
                    }
                }
            );
        } else {
            // 3. Create Mutation
            createItem(payload, {
                onSuccess: () => {
                    onClose(); // List khud refresh ho jayegi
                }
            });
        }
    };

    return (
        <FormModal
            title={editingData ? "Edit Business Type" : "Add Business Type"}
            icon={<Briefcase size={24} />}
            onClose={onClose}
            themeColor={themeColor}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                <FormInput
                    label="Business Type Name *"
                    placeholder="e.g. Manufacturer"
                    {...register("businessTypeName")}
                    error={errors.businessTypeName?.message}
                />

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
                    label={editingData ? "Update Service" : "Create"}
                    icon={<Save size={20} />}
                    loading={isSaving} // Hook se loading state mil rahi hai
                    themeColor={themeColor}
                    onCancel={onClose}
                />
            </form>
        </FormModal>
    );
};

export default BussinessTypeForm;