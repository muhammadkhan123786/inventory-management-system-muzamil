import { CategoryNode } from "../../types/product";

export interface FlatCategory {
    id: string;
    categoryName: string;
    path: string[];       // ["Electronics", "Phones", "Smartphones"]
    pathIds: string[];    // ["cat1", "cat2", "cat3"]
    level: number;        // 1 | 2 | 3 ...
}

/**
 * Recursively flattens a category tree into a list of FlatCategory objects.
 * Each node carries its full ancestor path so we can auto-populate selectedPath.
 */
export function flattenCategories(
    categories: CategoryNode[],
    parentPath: string[] = [],
    parentPathIds: string[] = []
): FlatCategory[] {
    const result: FlatCategory[] = [];

    for (const cat of categories) {
        const path = [...parentPath, cat.categoryName];
        const pathIds = [...parentPathIds, cat._id];

        result.push({
            id: cat._id,
            categoryName: cat.categoryName,
            path,
            pathIds,
            level: path.length,
        });

        if (cat.children?.length) {
            result.push(...flattenCategories(cat.children, path, pathIds));
        }
    }

    return result;
}