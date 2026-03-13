import { CategoryNode } from '../types/product';

export function getSelectedCategoryPath(
  categories: CategoryNode[],
  path: string[]
): CategoryNode[] {
  let current = categories;
  const result: CategoryNode[] = [];

  for (const id of path) {
    const found = current?.find(cat => cat._id === id);
    if (!found) break;
    result.push(found);
    current = found.children || [];
  }

  return result;
}


export function getCategoriesAtLevel(
  tree: CategoryNode[],
  path: string[],
  level: number
): CategoryNode[] {
  if (level === 0) return tree;

  let current = tree;

  for (let i = 0; i < level; i++) {
    const found = current?.find(cat => cat._id === path[i]);
    if (!found || !found.children) return [];
    current = found.children;
  }

  return current;
}
