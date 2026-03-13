"use client";
import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, MapPin } from "lucide-react";
import { z } from "zod";
import axios from "axios";
import { FormModal } from "@/app/common-form/FormModal";
import { FormInput } from "@/app/common-form/FormInput";
import { FormToggle } from "@/app/common-form/FormToggle";
import { FormButton } from "@/app/common-form/FormButton";
import { useFormActions } from "@/hooks/useFormActions";
import { ICityInterface } from "../../../../../../common/City.interface";

// Validation Schema
const citySchemaValidation = z.object({
    countryId: z.string().min(1, "Please select a country."),
    cityName: z.string().min(1, "City name is required."),
    isActive: z.boolean(),
    isDefault: z.boolean(),
});

type FormData = z.infer<typeof citySchemaValidation>;

interface Props {
    editingData: (ICityInterface & { _id?: string }) | null;
    onClose: () => void;
    onRefresh: () => void;
    themeColor: string;
}

const CityForm = ({ editingData, onClose, themeColor }: Props) => {
    const { createItem, updateItem, isSaving } = useFormActions(
        "/city",
        "cities",
        "City"
    );
    const [countries, setCountries] = useState<any[]>([]);
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(citySchemaValidation),
        defaultValues: {
            countryId: "",
            cityName: "",
            isActive: true,
            isDefault: false,
        },
    });

    const isDefaultValue = useWatch({ control, name: "isDefault" });

    // Fetch Countries for the dropdown
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${BASE_URL}/country?filter=all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { isActive: true, isDeleted: false }
                });
                setCountries(res.data.data || []);
            } catch (err) {
                console.error("Country fetch error", err);
            }
        };
        fetchCountries();
    }, [BASE_URL]);

    // Reset form when editingData changes
    useEffect(() => {
        if (editingData) {
            reset({
                countryId: typeof editingData.countryId === 'object' ? (editingData.countryId as any)._id : editingData.countryId,
                cityName: editingData.cityName,
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
            updateItem(
                { id: editingData._id, payload },
                {
                    onSuccess: () => {
                        onClose();
                    }
                }
            );
        } else {
            createItem(payload, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    return (
        <FormModal
            title={editingData ? "Edit City" : "Add New City"}
            icon={<MapPin size={24} />}
            onClose={onClose}
            themeColor={themeColor}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
                {/* Country Select Dropdown */}
                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Country *</label>
                    <select
                        {...register("countryId")}
                        className={`w-full border rounded-xl p-3 outline-none focus:ring-2 transition-all ${
                            errors.countryId ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-blue-100"
                        }`}
                    >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.countryName}
                            </option>
                        ))}
                    </select>
                    {errors.countryId && (
                        <p className="text-red-500 text-xs mt-1">{errors.countryId.message}</p>
                    )}
                </div>

                {/* City Name Input */}
                <FormInput
                    label="City Name *"
                    placeholder="e.g. New York"
                    {...register("cityName")}
                    error={errors.cityName?.message}
                />

                {/* Toggles */}
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

                {/* Action Buttons */}
                <FormButton
                    type="submit"
                    label={editingData ? "Update City" : "Create"}
                    icon={<Save size={20} />}
                    loading={isSaving}
                    themeColor={themeColor}
                    onCancel={onClose}
                />
            </form>
        </FormModal>
    );
};

export default CityForm;