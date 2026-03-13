"use client";

import { useState, useMemo } from "react";
import {
    Dialog, DialogContent,
    DialogTitle, DialogDescription
} from "@/components/form/Dialog";
import { Button } from "@/components/form/CustomButton";
import { PackageX, Send, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

// Components
import { Header } from "../components/replenishment/components/Header";
import { SelectionStatsBar } from "../components/replenishment/components/SelectionStatsBar";
import { TableHeader } from "../components/replenishment/components/TableHeader";
import { ProductRow } from "../components/replenishment/components/ProductRow";

// Hooks
import { useQuantities } from "../components/replenishment/hooks/useQuantities";
import { useSelection } from "../components/replenishment/hooks/useSelection";
import { useSortAndFilter } from "../components/replenishment/hooks/useSortAndFilter";

// Types
import { ReplenishmentProposalsModalProps } from "../components/replenishment/types";

export function ReplenishmentProposalsModal({
    open,
    onOpenChange,
    products,
    onCreateOrders,
    isCreating = false,
}: ReplenishmentProposalsModalProps) {
    
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<number | "">("");

    // Custom hooks
    const { 
        quantities, 
        handleQuantityChange, 
        resetToSuggested,
        applyBulkEdit 
    } = useQuantities(products);

    const { 
        visibleProducts,
        sortKey,
        sortDir,
        filterText,
        setFilterText,
        toggleSort 
    } = useSortAndFilter(products, quantities);

    const visibleProductIds = useMemo(() => 
        visibleProducts.map(p => p.productId), 
        [visibleProducts]
    );

    const {
        selected,
        allSelected,
        someSelected,
        toggleAll,
        toggleOne,
        clearSelection
    } = useSelection(products, visibleProductIds);

    // Selected products with custom quantities
    const selectedProducts = useMemo(() => {
        return products
            .filter(p => selected.has(p.productId))
            .map(p => ({
                ...p,
                suggestedQty: quantities.get(p.productId) || p.suggestedQty
            }));
    }, [products, selected, quantities]);

    // Summary stats
    const uniqueSuppliers = new Set(selectedProducts.map(p => p.supplierId)).size;
    const totalOrderValue = selectedProducts.reduce((s, p) => s + p.suggestedQty * p.costPrice, 0);
    const criticalCount = products.filter(p => p.severity === "critical").length;
    const totalItems = selectedProducts.reduce((s, p) => s + p.suggestedQty, 0);
    const suppliersCount = new Set(products.map(p => p.supplierId)).size;
    const estimatedTotal = products.reduce((s, p) => s + p.suggestedQty * p.costPrice, 0);

    // Handlers
    const handleBulkEditApply = () => {
        if (bulkEditValue === "" || bulkEditValue < 1) {
            toast.error("Please enter a valid quantity");
            return;
        }

        applyBulkEdit(
            selectedProducts.map(p => p.productId), 
            Number(bulkEditValue)
        );
        
        setShowBulkEdit(false);
        setBulkEditValue("");
        toast.success(`Updated ${selected.size} items to ${bulkEditValue}`);
    };

    const handleConfirm = async () => {
        if (selected.size === 0) {
            toast.warning("Select at least one product to create a purchase order.");
            return;
        }
        await onCreateOrders(selectedProducts);
        clearSelection();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogTitle className="sr-only">Replenishment Proposals</DialogTitle>
                <DialogDescription className="sr-only">
                    {products.length} product{products.length !== 1 ? "s" : ""} require stock replenishment.
                    {criticalCount > 0 && ` ${criticalCount} critical item${criticalCount !== 1 ? "s" : ""}.`}
                </DialogDescription>

                {/* Header */}
                <Header
                    productsCount={products.length}
                    suppliersCount={suppliersCount}
                    estimatedTotal={estimatedTotal}
                    criticalCount={criticalCount}
                    filterText={filterText}
                    onFilterChange={setFilterText}
                    onResetQuantities={resetToSuggested}
                />

                {/* Selection Stats Bar */}
                {selected.size > 0 && (
                    <SelectionStatsBar
                        selected={selected}
                        totalItems={totalItems}
                        totalOrderValue={totalOrderValue}
                        onClear={clearSelection}
                        onBulkEdit={() => setShowBulkEdit(!showBulkEdit)}
                        showBulkEdit={showBulkEdit}
                        bulkEditValue={bulkEditValue}
                        setBulkEditValue={setBulkEditValue}
                        onApplyBulkEdit={handleBulkEditApply}
                        onCancelBulkEdit={() => {
                            setShowBulkEdit(false);
                            setBulkEditValue("");
                        }}
                    />
                )}

                {/* Table */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50">
                    {visibleProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <PackageX className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700">No products found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <TableHeader
                                sortKey={sortKey}
                                sortDir={sortDir}
                                onToggle={toggleSort}
                                allSelected={allSelected}
                                someSelected={someSelected}
                                onToggleAll={toggleAll}
                            />
                            <tbody>
                                {visibleProducts.map((product, idx) => {
                                    const currentQty = quantities.get(product.productId) || product.suggestedQty;
                                    const isChecked = selected.has(product.productId);

                                    return (
                                        <ProductRow
                                            key={product.productId}
                                            product={product}
                                            isChecked={isChecked}
                                            currentQty={currentQty}
                                            onToggle={toggleOne}
                                            onQuantityChange={handleQuantityChange}
                                            index={idx}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t-2 border-gray-200 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Info className="h-4 w-4 text-gray-400" />
                            <span>
                                Click on quantity to edit • Products grouped by supplier
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isCreating}
                                className="border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={selected.size === 0 || isCreating}
                                className={`flex items-center gap-2 px-6 ${
                                    selected.size > 0
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {isCreating ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating {uniqueSuppliers} PO{uniqueSuppliers !== 1 ? "s" : ""}…</>
                                ) : (
                                    <><Send className="h-4 w-4" /> Create {uniqueSuppliers} Purchase Order{uniqueSuppliers !== 1 ? "s" : ""}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}