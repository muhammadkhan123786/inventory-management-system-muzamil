// hooks/useProducts.ts
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { transformProductsResponse, transformProduct } from "../lib/productTransformer";
import { ProductListItem } from "@/app/dashboard/(inventory-dashboard)/product/types/product";
import { useProductFilters } from "./useProductFilters";

interface Statistics {
  total: number;
  activeCount: number;
  inactiveCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  featuredCount: number;
}

interface UseProductsOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
  categories?: any;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`;

const getAuthConfig = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { headers: { Authorization: `Bearer ${token}` } };
};

const getUserId = () => {
  if (typeof window === "undefined") return "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id;
};

export const useProducts = (options: UseProductsOptions = {}) => {
  const { autoFetch = true, initialPage = 1, initialLimit = 10, categories = [] } = options;

  const [products, setProducts]         = useState<ProductListItem[]>([]);
  const [statistics, setStatistics]     = useState<Statistics | null>(null);
  const [pagination, setPagination]     = useState({
    total: 0, activeCount: 0, inactiveCount: 0,
    page: initialPage, limit: initialLimit, totalPages: 0,
  });

  // ✅ TWO loading states:
  //    `initialLoading` — first load only → shows skeleton cards
  //    `filtering`      — subsequent filter changes → shows subtle overlay, keeps old data visible
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const isFirstFetch   = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  const filters = useProductFilters({ categories });

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    // ✅ First load → full skeleton. Subsequent → silent background refresh
    if (isFirstFetch.current) {
      setInitialLoading(true);
    } else {
      setFiltering(true);  // keeps current products visible, just dims them
    }
    setError(null);

    try {
      const qs = filters.toQueryString(filters.queryParams);
      const extraParams = new URLSearchParams(qs);
      extraParams.set("userId", getUserId());
      extraParams.set("includeStats", "true");

      const response = await axios.get(`${API_URL}?${extraParams.toString()}`, {
        ...getAuthConfig(),
        signal: abortController.current.signal,
      });

      if (!response.data.success) throw new Error(response.data.message || "Failed to fetch products");

      const transformed = transformProductsResponse(response.data);
      setProducts(transformed as ProductListItem[]);
      setStatistics(response.data.statistics || null);
      setPagination({
        total:         response.data.total         || 0,
        activeCount:   response.data.activeCount   || 0,
        inactiveCount: response.data.inactiveCount || 0,
        page:          response.data.page          || filters.queryParams.page,
        limit:         response.data.limit         || filters.queryParams.limit,
        totalPages:    response.data.totalPages    || 0,
      });

      return { success: true, data: transformed };
    } catch (err: any) {
      if (axios.isCancel(err)) return { success: true, data: [] }; // cancelled — ignore
      const msg = err.response?.data?.message || err.message || "An error occurred";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setInitialLoading(false);
      setFiltering(false);
      isFirstFetch.current = false;
    }
  }, [filters.queryParams, filters.toQueryString]);

  useEffect(() => {
    if (autoFetch) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.queryParams]);

  // ── CRUD ────────────────────────────────────────────────────────────────
  const createProduct = useCallback(async (productData: any) => {
    try {
      const response = await axios.post(API_URL, productData, getAuthConfig());
      if (!response.data.success) throw new Error(response.data.message);
      await fetchProducts();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, productData: any) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, productData, getAuthConfig());
      if (!response.data.success) throw new Error(response.data.message);
      const transformed = transformProduct(response.data.data);
      setProducts(prev => prev.map(p => p.id === id ? transformed as ProductListItem : p));
      return { success: true, data: transformed };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      if (!response.data.success) throw new Error(response.data.message);
      setProducts(prev => prev.filter(p => p.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  const getProductById = useCallback(async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        ...getAuthConfig(),
        params: { populate: "categoryId" },
      });
      if (!response.data.success) throw new Error(response.data.message);
      return { success: true, data: transformProduct(response.data.data) };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  return {
    products,
    initialLoading,   // ← use this for skeleton on first load
    filtering,        // ← use this for subtle overlay on filter change
    error,
    statistics,
    pagination,

    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refetch: fetchProducts,

    searchTerm:              filters.searchTerm,
    selectedCategory:        filters.selectedCategory,
    selectedStatus:          filters.selectedStatus,
    selectedStockStatus:     filters.selectedStockStatus,
    showFeaturedOnly:        filters.showFeaturedOnly,
    page:                    filters.page,
    limit:                   filters.limit,
    sortBy:                  filters.sortBy,
    sortOrder:               filters.sortOrder,
    hasActiveFilters:        filters.hasActiveFilters,
    categoryOptions:         filters.categoryOptions,

    handleSearchChange:      filters.handleSearchChange,
    handleCategoryChange:    filters.handleCategoryChange,
    handleStatusChange:      filters.handleStatusChange,
    handleStockStatusChange: filters.handleStockStatusChange,
    handleFeaturedToggle:    filters.handleFeaturedToggle,
    handlePageChange:        filters.handlePageChange,
    handleSortChange:        filters.handleSortChange,
    resetFilters:            filters.resetFilters,
  };
};