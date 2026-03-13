import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Package, DollarSign, Edit2 } from "lucide-react";
import { Button } from "@/components/form/CustomButton";

interface SelectionStatsBarProps {
    selected: Set<string>;
    totalItems: number;
    totalOrderValue: number;
    onClear: () => void;
    onBulkEdit: () => void;
    showBulkEdit: boolean;
    bulkEditValue: number | "";
    setBulkEditValue: (value: number | "") => void;
    onApplyBulkEdit: () => void;
    onCancelBulkEdit: () => void;
}

export const SelectionStatsBar = ({
    selected,
    totalItems,
    totalOrderValue,
    onClear,
    onBulkEdit,
    showBulkEdit,
    bulkEditValue,
    setBulkEditValue,
    onApplyBulkEdit,
    onCancelBulkEdit
}: SelectionStatsBarProps) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 shrink-0"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Selected</p>
                            <p className="text-lg font-bold text-indigo-700">{selected.size}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Items</p>
                            <p className="text-lg font-bold text-purple-700">{totalItems}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Est. Value</p>
                            <p className="text-lg font-bold text-emerald-700">£{totalOrderValue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBulkEdit}
                        className="bg-white border-gray-200"
                    >
                        <Edit2 className="h-3 w-3 mr-2" />
                        Bulk Edit
                    </Button>
                    <button
                        onClick={onClear}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>

            {/* Bulk Edit Panel */}
            <AnimatePresence>
                {showBulkEdit && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200 flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                Set all {selected.size} selected items to:
                            </span>
                            <input
                                type="number"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value ? parseInt(e.target.value) : "")}
                                placeholder="Quantity"
                                min="1"
                                className="w-24 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Button
                                size="sm"
                                onClick={onApplyBulkEdit}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Apply
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onCancelBulkEdit}
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};