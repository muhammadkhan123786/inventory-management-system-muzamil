// // hooks/useMarketplaceDistribution.ts
// import { useState, useMemo, useCallback, useEffect } from 'react';
// import { Product, Marketplace, MarketplacePrice } from '@/app/dashboard/inventory-dashboard/product/types/product';
// import { MARKETPLACE_ICONS, MARKETPLACE_COLORS } from '@/app/dashboard/inventory-dashboard/product/constants/marketplace.constants';
// import {
//   ShoppingCart, Store, Smartphone,
//   type LucideIcon,
// } from 'lucide-react';

// import {
//   distributeProduct,
//   getMarketplaceConnections,
//   type DistributionResult,
// } from '../services/marketplace-distribution.api';

// // ── Types ─────────────────────────────────────────────────────────────────────

// export interface AvailableMarketplace {
//   id: string;           // MarketplaceConnection._id (from backend)
//   type: string;         // 'ebay' | 'shopify' | 'amazon' | ...
//   displayName: string;
//   icon: LucideIcon;
//   bgColor: string;
//   textColor: string;
//   badgeBg: string;
// }

// /** quantities[productId][connectionId] = number */
// export type QuantityMap = Record<string, Record<string, number>>;

// export interface DistributeState {
//   isDistributing: boolean;
//   lastResults: DistributionResult[] | null;
//   error: string | null;
// }

// // Per-product distribution status for UI feedback
// export type ProductDistributeStatus = {
//   status: 'idle' | 'loading' | 'success' | 'partial' | 'error';
//   results: DistributionResult[];
// };

// // ── Icon / Style Map ──────────────────────────────────────────────────────────

// const MARKETPLACE_STYLES: Record<
//   string,
//   { icon: LucideIcon; bgColor: string; textColor: string; badgeBg: string; displayName: string }
// > = {
//   ebay: {
//     displayName: 'eBay',
//     icon: ShoppingCart,
//     bgColor: 'bg-gradient-to-br from-yellow-500 to-amber-500',
//     textColor: 'text-yellow-700',
//     badgeBg: 'bg-yellow-100',
//   },
//   amazon: {
//     displayName: 'Amazon',
//     icon: ShoppingCart,
//     bgColor: 'bg-gradient-to-br from-orange-500 to-amber-600',
//     textColor: 'text-orange-700',
//     badgeBg: 'bg-orange-100',
//   },
//   etsy: {
//     displayName: 'Etsy',
//     icon: Store,
//     bgColor: 'bg-gradient-to-br from-orange-400 to-red-500',
//     textColor: 'text-red-700',
//     badgeBg: 'bg-red-100',
//   },
//   shopify: {
//     displayName: 'Shopify',
//     icon: Store,
//     bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
//     textColor: 'text-green-700',
//     badgeBg: 'bg-green-100',
//   },
//   tiktok: {
//     displayName: 'TikTok Shop',
//     icon: Smartphone,
//     bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
//     textColor: 'text-pink-700',
//     badgeBg: 'bg-pink-100',
//   },
//   woocommerce: {
//     displayName: 'WooCommerce',
//     icon: Store,
//     bgColor: 'bg-gradient-to-br from-purple-500 to-indigo-500',
//     textColor: 'text-purple-700',
//     badgeBg: 'bg-purple-100',
//   },
// };

// const DEFAULT_STYLE = {
//   displayName: 'Marketplace',
//   icon: Store,
//   bgColor: 'bg-gradient-to-br from-gray-500 to-slate-500',
//   textColor: 'text-gray-700',
//   badgeBg: 'bg-gray-100',
// };

// // ── Hook ──────────────────────────────────────────────────────────────────────
// const getUserId = () => {
//   if (typeof window === "undefined") return "";
//   try {
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     return user.id || user._id || "";
//   } catch {
//     return "";
//   }
// };

// export function useDynamicMarketplace(products: Product[]) {
//   const userId = getUserId();
  
