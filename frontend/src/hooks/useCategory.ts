"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getAll, createItem, updateItem, deleteItem, getById } from "@/helper/apiHelper"; // ← adjust to your actual path
import { ICategory } from "../../../common/ICategory.interface";



// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  success: boolean;
  data: ICategory[];
  total: number;
  page?: number;
  limit?: number;
}

export interface UseCategoriesOptions {
  autoFetch?: boolean;
}

const ENDPOINT = "/categories";

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────

const getUserId = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.userId || "";
  } catch {
    return "";
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Core: fetch ALL categories from backend (backend ignores page/limit)
// ─────────────────────────────────────────────────────────────────────────────

const fetchAllFromBackend = async (): Promise<ICategory[]> => {
  const raw = await getAll<ICategory>(ENDPOINT, {
    userId: getUserId(),
    limit: 1000, // get everything in one shot
  });

  const data = Array.isArray((raw as any).data)
    ? (raw as any).data
    : Array.isArray(raw)
    ? (raw as any)
    : [];

  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// fetchCategories — used by CategoryDashboard
// Does client-side pagination + search since backend doesn't support it reliably
// ─────────────────────────────────────────────────────────────────────────────

export const fetchCategories = async (
  page = 1,
  limit = 10,
  search = ""
): Promise<CategoryResponse> => {
  // 1. Get full list from backend
  const allCategories = await fetchAllFromBackend();

  // 2. Filter by search term (client-side)
  const filtered = search.trim()
    ? allCategories.filter((cat) =>
        cat.categoryName.toLowerCase().includes(search.trim().toLowerCase())
      )
    : allCategories;

  // 3. Paginate (client-side)
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageData = filtered.slice(start, end);

  return {
    success: true,
    data: pageData,
    total: filtered.length, // total after search filter
    page,
    limit,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const createCategory = (payload: Partial<ICategory>): Promise<ICategory> =>
  createItem<ICategory>(ENDPOINT, { ...payload, userId: getUserId() } as ICategory);

export const updateCategory = (id: string, payload: Partial<ICategory>): Promise<ICategory> =>
  updateItem<ICategory>(ENDPOINT, id, payload as ICategory);

export const deleteCategory = (id: string): Promise<{ success: boolean; message?: string }> =>
  deleteItem(ENDPOINT, id);

export const fetchCategoryById = async (id: string): Promise<ICategory> => {
  const res = await getById<ICategory>(ENDPOINT, id);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// useCategories hook — for forms/dropdowns (needs full flat list + tree)
// ─────────────────────────────────────────────────────────────────────────────

export const useCategories = (options: UseCategoriesOptions = {}) => {
  const { autoFetch = true } = options;

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllFromBackend();
      setCategories(data);
      return { success: true, data, count: data.length };
    } catch (err: any) {
      const message = err?.message || "Failed to fetch categories";
      setError(message);
      setCategories([]);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateLevel = useCallback(
    (category: ICategory, allCategories: ICategory[]): number => {
      let level = 1;
      let currentParentId = category.parentId as string | undefined;
      const visited = new Set<string>([category._id!]);
      while (currentParentId && !visited.has(currentParentId)) {
        const parent = allCategories.find((c) => c._id === currentParentId);
        if (!parent) break;
        level++;
        visited.add(currentParentId);
        currentParentId = parent.parentId as string | undefined;
        if (level > 10) break;
      }
      return level;
    },
    []
  );

  const categoriesWithLevels = useMemo(
    () => categories.map((cat) => ({ ...cat, level: calculateLevel(cat, categories) })),
    [categories, calculateLevel]
  );

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, ICategory>();
    categories.forEach((cat) => map.set(cat._id!, cat));
    return map;
  }, [categories]);

  const getChildCategories = useCallback(
    (parentId: string) => categories.filter((c) => c.parentId === parentId),
    [categories]
  );

  const getDescendants = useCallback(
    (parentId: string): ICategory[] => {
      const result: ICategory[] = [];
      const visited = new Set<string>();
      const collect = (pid: string) => {
        if (visited.has(pid)) return;
        visited.add(pid);
        categories.filter((c) => c.parentId === pid).forEach((child) => {
          result.push(child);
          collect(child._id!);
        });
      };
      collect(parentId);
      return result;
    },
    [categories]
  );

  const getCategoryById = useCallback((id: string) => categoryMap.get(id), [categoryMap]);

  const getCategoryPath = useCallback(
    (categoryId: string): ICategory[] => {
      const path: ICategory[] = [];
      const visited = new Set<string>();
      let current = getCategoryById(categoryId);
      while (current && !visited.has(current._id!)) {
        path.unshift(current);
        visited.add(current._id!);
        current = current.parentId ? getCategoryById(current.parentId as string) : undefined;
        if (path.length > 10) break;
      }
      return path;
    },
    [getCategoryById]
  );

  const categoryTree = useMemo(() => {
    if (categories.length === 0) return [];
    type TreeNode = ICategory & { children: TreeNode[] };
    const nodeMap = new Map<string, TreeNode>();
    categoriesWithLevels.forEach((cat) =>
      nodeMap.set(cat._id!, { ...cat, children: [] } as TreeNode)
    );
    const roots: TreeNode[] = [];
    categoriesWithLevels.forEach((cat) => {
      const node = nodeMap.get(cat._id!)!;
      if (cat.parentId && nodeMap.has(cat.parentId as string)) {
        const parent = nodeMap.get(cat.parentId as string)!;
        parent.children.push(node);
        parent.children.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
      } else {
        roots.push(node);
      }
    });
    return roots.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [categoriesWithLevels]);

  const categoriesByLevel = useMemo(() => {
    const grouped: Record<number, ICategory[]> = {};
    categoriesWithLevels.forEach(({ level, ...cat }) => {
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(cat as ICategory);
    });
    return grouped;
  }, [categoriesWithLevels]);

  useEffect(() => {
    if (autoFetch) fetchAllCategories();
  }, [autoFetch, fetchAllCategories]);

  return {
    categories,
    categoriesWithLevels,
    rootCategories,
    categoryTree,
    categoryMap,
    categoriesByLevel,
    loading,
    error,
    fetchCategories: fetchAllCategories,
    refetch: fetchAllCategories,
    getChildCategories,
    getDescendants,
    getCategoryById,
    getCategoryPath,
    calculateLevel,
  };
};