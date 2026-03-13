import { useState, useCallback } from "react";
import { ReorderProduct } from "../types";

export const useQuantities = (products: ReorderProduct[]) => {
    const [quantities, setQuantities] = useState<Map<string, number>>(() => {
        const initial = new Map();
        products.forEach(p => {
            initial.set(p.productId, p.suggestedQty);
        });
        return initial;
    });

    const handleQuantityChange = useCallback((productId: string, newValue: number) => {
        setQuantities(prev => {
            const updated = new Map(prev);
            updated.set(productId, newValue);
            return updated;
        });
    }, []);

    const resetToSuggested = useCallback(() => {
        setQuantities(prev => {
            const updated = new Map(prev);
            products.forEach(p => {
                updated.set(p.productId, p.suggestedQty);
            });
            return updated;
        });
    }, [products]);

    const applyBulkEdit = useCallback((productIds: string[], value: number) => {
        setQuantities(prev => {
            const updated = new Map(prev);
            productIds.forEach(id => {
                updated.set(id, value);
            });
            return updated;
        });
    }, []);

    return {
        quantities,
        handleQuantityChange,
        resetToSuggested,
        applyBulkEdit
    };
};