// // ── Marketplace connections (fetched from backend) ────────────────────────
// const [connections, setConnections] = useState<
//   Array<{ _id: string; type: string; name: string; status: string }>
// >([]);
// const [connectionsLoading, setConnectionsLoading] = useState(true);

// // ✅ FIXED: Only fetch connections, don't update other state here
// useEffect(() => {
//   if (!userId) {
//     setConnectionsLoading(false);
//     return;
//   }
  
//   let isMounted = true; // Prevent state updates if component unmounts
  
//   getMarketplaceConnections(userId)
//     .then((res) => {
//       if (isMounted) {
//         const connected = res.data.filter((c) => c.status === 'connected');
//         setConnections(connected);
//         setConnectionsLoading(false);
//       }
//     })
//     .catch((err) => {
//       if (isMounted) {
//         console.error('Failed to load marketplace connections:', err);
//         setConnections([]);
//         setConnectionsLoading(false);
//       }
//     });

//   return () => {
//     isMounted = false;
//   };
// }, [userId]); // Only depend on userId

// // ✅ FIXED: Use useMemo instead of useEffect for derived state
// const availableMarketplaces = useMemo<AvailableMarketplace[]>(() => {
//   // This runs during render, not after - no cascade!
//   const connectedTypes = new Set(connections.map(c => c.type.toLowerCase()));
  
//   const marketplaceIdsInProducts = new Set<string>();
//   const marketplaceTypesInProducts = new Set<string>();
  
//   products.forEach(product => {
//     product.attributes?.forEach(attr => {
//       attr.pricing?.forEach(price => {
//         if (price.marketplaceId) marketplaceIdsInProducts.add(price.marketplaceId);
//         if (price.marketplaceName) marketplaceTypesInProducts.add(price.marketplaceName.toLowerCase());
//       });
//     });
//   });

//   const hasPricingData = marketplaceIdsInProducts.size > 0 || marketplaceTypesInProducts.size > 0;
  
//   return connections
//     .filter(conn => {
//       if (!hasPricingData) return true; // Show all connected if no pricing
//       return marketplaceIdsInProducts.has(conn._id) || 
//              marketplaceTypesInProducts.has(conn.type.toLowerCase());
//     })
//     .map((conn) => {
//       const style = MARKETPLACE_STYLES[conn.type.toLowerCase()] ?? DEFAULT_STYLE;
//       return {
//         id: conn._id,
//         type: conn.type,
//         displayName: style.displayName,
//         icon: style.icon,
//         bgColor: style.bgColor,
//         textColor: style.textColor,
//         badgeBg: style.badgeBg,
//       };
//     });
// }, [connections, products]); // ✅ Dependencies are correct

// // ✅ FIXED: Derive quantities from connections and products without effects
// const quantities = useMemo<QuantityMap>(() => {
//   const initial: QuantityMap = {};
  
//   products.forEach((p) => {
//     initial[p.id] = {};
    
//     // Only initialize if we have connections
//     if (connections.length > 0) {
//       p.attributes?.forEach(attr => {
//         attr.pricing?.forEach(price => {
//           const matchingConn = connections.find(c => 
//             c._id === price.marketplaceId || 
//             c.type.toLowerCase() === price.marketplaceName?.toLowerCase()
//           );
          
//           if (matchingConn) {
//             initial[p.id][matchingConn._id] = attr.stock?.stockQuantity || p.stockQuantity || 0;
//           }
//         });
//       });
//     }
//   });
  
//   return initial;
// }, [connections, products]);

// // ✅ Removed useEffect that was calling setState - quantities is now derived

//   // ── Per-product distribution status ───────────────────────────────────────
//   const [distributeStatus, setDistributeStatus] = useState<
//     Record<string, ProductDistributeStatus>
//   >({});

