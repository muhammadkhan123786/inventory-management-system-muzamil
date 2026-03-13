import { useState, useCallback, useMemo } from "react";
import { ReorderProduct } from "../types";

export const useSelection = (products: ReorderProduct[], visibleProductIds: string[]) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const allSelected = useMemo(() => 
        visibleProductIds.length > 0 && visibleProductIds.every(id => selected.has(id)),
        [visibleProductIds, selected]
    );

    const someSelected = useMemo(() => 
        visibleProductIds.some(id => selected.has(id)),
        [visibleProductIds, selected]
    );

    const toggleAll = useCallback(() => {
        if (allSelected) {
            setSelected(prev => {
                const next = new Set(prev);
                visibleProductIds.forEach(id => next.delete(id));
                return next;
            });
        } else {
            setSelected(prev => {
                const next = new Set(prev);
                visibleProductIds.forEach(id => next.add(id));
                return next;
            });
        }
    }, [allSelected, visibleProductIds]);

    const toggleOne = useCallback((id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelected(new Set());
    }, []);

    return {
        selected,
        allSelected,
        someSelected,
        toggleAll,
        toggleOne,
        clearSelection
    };
};