// utils/categoryTransform.ts - Transform API categories to component format
import { DatabaseCategory } from '@/hooks/useCategory';

export interface ComponentCategory {
  id: string;
  name: string;
  level: number;
  parentId?: string;
}

/**
 * Transform database categories to component-compatible format
 */
export const transformCategoriesToComponentFormat = (
  dbCategories: DatabaseCategory[]
): ComponentCategory[] => {
  if (!dbCategories || !Array.isArray(dbCategories)) {
    return [];
  }

  // Helper to calculate level
  const calculateLevel = (category: DatabaseCategory, allCategories: DatabaseCategory[]): number => {
    if (!category.parentId) return 1;
    
    let level = 1;
    let currentParentId = category.parentId;
    const visitedIds = new Set<string>([category._id]);
    
    while (currentParentId && !visitedIds.has(currentParentId)) {
      const parent = allCategories.find(c => c._id === currentParentId);
      if (!parent) break;
      
      level++;
      visitedIds.add(currentParentId);
      currentParentId = parent.parentId;
      
      if (level > 10) break; // Safety limit
    }
    
    return level;
  };

  return dbCategories.map(cat => ({
    id: cat._id,                    // Map _id to id
    name: cat.categoryName,         // Map categoryName to name
    level: calculateLevel(cat, dbCategories),
    parentId: cat.parentId,
    // Preserve original data if needed
    _originalData: cat
  }));
};