//   // ── Filters ───────────────────────────────────────────────────────────────
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedMarketplace, setSelectedMarketplace] = useState('all');
//   const [stockStatus, setStockStatus] = useState('all');
//   const [priceRange, setPriceRange] = useState({ min: 0, max: 999999 });

//   // ── Derived: categories ───────────────────────────────────────────────────
//   const categories = useMemo(() => {
//     const names = new Set(
//       products
//         .map((p) => p.primaryCategory?.name)
//         .filter((n): n is string => Boolean(n))
//     );
//     return Array.from(names);
//   }, [products]);

//   // ── Derived: filtered products ────────────────────────────────────────────
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch =
//         !searchTerm ||
//         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         product.sku.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesCategory =
//         selectedCategory === 'all' ||
//         product.primaryCategory?.name === selectedCategory;

//       const matchesMarketplace =
//         selectedMarketplace === 'all' ||
//         ((quantities[product.id]?.[selectedMarketplace] ?? 0) > 0);

//       const matchesStock =
//         stockStatus === 'all' ||
//         (stockStatus === 'in-stock'    && product.stockQuantity > 0) ||
//         (stockStatus === 'low-stock'   && product.stockQuantity > 0 && product.stockQuantity < 10) ||
//         (stockStatus === 'out-of-stock' && product.stockQuantity === 0);

//       const matchesPrice =
//         product.price >= priceRange.min && product.price <= priceRange.max;

//       return (
//         matchesSearch &&
//         matchesCategory &&
//         matchesMarketplace &&
//         matchesStock &&
//         matchesPrice
//       );
//     });
//   }, [products, quantities, searchTerm, selectedCategory, selectedMarketplace, stockStatus, priceRange]);

//   // ── Derived: marketplace totals ───────────────────────────────────────────
//   const marketplaceTotals = useMemo(() => {
//     const totals: Record<string, number> = {};
//     let grandTotal = 0;

//     availableMarketplaces.forEach((mp) => {
//       const total = Object.values(quantities).reduce(
//         (sum, productQtys) => sum + (productQtys[mp.id] ?? 0),
//         0
//       );
//       totals[mp.id] = total;
//       grandTotal += total;
//     });

//     return { totals, grandTotal };
//   }, [quantities, availableMarketplaces]);

//   // ── Helpers ───────────────────────────────────────────────────────────────

//   const getProductMarketplacePrices = useCallback(
//     (productId: string) => {
//       const product = products.find((p) => p.id === productId);
//       if (!product) return {};

//       const priceMap: Record<string, {
//         sellingPrice: number;
//         retailPrice?: number;
//         costPrice?: number;
//       }> = {};

//       product.attributes?.forEach((attr) => {
//         attr.pricing?.forEach((price) => {
//           // Find matching connection by ID or type
//           const connection = connections.find(
//             (c) =>
//               c._id === price.marketplaceId ||
//               c.type.toLowerCase() === price.marketplaceName?.toLowerCase()
//           );
          
//           if (connection) {
//             priceMap[connection._id] = {
//               sellingPrice: price.sellingPrice,
//               retailPrice: price.retailPrice,
//               costPrice: price.costPrice,
//             };
//           }
//         });
//       });

//       return priceMap;
//     },
//     [products, connections]
//   );

//   // ── Actions ───────────────────────────────────────────────────────────────

//   // ✅ Store manual quantity adjustments separately
//   const [quantityOverrides, setQuantityOverrides] = useState<QuantityMap>({});

//   const updateQuantity = useCallback(
//     (productId: string, connectionId: string, change: number) => {
//       setQuantityOverrides((prev) => {
//         const current = prev[productId]?.[connectionId] ?? quantities[productId]?.[connectionId] ?? 0;
//         const next = Math.max(0, current + change);
//         return {
//           ...prev,
//           [productId]: {
//             ...prev[productId],
//             [connectionId]: next,
//           },
//         };
//       });
//     },
//     [quantities]
//   );

