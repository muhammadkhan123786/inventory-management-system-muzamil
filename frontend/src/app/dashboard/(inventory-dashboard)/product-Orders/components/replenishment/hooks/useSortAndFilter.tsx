import { useState, useMemo, useCallback } from "react";
import { ReorderProduct, SortKey, SortDir } from "../types";
import { SEVERITY_ORDER } from "../constants/severity";

export const useSortAndFilter = (products: ReorderProduct[], quantities: Map<string, number>) => {
    const [sortKey, setSortKey] = useState<SortKey>("severity");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [filterText, setFilterText] = useState("");

    const toggleSort = useCallback((key: SortKey) => {
        if (sortKey === key) {
            setSortDir(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }, [sortKey]);

    const visibleProducts = useMemo(() => {
        let filtered = [...products];

        // Apply filter
        if (filterText.trim()) {
            const query = filterText.toLowerCase();
            filtered = filtered.filter(p =>
                p.productName.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                p.supplierName.toLowerCase().includes(query)
            );
        }

        // Apply sort
        filtered.sort((a, b) => {
            let cmp = 0;
            
            if (sortKey === "severity") {
                cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
            } else if (sortKey === "currentStock") {
                cmp = a.currentStock - b.currentStock;
            } else if (sortKey === "suggestedQty") {
                const qtyA = quantities.get(a.productId) || a.suggestedQty;
                const qtyB = quantities.get(b.productId) || b.suggestedQty;
                cmp = qtyA - qtyB;
            } else {
                cmp = a[sortKey].localeCompare(b[sortKey]);
            }
            
            return sortDir === "asc" ? cmp : -cmp;
        });

        return filtered;
    }, [products, filterText, sortKey, sortDir, quantities]);

    return {
        sortKey,
        sortDir,
        filterText,
        setFilterText,
        toggleSort,
        visibleProducts
    };
};