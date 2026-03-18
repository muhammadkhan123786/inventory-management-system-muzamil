// hooks/useProductFilters.ts
"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

export interface ProductFilterParams {
  search: string;
  categoryId: string;
  status: string;
  stockStatus: string;
  featured: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface UseProductFiltersProps {
  categories?: any;
  searchDebounceMs?: number;   // default 400ms
}

export const useProductFilters = ({
  categories = [],
  searchDebounceMs = 400,
}: UseProductFiltersProps = {}) => {

  const [searchTerm, setSearchTerm]           = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ← what actually hits the API
  const [selectedCategory, setSelectedCategory]     = useState("all");
  const [selectedStatus, setSelectedStatus]         = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly]     = useState(false);
  const [page, setPage]         = useState(1);
  const [limit]                 = useState(20);
  const [sortBy, setSortBy]     = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ✅ Debounce search — only updates `debouncedSearch` after user stops typing
  const debounceTimer = useRef<NodeJS.Timeout | any>( null );
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, searchDebounceMs);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, searchDebounceMs]);

  // queryParams uses `debouncedSearch` — so API only fires after debounce
  const queryParams = useMemo((): ProductFilterParams => ({
    search:      debouncedSearch,   // ← debounced, not raw
    categoryId:  selectedCategory,
    status:      selectedStatus,
    stockStatus: selectedStockStatus,
    featured:    showFeaturedOnly,
    page,
    limit,
    sortBy,
    sortOrder,
  }), [
    debouncedSearch, selectedCategory, selectedStatus,
    selectedStockStatus, showFeaturedOnly, page, limit, sortBy, sortOrder,
  ]);

  const toQueryString = useCallback((params: ProductFilterParams): string => {
    const p = new URLSearchParams();
    if (params.search)                p.set("search",      params.search);
    if (params.categoryId !== "all")  p.set("categoryId",  params.categoryId);
    if (params.status !== "all")      p.set("status",      params.status);
    if (params.stockStatus !== "all") p.set("stockStatus", params.stockStatus);
    if (params.featured)              p.set("featured",    "true");
    p.set("page",      String(params.page));
    p.set("limit",     String(params.limit));
    p.set("sortBy",    params.sortBy);
    p.set("sortOrder", params.sortOrder);
    return p.toString();
  }, []);

  const buildCategoryOptions = useCallback(() => {
    const options: { value: string; label: string; level: number }[] = [
      { value: "all", label: "All Categories", level: 0 },
    ];
    const addWithChildren = (cat: any, level: number = 1) => {
      const prefix = "─".repeat(level - 1) + (level > 1 ? " " : "");
      options.push({ value: cat._id, label: `${prefix}${cat.categoryName}`, level });
      categories.filter((c: any) => c.parentId === cat._id).forEach((child: any) => addWithChildren(child, level + 1));
    };
    categories.filter((c: any) => !c.parentId).forEach((root: any) => addWithChildren(root, 1));
    return options;
  }, [categories]);

  // ✅ Search handler just updates raw term — debounce effect handles the rest
  const handleSearchChange      = useCallback((v: string) => setSearchTerm(v), []);
  const handleCategoryChange    = useCallback((v: string) => { setSelectedCategory(v);     setPage(1); }, []);
  const handleStatusChange      = useCallback((v: string) => { setSelectedStatus(v);       setPage(1); }, []);
  const handleStockStatusChange = useCallback((v: string) => { setSelectedStockStatus(v);  setPage(1); }, []);
  const handleFeaturedToggle    = useCallback(() => { setShowFeaturedOnly(p => !p);         setPage(1); }, []);
  const handlePageChange        = useCallback((n: number) => setPage(n), []);
  const handleSortChange        = useCallback((field: string, order: "asc" | "desc") => {
    setSortBy(field); setSortOrder(order); setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedStockStatus("all");
    setShowFeaturedOnly(false);
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() =>
    searchTerm !== "" || selectedCategory !== "all" || selectedStatus !== "all" ||
    selectedStockStatus !== "all" || showFeaturedOnly,
    [searchTerm, selectedCategory, selectedStatus, selectedStockStatus, showFeaturedOnly]
  );

  return {
    searchTerm,           // raw value — bind to input so it feels instant
    debouncedSearch,      // actual value sent to API
    selectedCategory, selectedStatus, selectedStockStatus, showFeaturedOnly,
    page, limit, sortBy, sortOrder,
    queryParams, toQueryString,
    categoryOptions: buildCategoryOptions(),
    handleSearchChange, handleCategoryChange, handleStatusChange,
    handleStockStatusChange, handleFeaturedToggle, handlePageChange,
    handleSortChange, resetFilters, hasActiveFilters,
  };
};