//   // Merge base quantities with overrides
//   const finalQuantities = useMemo<QuantityMap>(() => {
//     const merged: QuantityMap = { ...quantities };
//     Object.entries(quantityOverrides).forEach(([productId, overrides]) => {
//       merged[productId] = { ...(merged[productId] || {}), ...overrides };
//     });
//     return merged;
//   }, [quantities, quantityOverrides]);

//   const equallyDistribute = useCallback(
//     (productId: string) => {
//       if (!availableMarketplaces.length) return;

//       setQuantityOverrides((prev) => {
//         const currentQtys = finalQuantities[productId] ?? {};
//         const total = Object.values(currentQtys).reduce(
//           (sum, qty) => sum + qty,
//           0
//         );
//         const per = Math.floor(total / availableMarketplaces.length);
//         const remainder = total % availableMarketplaces.length;

//         const newQtys: Record<string, number> = {};
//         availableMarketplaces.forEach((mp, i) => {
//           newQtys[mp.id] = per + (i < remainder ? 1 : 0);
//         });

//         return { ...prev, [productId]: newQtys };
//       });
//     },
//     [availableMarketplaces, finalQuantities]
//   );

//   /**
//    * Calls backend to actually list the product on all marketplaces
//    * where qty > 0. Shows loading/success/error per product.
//    */
//   const distribute = useCallback(
//     async (productId: string) => {
//       const product = products.find((p) => p.id === productId);
//       if (!product) return;

//       const productQtys = finalQuantities[productId] ?? {};

//       // Build distribution entries — skip zeros
//       const distributions = Object.entries(productQtys)
//         .filter(([, qty]) => qty > 0)
//         .map(([connectionId, quantity]) => ({ connectionId, quantity }));

//       if (!distributions.length) return;

//       // Mark as loading
//       setDistributeStatus((prev) => ({
//         ...prev,
//         [productId]: { status: 'loading', results: [] },
//       }));

//       try {
//         const response = await distributeProduct({
//           productId,
//           userId,
//           distributions,
//           productData: product,
//         });

//         const results = response.data.results;
//         const allOk  = results.every((r) => r.success);
//         const anyOk  = results.some((r) => r.success);

//         setDistributeStatus((prev) => ({
//           ...prev,
//           [productId]: {
//             status: allOk ? 'success' : anyOk ? 'partial' : 'error',
//             results,
//           },
//         }));
//       } catch (err: any) {
//         setDistributeStatus((prev) => ({
//           ...prev,
//           [productId]: {
//             status: 'error',
//             results: [],
//           },
//         }));
//         console.error('Distribution failed:', err.message);
//       }
//     },
//     [products, finalQuantities, userId]
//   );

//   const clearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedCategory('all');
//     setSelectedMarketplace('all');
//     setStockStatus('all');
//     setPriceRange({ min: 0, max: 999999 });
//   }, []);

//   const hasActiveFilters =
//     !!searchTerm ||
//     selectedCategory !== 'all' ||
//     selectedMarketplace !== 'all' ||
//     stockStatus !== 'all' ||
//     priceRange.min > 0 ||
//     priceRange.max < 999999;

//   // ─────────────────────────────────────────────────────────────────────────
//   return {
//     // Data
//     availableMarketplaces,
//     quantities: finalQuantities,
//     filteredProducts,
//     categories,
//     marketplaceTotals,
//     connectionsLoading,
//     distributeStatus,

//     // Helpers
//     getProductMarketplacePrices,

//     // Filters
//     filters: {
//       searchTerm,        setSearchTerm,
//       selectedCategory,  setSelectedCategory,
//       selectedMarketplace, setSelectedMarketplace,
//       stockStatus,       setStockStatus,
//       priceRange,        setPriceRange,
//       hasActiveFilters,
//       clearFilters,
//     },

//     // Actions
//     actions: {
//       updateQuantity,
//       equallyDistribute,
//       distribute,
//     },
//   };
// }