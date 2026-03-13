"use client";
import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ClipboardList } from "lucide-react";
import { z } from "zod";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { IOrderStatus } from "../../../../../../../common/order.status.interface";
import { useFormActions } from "@/hooks/useFormActions";

// Validation Schema
const orderStatusSchemaValidation = z.object({
    orderStatus: z.string().min(1, "Status name is required."),
    isActive: z.boolean(),
    isDefault: z.boolean(),
});

type FormData = z.infer<typeof orderStatusSchemaValidation>;

interface Props {
    editingData: (IOrderStatus & { _id?: string }) | null;
    onClose: () => void;
    onRefresh: () => void; // Optional in usage
    themeColor: string;
}

const OrderStatusForm = ({ editingData, onClose, themeColor }: Props) => {
    // Use the hook for mutations
    const { createItem, updateItem, isSaving } = useFormActions(
        "/order-status",
        "orderStatus",
        "Order Status"
    );
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(orderStatusSchemaValidation),
        defaultValues: {
            orderStatus: "",
            isActive: true,
            isDefault: false,
        },
    });

    // Watch isDefault to automatically handle Active state
    const isDefaultValue = useWatch({ control, name: "isDefault" });

    useEffect(() => {
        if (editingData) {
            reset({
                orderStatus: editingData.orderStatus,
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
            title={editingData ? "Edit Order Status" : "Add Order Status"}
            icon={<ClipboardList size={24} />}
            onClose={onClose}
            themeColor={themeColor}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                <FormInput
                    label="Status Name *"
                    placeholder="e.g. Pending, Shipped, Delivered"
                    {...register("orderStatus")}
                    error={errors.orderStatus?.message}
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
                                disabled={isDefaultValue} // Default statuses must be active
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
                    label={editingData ? "Update Status" : "Create"}
                    icon={<Save size={20} />}
                    loading={isSaving}
                    themeColor={themeColor}
                    onCancel={onClose}
                />
            </form>
        </FormModal>
    );
};

export default OrderStatusForm;