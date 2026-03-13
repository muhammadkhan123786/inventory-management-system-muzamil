export interface ReorderProduct {
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    maxStockLevel: number;
    suggestedQty: number;
    costPrice: number;
    supplierId: string;
    supplierName: string;
    supplierEmail: string;
    daysUntilStockout?: number;
    severity: "critical" | "warning" | "low";
}

export type SortKey = "productName" | "currentStock" | "suggestedQty" | "severity" | "supplierName";
export type SortDir = "asc" | "desc";

export interface ReplenishmentProposalsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: ReorderProduct[];
    onCreateOrders: (selected: ReorderProduct[]) => Promise<void>;
    isCreating?: boolean;
}