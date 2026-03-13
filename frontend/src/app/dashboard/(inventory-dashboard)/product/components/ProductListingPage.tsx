"use client";
import { useState, useMemo, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { ProductListing } from "../Product/ProductListing";
import { ProductTableView } from "../Product/ProductTableView";
import ProductDetailsModal from "../Product/ProductDetailsModal";
// import MarketplaceDistributionTab from "./MarketplaceDistributionTab";
import { useProducts } from "../../../../../hooks/useProduct";
import { useCategories } from "../../../../../hooks/useCategory";
import { Product, ProductListItem } from "../types/product";
import { toast } from "sonner";
import { TabNavigation } from "./TabNavigation";
import { PageHeader } from "./PageHeader";
import { Pagination } from "./Pagination";
import { NoProductsMessage } from "./NoProductsMessage";
import { AnimatedBackground } from "./AnimatedBackground";
import { CategoryFilters } from "../Product/CategoryFilters";
import { ProductStatistics } from "../Product/ProductStats";
import { enrichProductCategories, transformProduct } from "@/lib/productTransformer";
import { ProductQuickEditDialog } from "../Product/EditProductDialog";

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 animate-pulse">
    <div className="h-40 bg-gray-100 rounded-lg" />
    <div className="h-4 bg-gray-100 rounded w-3/4" />
    <div className="h-3 bg-gray-100 rounded w-1/2" />
    <div className="flex gap-2 pt-1">
      <div className="h-6 bg-gray-100 rounded-full w-16" />
      <div className="h-6 bg-gray-100 rounded-full w-16" />
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-xl h-20 bg-gray-100 animate-pulse" />
    ))}
  </div>
);

const SkeletonGrid = () => (
  <>
    <SkeletonStats />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductListingPage() {

  const [activeTab, setActiveTab]               = useState<"products" | "distribution">("products");
  const [viewMode, setViewMode]                 = useState<"grid" | "table">("grid");
  const [selectedProduct, setSelectedProduct]   = useState<ProductListItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // ── Categories ──────────────────────────────────────────────────────────────
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } =
    useCategories({ autoFetch: true });

  // ── Products + filters + statistics ────────────────────────────────────────
  const {
    products,
    initialLoading,
    filtering,
    error: productsError,
    statistics,          // ← comes from backend aggregation now
    pagination,
    updateProduct,
    deleteProduct,
    getProductById,
    refetch: refetchProducts,
    searchTerm, selectedCategory, selectedStatus, selectedStockStatus,
    showFeaturedOnly, hasActiveFilters, categoryOptions,
    handleSearchChange, handleCategoryChange, handleStatusChange,
    handleStockStatusChange, handleFeaturedToggle, handlePageChange, resetFilters,
  } = useProducts({ autoFetch: true, initialLimit: 12, categories });

  const categoryMap = useMemo(() => {
    const map: Record<string, any> = {};
    categories.forEach((c: any) => { map[c.id || c._id] = c; });
    return map;
  }, [categories]);

  const getStockBadge = (status: string) => {
    const v: Record<string, { class: string; icon: any }> = {
      "in-stock":     { class: "bg-gradient-to-r from-emerald-500 to-green-500 text-white", icon: CheckCircle },
      "low-stock":    { class: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",  icon: AlertCircle },
      "out-of-stock": { class: "bg-gradient-to-r from-rose-500 to-red-600 text-white",      icon: AlertCircle },
    };
    return v[status] || v["in-stock"];
  };

  // ✅ stats come entirely from backend — no frontend counting
  //    statistics updates automatically when filters change
  const stats = useMemo(() => ({
    total:           statistics?.total           ?? 0,
    activeCount:     statistics?.activeCount     ?? 0,
    inactiveCount:   statistics?.inactiveCount   ?? 0,
    inStockCount:    statistics?.inStockCount    ?? 0,
    lowStockCount:   statistics?.lowStockCount   ?? 0,
    outOfStockCount: statistics?.outOfStockCount ?? 0,
    featuredCount:   statistics?.featuredCount   ?? 0,
  }), [statistics]);


  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleViewProduct = async (product: Product) => {
    const result = await getProductById(product.id);
    if (result.success && result.data) {
      const raw = (result.data as any).data || result.data;
     
      const transformed = transformProduct(raw);
     
      if (transformed?.categories) {
        setSelectedProduct(raw);
        setIsViewDialogOpen(true);
      }
    } else {
      toast.error("Failed to load product details");
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedProduct: ProductListItem) => {
    const result = await updateProduct(updatedProduct.id, updatedProduct);
    if (result.success) {
      toast.success("Product updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } else {
      toast.error(result.error || "Failed to update product");
    }
  };

  const handleConfirmDelete = async (productId: string, productName: string) => {
    console.log("productID", productId)
    const result = await deleteProduct(productId);
    if (result.success) {
      toast.success(`${productName} deleted successfully!`);
      setIsViewDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to delete product");
    }
  };

  const handleRefresh = () => {
    refetchProducts();
    refetchCategories();
    toast.success("Refreshed!");
  };

  useEffect(() => {
    if (productsError)   toast.error(productsError);
    if (categoriesError) toast.error(categoriesError);
  }, [productsError, categoriesError]);

  // ── Render ──────────────────────────────────────────────────────────────
  const renderProductsContent = () => {

    // First-ever load → show skeletons
    if (initialLoading || categoriesLoading) return <SkeletonGrid />;

    return (
      <>
        {/* ✅ Stats always visible — backend keeps them accurate across all pages */}
        <ProductStatistics stats={stats} />

        <CategoryFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedStockStatus={selectedStockStatus}
          showFeaturedOnly={showFeaturedOnly}
          categories={categories}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onStockStatusChange={handleStockStatusChange}
          onFeaturedToggle={handleFeaturedToggle}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          filterStats={{ total: pagination.total, filtered: products.length }}
        />

        {/* Product grid with overlay while filtering */}
        <div className="relative">
          {filtering && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] rounded-xl
                            flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Updating results…
              </div>
            </div>
          )}

          {products.length === 0 && !filtering ? (
            <NoProductsMessage hasActiveFilters={hasActiveFilters} onResetFilters={resetFilters} />
          ) : viewMode === "grid" ? (
            <ProductListing
              products={products}
              hasActiveFilters={hasActiveFilters}
              onViewProduct={handleViewProduct}
              onEditProduct={handleEditProduct}
              onResetFilters={resetFilters}
            />
          ) : (
            <ProductTableView
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={(p) => handleConfirmDelete(p.id, p.name)}
              getStockBadge={getStockBadge}
            />
          )}
        </div>

        {pagination.total > pagination.limit && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={() => {}}
          />
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 relative">
      <AnimatedBackground />
      <PageHeader
        activeTab={activeTab}
        viewMode={viewMode}
        isLoading={initialLoading}
        onRefresh={handleRefresh}
        onViewModeChange={setViewMode}
      />
      {/* <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} /> */}

      {/* {activeTab === "products" ? (
        <div className="space-y-6">{renderProductsContent()}</div>
      ) : (
        <MarketplaceDistributionTab
          products={products.map(p => ({ ...p, attributes: p.attributes || [] }))}
        />
      )} */}
   
        <div className="space-y-6">{renderProductsContent()}</div>
      

      {selectedProduct && (
        <>
          <ProductDetailsModal
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            product={selectedProduct}
            getStockBadge={getStockBadge}
            onDelete={() => handleConfirmDelete(selectedProduct.id, selectedProduct.name)}
          />
          <ProductQuickEditDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            product={selectedProduct}
            onSave={handleSaveEdit}
          />
        </>
      )}
    </div>
  );
}