import { ICategory } from "../../../../../../../../common/ICategory.interface";

// 1. Use Omit to avoid the "Type undefined is not assignable" error
type CategoryNode = Omit<ICategory, 'children'> & {
  children: CategoryNode[];
};

export const getMaxDepth = (categories: ICategory[]): number => {
  if (!categories?.length) return 0;

  const map: Record<string, CategoryNode> = {};

  const isStringId = (val: unknown): val is string =>
    typeof val === "string" && val.length > 0;

  // 2. Build map - the Omit above makes this assignment valid
  categories.forEach((cat) => {
    if (typeof cat._id === "string") {
      map[cat._id] = {
        ...cat,
        children: [], 
      } as CategoryNode;
    }
  });

  // Link children
  categories.forEach((cat) => {
    if (
      typeof cat._id === "string" &&
      isStringId(cat.parentId) &&
      map[cat.parentId]
    ) {
      map[cat.parentId].children.push(map[cat._id]);
    }
  });

  // DFS
  const dfs = (node: CategoryNode, depth: number): number => {
    if (!node.children.length) return depth;
    return Math.max(...node.children.map((child) => dfs(child, depth + 1)));
  };

  const roots = Object.values(map).filter((cat) => !isStringId(cat.parentId));

  return roots.length ? Math.max(...roots.map((root) => dfs(root, 1))) : 0;
};