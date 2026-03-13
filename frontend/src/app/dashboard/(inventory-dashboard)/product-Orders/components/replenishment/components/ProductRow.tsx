import { motion } from "framer-motion";
import { CheckSquare, Square } from "lucide-react";
import { ReorderProduct } from "../types";
import { SEVERITY } from "../constants/severity";
import { StockBar } from "./StockBar";
import { EditableQuantityCell } from "./EditableQuantityCell";

interface ProductRowProps {
    product: ReorderProduct;
    isChecked: boolean;
    currentQty: number;
    onToggle: (id: string) => void;
    onQuantityChange: (productId: string, newValue: number) => void;
    index: number;
}

export const ProductRow = ({ 
    product, 
    isChecked, 
    currentQty, 
    onToggle, 
    onQuantityChange,
    index 
}: ProductRowProps) => {
    const sev = SEVERITY[product.severity];
    const SevIcon = sev.icon;
    const lineTotal = currentQty * product.costPrice;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`border-b border-gray-100 transition-all ${
                isChecked 
                    ? "bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100/80 hover:to-purple-100/80" 
                    : "hover:bg-gray-50/80"
            }`}
        >
            <td className="px-4 py-4" onClick={() => onToggle(product.productId)}>
                {isChecked ? (
                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                ) : (
                    <Square className="h-5 w-5 text-gray-300" />
                )}
            </td>
            <td className="px-3 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${sev.lightBadge}`}>
                    <SevIcon className="h-3.5 w-3.5" />
                    {sev.label}
                </span>
            </td>
            <td className="px-3 py-4">
                <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{product.sku}</p>
            </td>
            <td className="px-3 py-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${sev.text}`}>
                            {product.currentStock}
                        </span>
                        <span className="text-xs text-gray-400">/ {product.maxStockLevel}</span>
                    </div>
                    <StockBar
                        current={product.currentStock}
                        max={product.maxStockLevel}
                        reorder={product.reorderPoint}
                        severity={product.severity}
                    />
                </div>
            </td>
            <td className="px-3 py-4">
                <EditableQuantityCell
                    productId={product.productId}
                    value={currentQty}
                    onChange={onQuantityChange}
                    min={1}
                    max={Math.max(product.maxStockLevel * 2, 100)}
                    severity={product.severity}
                />
            </td>
            <td className="px-3 py-4 text-sm text-gray-600">
                £{product.costPrice.toFixed(2)}
            </td>
            <td className="px-3 py-4">
                <span className="font-medium text-gray-900">
                    £{lineTotal.toFixed(2)}
                </span>
            </td>
            <td className="px-3 py-4">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${product.supplierId ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700">{product.supplierName || "—"}</span>
                </div>
                {product.supplierEmail && (
                    <p className="text-xs text-gray-400 mt-0.5">{product.supplierEmail}</p>
                )}
            </td>
            <td className="px-3 py-4">
                {product.daysUntilStockout != null ? (
                    <span className={`text-sm font-semibold ${
                        product.daysUntilStockout <= 3 ? "text-red-600" :
                        product.daysUntilStockout <= 7 ? "text-orange-600" :
                        "text-amber-600"
                    }`}>
                        {product.daysUntilStockout}d
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </td>
        </motion.tr>
    );
};