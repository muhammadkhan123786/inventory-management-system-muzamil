// hooks/useCategory.ts - CORRECTED VERSION WITH PROPER API HANDLING
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// ✅ Direct database interface - no transformation needed
export interface DatabaseCategory {
  _id: string;
  categoryName: string;
  parentId: string;
  isActive?: boolean;
  isDeleted?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryWithLevel extends DatabaseCategory {
  level: number;
  name: string;
}

export interface UseCategoriesOptions {
  autoFetch?: boolean;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`;

const getAuthConfig = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } 
  };
};

const getUserId = () => {
  if (typeof window === "undefined") return "";
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return "";
    const user = JSON.parse(userStr);
    return user.id || user._id || user.userId || "";
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return "";
  }
};

export const useCategories = (options: UseCategoriesOptions = {}) => {
  const { autoFetch = true } = options;

  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all categories directly from database - IMPROVED VERSION
   */
  const fetchCategoriesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();
      
      // console.log('=== FETCH CATEGORIES DEBUG ===');
      // console.log('📦 API URL:', API_URL);
      // console.log('👤 User ID:', userId);
      // console.log('🔑 Token exists:', !!localStorage.getItem("token"));
      
      let response;
      let categoriesData: DatabaseCategory[] = [];
      
      // STRATEGY 1: Try with minimal filters first
      try {
        console.log('🔄 Attempt 1: Fetching with limit only...');
        response = await axios.get(API_URL, {
          ...getAuthConfig(),
          params: {
            limit: 1000
          }
        });
        // console.log('✅ Attempt 1 Response:', response.data);
      } catch (err: any) {
        console.log('❌ Attempt 1 failed:', err.response?.status, err.response?.data?.message);
        
        // STRATEGY 2: Try with userId
        try {
          console.log('🔄 Attempt 2: Fetching with userId...');
          response = await axios.get(API_URL, {
            ...getAuthConfig(),
            params: {
              userId,
              limit: 1000
            }
          });
          // console.log('✅ Attempt 2 Response:', response.data);
        } catch (err2: any) {
          console.log('❌ Attempt 2 failed:', err2.response?.status, err2.response?.data?.message);
          throw err2; // Re-throw to be caught by outer catch
        }
      }

      // EXTRACT CATEGORIES FROM RESPONSE - Handle multiple response structures
      if (!response) {
        throw new Error('No response from API');
      }

      console.log('📊 Response structure:', {
        hasSuccess: 'success' in response.data,
        hasData: 'data' in response.data,
        hasCategories: 'categories' in response.data,
        isArray: Array.isArray(response.data),
        dataIsArray: Array.isArray(response.data.data),
        keys: Object.keys(response.data)
      });

      // Try different response structures
      if (response.data.success && Array.isArray(response.data.data)) {
        // Structure: { success: true, data: [...] }
        categoriesData = response.data.data;
        // console.log('📦 Extracted from response.data.data');
      } else if (Array.isArray(response.data.data)) {
        // Structure: { data: [...] }
        categoriesData = response.data.data;
        // console.log('📦 Extracted from response.data.data (no success field)');
      } else if (Array.isArray(response.data.categories)) {
        // Structure: { categories: [...] }
        categoriesData = response.data.categories;
        // console.log('📦 Extracted from response.data.categories');
      } else if (Array.isArray(response.data)) {
        // Structure: [...]
        categoriesData = response.data;
        // console.log('📦 Extracted from response.data (direct array)');
      } else if (response.data.success && response.data.data && typeof response.data.data === 'object') {
        // Structure: { success: true, data: { categories: [...] } }
        if (Array.isArray(response.data.data.categories)) {
          categoriesData = response.data.data.categories;
          // console.log('📦 Extracted from response.data.data.categories');
        }
      }

      // Filter out invalid/deleted categories
      categoriesData = categoriesData.filter((cat: any) => {
        return cat && 
               cat._id && 
               cat.categoryName && 
               cat.isDeleted !== true;
      });

      // console.log('📦 Valid categories count:', categoriesData.length);
      // console.log('📦 Sample category:', categoriesData[0]);
      // console.log('📦 All category names:', categoriesData.map(c => c.categoryName));
      
      if (categoriesData.length === 0) {
        // console.warn('⚠️ No categories found! Check your database and API.');
        // console.warn('⚠️ Full response:', JSON.stringify(response.data, null, 2));
      }

      setCategories(categoriesData);

      return { 
        success: true, 
        data: categoriesData,
        count: categoriesData.length
      };
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err);
      
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch categories';
      setError(errorMessage);
      
      // Set empty array on error
      setCategories([]);
      
      return { 
        success: false, 
        error: errorMessage,
        status: err.response?.status
      };
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - stable function

  /**
   * Calculate levels based on parentId relationships
   */
  const calculateLevel = useCallback((category: DatabaseCategory, allCategories: DatabaseCategory[]): number => {
    if (!category.parentId) return 1;
    
    let level = 1;
    let currentParentId = category.parentId;
    const visitedIds = new Set<string>([category._id]); // Prevent circular references
    
    while (currentParentId && !visitedIds.has(currentParentId)) {
      const parent = allCategories.find(c => c._id === currentParentId);
      if (!parent) break;
      
      level++;
      visitedIds.add(currentParentId);
      currentParentId = parent.parentId;
      
      if (level > 10) break; // Safety limit
    }
    
    return level;
  }, []);

  /**
   * Get categories with calculated levels
   */
  const categoriesWithLevels = useMemo(() => {
    // console.log('🔄 Computing categoriesWithLevels, count:', categories.length);
    
    const result = categories.map(category => ({
      ...category,
      name: category.categoryName,
      level: calculateLevel(category, categories)
    }));
    
    // console.log('✅ Categories with levels:', result.length);
    return result;
  }, [categories, calculateLevel]);

  /**
   * Get root categories (no parentId)
   */
  const rootCategories = useMemo(() => {
    const roots = categories.filter(cat => !cat.parentId);
    // console.log('🌲 Root categories:', roots.length);
    return roots;
  }, [categories]);

  /**
   * Get child categories by parent ID
   */
  const getChildCategories = useCallback(
  (parentId?: string): DatabaseCategory[] => {
    if (!parentId) return [];
    return categories.filter(cat => cat.parentId === parentId);
  },
  [categories]
);

  /**
   * Get all descendants of a category (recursive)
   */
  const getDescendants = useCallback((parentId: any): DatabaseCategory[] => {
    const descendants: DatabaseCategory[] = [];
    const visited = new Set<string>();
    
    const findChildren = (pid: string) => {
      if (visited.has(pid)) return;
      visited.add(pid);
      
      const children = categories.filter(cat => cat.parentId === pid);
      children.forEach(child => {
        descendants.push(child);
        findChildren(child._id);
      });
    };
    
    findChildren(parentId);
    return descendants;
  }, [categories]);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback((id: string): DatabaseCategory | undefined => {
    return categories.find(cat => cat._id === id);
  }, [categories]);

  /**
   * Get category path (breadcrumb)
   */
  const getCategoryPath = useCallback((categoryId: string): DatabaseCategory[] => {
    const path: DatabaseCategory[] = [];
    const visited = new Set<string>();
    let currentCategory = getCategoryById(categoryId);

    while (currentCategory && !visited.has(currentCategory._id)) {
      path.unshift(currentCategory);
      visited.add(currentCategory._id);
      
      if (currentCategory.parentId) {
        currentCategory = getCategoryById(currentCategory.parentId);
      } else {
        break;
      }
      
      if (path.length > 10) break; // Safety limit
    }

    return path;
  }, [getCategoryById, categories]);

  /**
   * Build category tree structure
   */
  const categoryTree = useMemo(() => {
    
    if (categories.length === 0) {
      // console.warn('⚠️ No categories to build tree from');
      return [];
    }

    const tree: any[] = [];
    const categoryMap = new Map<string, any>();

    // Create map of all categories with calculated levels
    categoriesWithLevels.forEach(category => {
      categoryMap.set(category._id, {
        ...category,
        children: [],
        name: category.categoryName,
        id: category._id
      });
    });

    // console.log('📦 Category map size:', categoryMap.size);

    // Build tree
    categoriesWithLevels.forEach(category => {
      const node = categoryMap.get(category._id);
      if (!node) return;

      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
          parent.children.sort((a: any, b: any) => 
            a.categoryName.localeCompare(b.categoryName)
          );
        }
      } else {
        tree.push(node);
      }
    });

    // Sort root categories alphabetically
    tree.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    
    // console.log('🌲 Tree built with', tree.length, 'root nodes');
    // console.log('🌲 Tree structure:', tree.map(t => ({ name: t.name, children: t.children.length })));
    
    return tree;
  }, [categoriesWithLevels, categories.length]);

  /**
   * Create category map for quick lookups
   */
  const categoryMap = useMemo(() => {
    const map = new Map<string, DatabaseCategory>();
    categories.forEach(cat => map.set(cat._id, cat));
    return map;
  }, [categories]);

  /**
   * Get categories grouped by calculated level
   */
  const categoriesByCalculatedLevel = useMemo(() => {
    const grouped: Record<number, DatabaseCategory[]> = {};
    
    categoriesWithLevels.forEach(category => {
      const level = category.level || 1;
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(category);
    });
    
    return grouped;
  }, [categoriesWithLevels]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      // console.log('🚀 Auto-fetching categories on mount');
      fetchCategoriesData();
    }
  }, [autoFetch, fetchCategoriesData]);

  return {
    // Data
    categories,
    categoriesWithLevels,
    rootCategories,
    categoryTree,
    categoryMap,
    categoriesByCalculatedLevel,
    loading,
    error,

    // Methods
    fetchCategories: fetchCategoriesData,
    getChildCategories,
    getDescendants,
    getCategoryById,
    getCategoryPath,
    calculateLevel,
    refetch: fetchCategoriesData
  };
};

// ✅ Export standalone fetch function
export const fetchCategories = async (
  page = 1,
  limit = 1000,
  search = ""
): Promise<any> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id || user.userId;
  
  // console.log('🔍 fetchCategories - User ID:', userId);
  // console.log('🔍 fetchCategories - Params:', { page, limit, search });
  
  try {
    const response = await axios.get(API_URL, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit,
        search: search || undefined,
        isActive: true
      }
    });
    
    // console.log('🔍 fetchCategories - Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('🔍 fetchCategories - Error:', error.response?.data || error.message);
    throw error;
  }
};

// Other CRUD functions remain the same...
export const createCategory = async (
  payload: Partial<DatabaseCategory>
): Promise<DatabaseCategory> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await axios.post(API_URL, payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

export const updateCategory = async (
  id: string,
  payload: Partial<DatabaseCategory>
): Promise<DatabaseCategory> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await axios.put(`${API_URL}/${id}`, payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

export const deleteCategory = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    }
  });
  return res.data;
};