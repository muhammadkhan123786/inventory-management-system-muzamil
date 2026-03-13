"use client";
import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Receipt } from "lucide-react";
import { z } from "zod";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { ITax } from "../../../../../../../common/ITax.interface";
import { useFormActions } from "@/hooks/useFormActions";

const taxSchemaValidation = z.object({
    taxName: z.string().min(1, "Tax name is required."),
    percentage: z.number().min(0, "Percentage must be 0 or greater."),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean(),
    isDefault: z.boolean(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
    },
    { message: "End Date cannot be before Start Date.", path: ["endDate"] }
);

type FormData = z.infer<typeof taxSchemaValidation>;

interface Props {
    editingData: (ITax & { _id?: string }) | null;
    onClose: () => void;
    onRefresh: () => void;
    themeColor: string;
}

const TaxForm = ({ editingData, onClose, themeColor }: Props) => {
    // Use the hook for mutations
    const { createItem, updateItem, isSaving } = useFormActions(
        "/tax",
        "taxes",
        "Tax"
    );
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(taxSchemaValidation),
        defaultValues: {
            taxName: "",
            percentage: 0,
            startDate: "",
            endDate: "",
            isActive: true,
            isDefault: false,
        },
    });

    const isDefaultValue = useWatch({ control, name: "isDefault" });

    useEffect(() => {
        if (editingData) {
            reset({
                taxName: editingData.taxName,
                percentage: editingData.percentage || 0,
                startDate: editingData.startDate
                    ? new Date(editingData.startDate).toISOString().split("T")[0]
                    : "",
                endDate: editingData.endDate
                    ? new Date(editingData.endDate).toISOString().split("T")[0]
                    : "",
                isActive: Boolean(editingData.isActive),
                isDefault: Boolean(editingData.isDefault),
            });
        }
    }, [editingData, reset]);

    const onSubmit = async (values: FormData) => {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const payload = {
            ...values,
            userId: user.id || user._id,
            startDate: values.startDate ? new Date(values.startDate) : undefined,
            endDate: values.endDate ? new Date(values.endDate) : undefined,
        };

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
            title={editingData ? "Edit Tax" : "Add New Tax"}
            icon={<Receipt size={24} />}
            onClose={onClose}
            themeColor={themeColor}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                <FormInput
                    label="Tax Name *"
                    placeholder="e.g. VAT, Sales Tax"
                    {...register("taxName")}
                    error={errors.taxName?.message}
                />

                <FormInput
                    label="Percentage (%) *"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5.00"
                    {...register("percentage", { valueAsNumber: true })}
                    error={errors.percentage?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Start Date"
                        type="date"
                        {...register("startDate")}
                        error={errors.startDate?.message}
                    />
                    <FormInput
                        label="End Date"
                        type="date"
                        {...register("endDate")}
                        error={errors.endDate?.message}
                    />
                </div>

                {errors.endDate && (
                    <p className="text-red-500 text-sm">End Date cannot be before Start Date.</p>
                )}

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
                    label={editingData ? "Update Tax" : "Create"}
                    icon={<Save size={20} />}
                    loading={isSaving}
                    themeColor={themeColor}
                    onCancel={onClose}
                />
            </form>
        </FormModal>
    );
};

export default TaxForm;
