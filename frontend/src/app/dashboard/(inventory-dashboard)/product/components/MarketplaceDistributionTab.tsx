// // 'use client'
// // import { useState } from 'react';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { 
// //   Filter, X, Search, Shuffle, Plus, Minus, ChevronDown,
// //   Package, BarChart3, Layers
// // } from 'lucide-react';
// // import { useDynamicMarketplace } from '../../../../../hooks/useMarketplaceDistribution';
// // import { Product } from '../types/product';
// // import Image from 'next/image';

// // interface DynamicMarketplaceTabProps {
// //   products: Product[];
// // }

// // export default function DynamicMarketplaceTab({ products }: DynamicMarketplaceTabProps) {
// //   const {
// //     availableMarketplaces,
// //     quantities,
// //     filteredProducts,
// //     categories,
// //     marketplaceTotals,
// //     filters,
// //     actions,
// //     getProductMarketplacePrices
// //   } = useDynamicMarketplace(products);

// //   console.log("products", products)
// //   const [showFilters, setShowFilters] = useState(true);
// //   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

// //   const toggleRow = (productId: string) => {
// //     const newExpanded = new Set(expandedRows);
// //     if (newExpanded.has(productId)) {
// //       newExpanded.delete(productId);
// //     } else {
// //       newExpanded.add(productId);
// //     }
// //     setExpandedRows(newExpanded);
// //   };

// //   // Safe image loader function
// //   const getSafeImageUrl = (url: string) => {
// //     if (!url) return null;
// //     // Agar via.placeholder.com hai to use karo, otherwise original URL
// //     if (url.includes('via.placeholder.com')) {
// //       return url; // Placeholder images ke liye direct use karo
// //     }
// //     return url;
// //   };

// //   // Agar koi marketplace nahi hai
// //   if (availableMarketplaces.length === 0) {
// //     return (
// //       <div className="text-center py-12 bg-white rounded-xl shadow-lg">
// //         <Layers className="h-16 w-16 mx-auto text-gray-400" />
// //         <h3 className="mt-4 text-xl font-semibold text-gray-900">No Marketplaces Found</h3>
// //         <p className="text-gray-500 mt-2">No marketplace pricing has been added to any product yet.</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
// //         <div>
// //           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
// //             <BarChart3 className="h-6 w-6 text-indigo-600" />
// //             Marketplace Distribution
// //           </h1>
// //           <p className="text-gray-600 mt-1">
// //             Managing {availableMarketplaces.length} active marketplaces across {products.length} products
// //           </p>
// //         </div>
// //         <button
// //           onClick={() => setShowFilters(!showFilters)}
// //           className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
// //         >
// //           <Filter className="h-4 w-4" />
// //           {showFilters ? 'Hide Filters' : 'Show Filters'}
// //           <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
// //         </button>
// //       </div>

// //       {/* Statistics Cards - Dynamic based on available marketplaces */}
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4"
// //       >
// //         {/* Total Card */}
// //         <motion.div 
// //           key="total-card" // Added key
// //           whileHover={{ scale: 1.02, y: -4 }}
// //         >
// //           <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
// //             <div className="flex justify-between items-start">
// //               <div className="p-3 bg-white/20 rounded-xl">
// //                 <Package className="h-6 w-6" />
// //               </div>
// //               <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
// //                 Total
// //               </span>
// //             </div>
// //             <p className="text-3xl font-bold mt-4">{marketplaceTotals.grandTotal}</p>
// //             <p className="text-sm opacity-90">Total Products</p>
// //             <p className="text-xs opacity-75 mt-1">Across all marketplaces</p>
// //           </div>
// //         </motion.div>

// //         {/* Dynamic Marketplace Cards */}
// //         {availableMarketplaces.map((mp, index) => {
// //           const total = marketplaceTotals.totals[mp.id] || 0;
// //           const percentage = marketplaceTotals.grandTotal > 0 
// //             ? ((total / marketplaceTotals.grandTotal) * 100).toFixed(1) 
// //             : '0.0';
// //           const Icon = mp.icon;

// //           return (
// //             <motion.div
// //               key={`marketplace-card-${mp.id}`} // Fixed: Added unique key
// //               whileHover={{ scale: 1.02, y: -4 }}
// //               initial={{ opacity: 0, y: 20 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ delay: index * 0.05 }}
// //             >
// //               <div className={`${mp.bgColor} rounded-xl shadow-lg p-6 text-white`}>
// //                 <div className="flex justify-between items-start">
// //                   <div className="p-3 bg-white/20 rounded-xl">
// //                     <Icon className="h-6 w-6" />
// //                   </div>
// //                   <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
// //                     {percentage}%
// //                   </span>
// //                 </div>
// //                 <p className="text-3xl font-bold mt-4">{total}</p>
// //                 <p className="text-sm opacity-90">{mp.displayName}</p>
// //                 <p className="text-xs opacity-75 mt-1">{percentage}% of total</p>
// //               </div>
// //             </motion.div>
// //           );
// //         })}
// //       </motion.div>

// //       {/* Filters Section */}
// //       <AnimatePresence>
// //         {showFilters && (
// //           <motion.div
// //             key="filters-section" // Added key
// //             initial={{ opacity: 0, height: 0 }}
// //             animate={{ opacity: 1, height: 'auto' }}
// //             exit={{ opacity: 0, height: 0 }}
// //             className="overflow-hidden"
// //           >
// //             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
// //               <div className="flex items-center gap-2 mb-4">
// //                 <Filter className="h-5 w-5 text-indigo-600" />
// //                 <h3 className="font-semibold text-gray-900">Filters</h3>
// //                 {filters.hasActiveFilters && (
// //                   <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
// //                     Active
// //                   </span>
// //                 )}
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //                 {/* Search */}
// //                 <div key="search-filter"> {/* Added key */}
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Search Products
// //                   </label>
// //                   <div className="relative">
// //                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
// //                     <input
// //                       type="text"
// //                       value={filters.searchTerm}
// //                       onChange={(e) => filters.setSearchTerm(e.target.value)}
// //                       placeholder="Name or SKU..."
// //                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
// //                     />
// //                   </div>
// //                 </div>

// //                 {/* Category Filter */}
// //                 <div key="category-filter"> {/* Added key */}
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Category
// //                   </label>
// //                   <select
// //                     value={filters.selectedCategory}
// //                     onChange={(e) => filters.setSelectedCategory(e.target.value)}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
// //                   >
// //                     <option value="all">All Categories</option>
// //                     {categories.map(cat => (
// //                       <option key={`category-option-${cat}`} value={cat}>{cat}</option> // Fixed: Added unique key
// //                     ))}
// //                   </select>
// //                 </div>

// //                 {/* Dynamic Marketplace Filter */}
// //                 <div key="marketplace-filter"> {/* Added key */}
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Marketplace
// //                   </label>
// //                   <select
// //                     value={filters.selectedMarketplace}
// //                     onChange={(e) => filters.setSelectedMarketplace(e.target.value)}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
// //                   >
// //                     <option value="all">All Marketplaces</option>
// //                     {availableMarketplaces.map(mp => (
// //                       <option key={`marketplace-option-${mp.id}`} value={mp.id}> {/* Fixed: Added unique key */}
// //                         {mp.displayName}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 {/* Stock Status */}
// //                 <div key="stock-filter"> {/* Added key */}
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Stock Status
// //                   </label>
// //                   <select
// //                     value={filters.stockStatus}
// //                     onChange={(e) => filters.setStockStatus(e.target.value)}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
// //                   >
// //                     <option value="all">All</option>
// //                     <option value="in-stock">In Stock</option>
// //                     <option value="low-stock">Low Stock (&lt;10)</option>
// //                     <option value="out-of-stock">Out of Stock</option>
// //                   </select>
// //                 </div>
// //               </div>

// //               {/* Price Range */}
// //               <div className="mt-4 grid grid-cols-2 gap-4">
// //                 <div key="min-price"> {/* Added key */}
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Min Price ($)
// //                   </label>
// //                   <input
// //                     type="number"
// //                     value={filters.priceRange.min}
// //                     onChange={(e) => filters.setPriceRange(prev => ({ 
// //                       ...prev, 
// //                       min: Number(e.target.value) 
// //                     }))}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
// //                   />
// //                 </div>
// //                 <div key="max-price"> {/* Added key */}
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Max Price ($)
// //                   </label>
// //                   <input
// //                     type="number"
// //                     value={filters.priceRange.max}
// //                     onChange={(e) => filters.setPriceRange(prev => ({ 
// //                       ...prev, 
// //                       max: Number(e.target.value) 
// //                     }))}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
// //                   />
// //                 </div>
// //               </div>

// //               {/* Active Filters Summary */}
// //               {filters.hasActiveFilters && (
// //                 <div key="active-filters" className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between"> {/* Added key */}
// //                   <div className="flex items-center gap-2">
// //                     <span className="text-sm font-medium text-indigo-900">
// //                       {filteredProducts.length} products found
// //                     </span>
// //                     <span className="text-xs text-indigo-600">
// //                       (of {products.length} total)
// //                     </span>
// //                   </div>
// //                   <button
// //                     onClick={filters.clearFilters}
// //                     className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-red-600 hover:bg-red-50"
// //                   >
// //                     <X className="h-3 w-3" />
// //                     Clear All
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           </motion.div>
// //         )}
// //       </AnimatePresence>

// //       {/* Products Table */}
// //       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
// //         <div className="overflow-x-auto">
// //           <table className="w-full">
// //             <thead>
// //               <tr key="table-header" className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-gray-200"> {/* Added key */}
// //                 <th className="text-left p-4 font-semibold text-gray-700">Product</th>
// //                 <th className="text-left p-4 font-semibold text-gray-700">SKU</th>
// //                 <th className="text-left p-4 font-semibold text-gray-700">Price</th>
// //                 {/* Dynamic Marketplace Headers */}
// //                 {availableMarketplaces.map(mp => (
// //                   <th key={`header-${mp.id}`} className={`text-center p-4 font-semibold ${mp.textColor}`}> {/* Fixed: Added unique key */}
// //                     <div className="flex items-center justify-center gap-1">
// //                       <mp.icon className="h-4 w-4" />
// //                       {mp.displayName}
// //                     </div>
// //                   </th>
// //                 ))}
// //                 <th className="text-center p-4 font-semibold text-gray-700">Total</th>
// //                 <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filteredProducts.map((product, index) => {
// //                 const productPrices = getProductMarketplacePrices(product.id);
// //                 const productQuantities = quantities[product.id] || {};
// //                 const total = Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);
// //                 const safeImageUrl = getSafeImageUrl(product.imageUrl);

// //                 return (
// //                   <motion.tr
// //                     key={`product-row-${product.id}`} // Fixed: Added unique key
// //                     initial={{ opacity: 0, x: -20 }}
// //                     animate={{ opacity: 1, x: 0 }}
// //                     transition={{ delay: index * 0.03 }}
// //                     className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50"
// //                   >
// //                     <td className="p-4">
// //                       <div className="flex items-center gap-3">
// //                         {safeImageUrl && (
// //                           <>
// //                             {/* For placeholder images, use regular img tag */}
// //                             {safeImageUrl.includes('via.placeholder.com') ? (
// //                               // eslint-disable-next-line @next/next/no-img-element
// //                               <img 
// //                                 src={safeImageUrl} 
// //                                 alt={product.name}
// //                                 className="w-10 h-10 rounded-lg object-cover"
// //                                 width={50}
// //                                 height={50}
// //                               />
// //                             ) : (
// //                               <Image 
// //                                 src={safeImageUrl} 
// //                                 alt={product.name}
// //                                 className="w-10 h-10 rounded-lg object-cover"
// //                                 width={50}
// //                                 height={50}
// //                               />
// //                             )}
// //                           </>
// //                         )}
// //                         <div>
// //                           <p className="font-semibold text-gray-900">{product.name}</p>
// //                           {product.primaryCategory && (
// //                             <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
// //                               {product.primaryCategory.name}
// //                             </span>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </td>
// //                     <td className="p-4">
// //                       <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
// //                         {product.sku}
// //                       </span>
// //                     </td>
// //                     <td className="p-4">
// //                       <div className="space-y-1">
// //                         <span className="block font-semibold text-gray-900">
// //                           ${product.price}
// //                         </span>
// //                         <span className="block text-xs text-gray-500">
// //                           Cost: ${product.costPrice}
// //                         </span>
// //                       </div>
// //                     </td>

// //                     {/* Dynamic Marketplace Quantity Controls */}
// //                     {availableMarketplaces.map((mp, mpIndex) => {
// //                       const price = productPrices[mp.id];
// //                       const quantity = productQuantities[mp.id] || 0;
                      
// //                       return (
// //                         <td key={`product-${product.id}-marketplace-${mp.id}`} className="p-4"> {/* Fixed: Added unique key using productId + marketplaceId */}
// //                           <div className="flex flex-col items-center gap-1">
// //                             <div className="flex items-center justify-center gap-1">
// //                               <button
// //                                 onClick={() => actions.updateQuantity(product.id, mp.id, -1)}
// //                                 className="h-7 w-7 rounded-lg border hover:bg-red-50 hover:text-red-600 hover:border-red-300 flex items-center justify-center"
// //                                 disabled={!price}
// //                               >
// //                                 <Minus className="h-3 w-3" />
// //                               </button>
// //                               <span className={`h-9 w-12 flex items-center justify-center rounded-lg font-bold text-sm ${
// //                                 quantity > 0 
// //                                   ? mp.bgColor.split(' ').pop() + ' bg-opacity-20 ' + mp.textColor
// //                                   : 'bg-gray-100 text-gray-400'
// //                               }`}>
// //                                 {quantity}
// //                               </span>
// //                               <button
// //                                 onClick={() => actions.updateQuantity(product.id, mp.id, 1)}
// //                                 className="h-7 w-7 rounded-lg border hover:bg-green-50 hover:text-green-600 hover:border-green-300 flex items-center justify-center"
// //                                 disabled={!price}
// //                               >
// //                                 <Plus className="h-3 w-3" />
// //                               </button>
// //                             </div>
// //                             {price && (
// //                               <span className="text-xs text-gray-500">
// //                                 ${price.sellingPrice}
// //                               </span>
// //                             )}
// //                           </div>
// //                         </td>
// //                       );
// //                     })}

// //                     <td key={`product-${product.id}-total`} className="p-4 text-center"> {/* Added key */}
// //                       <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
// //                         {total}
// //                       </span>
// //                     </td>

// //                     <td key={`product-${product.id}-actions`} className="p-4 text-center"> {/* Added key */}
// //                       <button
// //                         onClick={() => actions.equallyDistribute(product.id)}
// //                         className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
// //                       >
// //                         <Shuffle className="h-3 w-3" />
// //                         <span className="text-sm">Distribute</span>
// //                       </button>
// //                     </td>
// //                   </motion.tr>
// //                 );
// //               })}
// //             </tbody>

// //             {/* Table Footer */}
// //             {filteredProducts.length > 0 && (
// //               <tfoot key="table-footer"> {/* Added key */}
// //                 <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-gray-300">
// //                   <td colSpan={3} className="p-4 font-bold text-gray-900">
// //                     TOTALS ({filteredProducts.length} products)
// //                   </td>
// //                   {availableMarketplaces.map(mp => (
// //                     <td key={`footer-${mp.id}`} className="p-4 text-center"> {/* Fixed: Added unique key */}
// //                       <span className={`inline-flex items-center justify-center px-3 py-2 rounded-lg font-bold ${mp.bgColor} text-white shadow-md`}>
// //                         {marketplaceTotals.totals[mp.id] || 0}
// //                       </span>
// //                     </td>
// //                   ))}
// //                   <td key="footer-grand-total" className="p-4 text-center"> {/* Added key */}
// //                     <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
// //                       {marketplaceTotals.grandTotal}
// //                     </span>
// //                   </td>
// //                   <td key="footer-empty" className="p-4"></td> {/* Added key */}
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         </div>

// //         {/* No Results */}
// //         {filteredProducts.length === 0 && (
// //           <div key="no-results" className="text-center py-12"> {/* Added key */}
// //             <Package className="h-12 w-12 mx-auto text-gray-400" />
// //             <h3 className="mt-4 text-lg font-medium text-gray-900">No Products Found</h3>
// //             <p className="text-gray-500">Try adjusting your filters</p>
// //             <button
// //               onClick={filters.clearFilters}
// //               className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
// //             >
// //               Clear Filters
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }



// 'use client';
// // ─────────────────────────────────────────────────────────────────────────────
// // DynamicMarketplaceTab.tsx
// // Fully dynamic — driven by real marketplace connections from backend.
// // Distribute button calls the real API.
// // ─────────────────────────────────────────────────────────────────────────────

// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Filter, X, Search, Shuffle, Plus, Minus, ChevronDown,
//   Package, BarChart3, Layers, CheckCircle, AlertCircle,
//   AlertTriangle, Loader2,
// } from 'lucide-react';
// import Image from 'next/image';

// import { useDynamicMarketplace,ProductDistributeStatus } from '../../../../../hooks/useMarketplaceDistribution';
// import { Product } from '../types/product';

// // ─────────────────────────────────────────────────────────────────────────────
// // Props
// // ─────────────────────────────────────────────────────────────────────────────

// interface DynamicMarketplaceTabProps {
//   products: Product[];
//   userId?: string;   // ← pass from parent (auth context / session)
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Sub-components
// // ─────────────────────────────────────────────────────────────────────────────

// /** Small status badge shown after Distribute is clicked */
// function DistributeStatusBadge({ status }: { status: ProductDistributeStatus }) {
//   if (status.status === 'idle') return null;

//   if (status.status === 'loading') {
//     return (
//       <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg animate-pulse">
//         <Loader2 className="h-3 w-3 animate-spin" />
//         Listing…
//       </span>
//     );
//   }

//   if (status.status === 'success') {
//     return (
//       <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg">
//         <CheckCircle className="h-3 w-3" />
//         Listed
//       </span>
//     );
//   }

//   if (status.status === 'partial') {
//     const failed = status.results.filter((r) => !r.success);
//     return (
//       <span
//         className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg cursor-pointer"
//         title={failed.map((r) => `${r.marketplaceName}: ${r.error}`).join('\n')}
//       >
//         <AlertTriangle className="h-3 w-3" />
//         {failed.length} failed
//       </span>
//     );
//   }

//   // error
//   return (
//     <span
//       className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg cursor-pointer"
//       title={status.results.map((r) => r.error).filter(Boolean).join('\n')}
//     >
//       <AlertCircle className="h-3 w-3" />
//       Failed
//     </span>
//   );
// }

// /** Result detail row shown below a product row after distribution */
// function DistributeResultsRow({
//   colSpan,
//   status,
// }: {
//   colSpan: number;
//   status: ProductDistributeStatus;
// }) {
//   if (!['success', 'partial', 'error'].includes(status.status)) return null;
//   if (!status.results.length) return null;

//   return (
//     <tr>
//       <td colSpan={colSpan} className="px-4 pb-3 pt-0">
//         <div className="flex flex-wrap gap-2">
//           {status.results.map((r) => (
//             <div
//               key={r.connectionId}
//               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
//                 r.success
//                   ? 'bg-green-50 border-green-200 text-green-800'
//                   : 'bg-red-50 border-red-200 text-red-800'
//               }`}
//             >
//               {r.success ? (
//                 <CheckCircle className="h-3.5 w-3.5" />
//               ) : (
//                 <AlertCircle className="h-3.5 w-3.5" />
//               )}
//               <span className="capitalize">{r.marketplaceName}</span>
//               {r.success ? (
//                 r.viewUrl ? (
//                   <a
//                     href={r.viewUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="underline ml-1 opacity-75 hover:opacity-100"
//                   >
//                     View listing
//                   </a>
//                 ) : (
//                   <span className="opacity-60 ml-1">Listed ✓</span>
//                 )
//               ) : (
//                 <span className="opacity-75 ml-1">{r.error}</span>
//               )}
//             </div>
//           ))}
//         </div>
//       </td>
//     </tr>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────────────────────────────────────

// export default function DynamicMarketplaceTab({
//   products,
  
// }: DynamicMarketplaceTabProps) {
//   const {
//     availableMarketplaces,
//     quantities,
//     filteredProducts,
//     categories,
//     marketplaceTotals,
//     connectionsLoading,
//     distributeStatus,
//     filters,
//     actions,
//     getProductMarketplacePrices,
//   } = useDynamicMarketplace(products);

//   const [showFilters, setShowFilters] = useState(true);

//   // Total table columns: Product + SKU + Price + N marketplaces + Total + Actions
//   const totalCols = 3 + availableMarketplaces.length + 2;

//   // ── Empty States ────────────────────────────────────────────────────────────

//   if (connectionsLoading) {
//     return (
//       <div className="flex items-center justify-center py-16">
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//         <span className="ml-3 text-gray-600">Loading marketplace connections… adfasd asdfasd asdfasd </span>
//       </div>
//     );
//   }

//   if (!availableMarketplaces.length) {
//     return (
//       <div className="text-center py-16 bg-white rounded-xl shadow-lg">
//         <Layers className="h-16 w-16 mx-auto text-gray-300" />
//         <h3 className="mt-4 text-xl font-semibold text-gray-900">No Connected Marketplaces</h3>
//         <p className="text-gray-500 mt-2 max-w-sm mx-auto">
//           Connect at least one marketplace (eBay, Shopify, etc.) from Settings
//           before distributing products.
//         </p>
//       </div>
//     );
//   }

//   // ── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-6">

//       {/* ── Header ─────────────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <BarChart3 className="h-6 w-6 text-indigo-600" />
//             Marketplace Distribution
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             {availableMarketplaces.length} connected marketplace(s) ·{' '}
//             {products.length} product(s)
//           </p>
//         </div>
//         <button
//           onClick={() => setShowFilters((v) => !v)}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors text-sm"
//         >
//           <Filter className="h-4 w-4" />
//           {showFilters ? 'Hide' : 'Show'} Filters
//           <ChevronDown
//             className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
//           />
//         </button>
//       </div>

//       {/* ── Stats Cards ────────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
//         {/* Grand total */}
//         <motion.div whileHover={{ scale: 1.02, y: -4 }}>
//           <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
//             <div className="flex justify-between items-start">
//               <div className="p-3 bg-white/20 rounded-xl">
//                 <Package className="h-6 w-6" />
//               </div>
//               <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Total</span>
//             </div>
//             <p className="text-3xl font-bold mt-4">{marketplaceTotals.grandTotal}</p>
//             <p className="text-sm opacity-90">Units Distributed</p>
//             <p className="text-xs opacity-70 mt-1">Across all marketplaces</p>
//           </div>
//         </motion.div>

//         {availableMarketplaces.map((mp, i) => {
//           const total = marketplaceTotals.totals[mp.id] ?? 0;
//           const pct =
//             marketplaceTotals.grandTotal > 0
//               ? ((total / marketplaceTotals.grandTotal) * 100).toFixed(1)
//               : '0.0';
//           const Icon = mp.icon;

//           return (
//             <motion.div
//               key={mp.id}
//               whileHover={{ scale: 1.02, y: -4 }}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.05 }}
//             >
//               <div className={`${mp.bgColor} rounded-xl shadow-lg p-6 text-white`}>
//                 <div className="flex justify-between items-start">
//                   <div className="p-3 bg-white/20 rounded-xl">
//                     <Icon className="h-6 w-6" />
//                   </div>
//                   <span className="px-2 py-1 bg-white/20 rounded-full text-xs">{pct}%</span>
//                 </div>
//                 <p className="text-3xl font-bold mt-4">{total}</p>
//                 <p className="text-sm opacity-90">{mp.displayName}</p>
//                 <p className="text-xs opacity-70 mt-1">{pct}% of total</p>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* ── Filters ────────────────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {showFilters && (
//           <motion.div
//             key="filters"
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="overflow-hidden"
//           >
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <Filter className="h-5 w-5 text-indigo-600" />
//                 <h3 className="font-semibold text-gray-900">Filters</h3>
//                 {filters.hasActiveFilters && (
//                   <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
//                     Active
//                   </span>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {/* Search */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Search Products
//                   </label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       type="text"
//                       value={filters.searchTerm}
//                       onChange={(e) => filters.setSearchTerm(e.target.value)}
//                       placeholder="Name or SKU…"
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>

//                 {/* Category */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                   <select
//                     value={filters.selectedCategory}
//                     onChange={(e) => filters.setSelectedCategory(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="all">All Categories</option>
//                     {categories.map((cat) => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Marketplace */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace</label>
//                   <select
//                     value={filters.selectedMarketplace}
//                     onChange={(e) => filters.setSelectedMarketplace(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="all">All Marketplaces</option>
//                     {availableMarketplaces.map((mp) => (
//                       <option key={mp.id} value={mp.id}>{mp.displayName}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Stock */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
//                   <select
//                     value={filters.stockStatus}
//                     onChange={(e) => filters.setStockStatus(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="all">All</option>
//                     <option value="in-stock">In Stock</option>
//                     <option value="low-stock">Low Stock (&lt;10)</option>
//                     <option value="out-of-stock">Out of Stock</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Price range */}
//               <div className="mt-4 grid grid-cols-2 gap-4">
//                 {[
//                   { label: 'Min Price (£)', field: 'min' as const },
//                   { label: 'Max Price (£)', field: 'max' as const },
//                 ].map(({ label, field }) => (
//                   <div key={field}>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                     <input
//                       type="number"
//                       min={0}
//                       value={filters.priceRange[field] === 999999 && field === 'max' ? '' : filters.priceRange[field]}
//                       placeholder={field === 'max' ? 'No limit' : '0'}
//                       onChange={(e) =>
//                         filters.setPriceRange((prev) => ({
//                           ...prev,
//                           [field]: e.target.value === '' ? (field === 'max' ? 999999 : 0) : Number(e.target.value),
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
//                 ))}
//               </div>

//               {/* Active filters summary */}
//               {filters.hasActiveFilters && (
//                 <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
//                   <span className="text-sm font-medium text-indigo-900">
//                     {filteredProducts.length} of {products.length} products shown
//                   </span>
//                   <button
//                     onClick={filters.clearFilters}
//                     className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-red-600 hover:bg-red-50 border border-red-200"
//                   >
//                     <X className="h-3 w-3" />
//                     Clear All
//                   </button>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Products Table ──────────────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-gray-200">
//                 <th className="text-left p-4 font-semibold text-gray-700 text-sm">Product</th>
//                 <th className="text-left p-4 font-semibold text-gray-700 text-sm">SKU</th>
//                 <th className="text-left p-4 font-semibold text-gray-700 text-sm">Price</th>
//                 {availableMarketplaces.map((mp) => (
//                   <th
//                     key={mp.id}
//                     className={`text-center p-4 font-semibold text-sm ${mp.textColor}`}
//                   >
//                     <div className="flex items-center justify-center gap-1">
//                       <mp.icon className="h-4 w-4" />
//                       {mp.displayName}
//                     </div>
//                   </th>
//                 ))}
//                 <th className="text-center p-4 font-semibold text-gray-700 text-sm">Total</th>
//                 <th className="text-center p-4 font-semibold text-gray-700 text-sm">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredProducts.length === 0 ? (
//                 <tr>
//                   <td colSpan={totalCols} className="py-16 text-center text-gray-400">
//                     <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
//                     <p className="font-medium">No products match your filters</p>
//                     <button
//                       onClick={filters.clearFilters}
//                       className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
//                     >
//                       Clear Filters
//                     </button>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredProducts.map((product, index) => {
//                   const productPrices   = getProductMarketplacePrices(product.id);
//                   const productQtys     = quantities[product.id] ?? {};
//                   const total           = Object.values(productQtys).reduce((s, q) => s + q, 0);
//                   const status          = distributeStatus[product.id] ?? { status: 'idle', results: [] };
//                   const isDistributing  = status.status === 'loading';

//                   return (
//                     <>
//                       <motion.tr
//                         key={`row-${product.id}`}
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: index * 0.03 }}
//                         className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-purple-50/40 transition-colors"
//                       >
//                         {/* Product info */}
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             {product.imageUrl && !product.imageUrl.startsWith('data:') && (
//                               <img
//                                 src={product.imageUrl}
//                                 alt={product.name}
//                                 width={40}
//                                 height={40}
//                                 className="rounded-lg object-cover w-10 h-10 flex-shrink-0"
//                               />
//                             )}
//                             <div>
//                               <p className="font-semibold text-gray-900 text-sm leading-tight">
//                                 {product.name}
//                               </p>
//                               {product.primaryCategory && (
//                                 <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full mt-1 inline-block">
//                                   {product.primaryCategory.name}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* SKU */}
//                         <td className="p-4">
//                           <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
//                             {product.sku}
//                           </span>
//                         </td>

//                         {/* Base price */}
//                         <td className="p-4">
//                           <p className="font-semibold text-gray-900 text-sm">
//                             £{product.price.toFixed(2)}
//                           </p>
//                           <p className="text-xs text-gray-400">
//                             Cost: £{product.costPrice?.toFixed(2) ?? '—'}
//                           </p>
//                         </td>

//                         {/* Per-marketplace quantity controls */}
//                         {availableMarketplaces.map((mp) => {
//                           const price    = productPrices[mp.id];
//                           const quantity = productQtys[mp.id] ?? 0;
//                           const disabled = !price || isDistributing;

//                           return (
//                             <td key={`${product.id}-${mp.id}`} className="p-4">
//                               <div className="flex flex-col items-center gap-1">
//                                 <div className="flex items-center gap-1">
//                                   <button
//                                     onClick={() => actions.updateQuantity(product.id, mp.id, -1)}
//                                     disabled={disabled || quantity === 0}
//                                     className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//                                   >
//                                     <Minus className="h-3 w-3" />
//                                   </button>

//                                   <span
//                                     className={`h-9 w-12 flex items-center justify-center rounded-lg font-bold text-sm ${
//                                       quantity > 0
//                                         ? `${mp.badgeBg} ${mp.textColor}`
//                                         : 'bg-gray-100 text-gray-400'
//                                     }`}
//                                   >
//                                     {quantity}
//                                   </span>

//                                   <button
//                                     onClick={() => actions.updateQuantity(product.id, mp.id, 1)}
//                                     disabled={disabled}
//                                     className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-green-50 hover:text-green-600 hover:border-green-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//                                   >
//                                     <Plus className="h-3 w-3" />
//                                   </button>
//                                 </div>

//                                 {/* Show marketplace-specific selling price */}
//                                 {price && (
//                                   <span className="text-xs text-gray-400">
//                                     £{price.sellingPrice.toFixed(2)}
//                                   </span>
//                                 )}

//                                 {/* No pricing configured warning */}
//                                 {!price && (
//                                   <span className="text-xs text-amber-500" title="No pricing set for this marketplace">
//                                     No pricing
//                                   </span>
//                                 )}
//                               </div>
//                             </td>
//                           );
//                         })}

//                         {/* Row total */}
//                         <td className="p-4 text-center">
//                           <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
//                             {total}
//                           </span>
//                         </td>

//                         {/* Actions */}
//                         <td className="p-4">
//                           <div className="flex flex-col items-center gap-2">
//                             {/* Equally distribute across marketplaces */}
//                             <button
//                               onClick={() => actions.equallyDistribute(product.id)}
//                               disabled={isDistributing || total === 0}
//                               className="inline-flex items-center gap-1 px-3 py-1.5 border border-indigo-300 text-indigo-700 rounded-lg text-xs hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                               title="Split total quantity evenly across marketplaces"
//                             >
//                               <Shuffle className="h-3 w-3" />
//                               Split
//                             </button>

//                             {/* ─── THE MAIN BUTTON: calls backend API ─── */}
//                             <button
//                               onClick={() => actions.distribute(product.id)}
//                               disabled={isDistributing || total === 0}
//                               className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                             >
//                               {isDistributing ? (
//                                 <>
//                                   <Loader2 className="h-3 w-3 animate-spin" />
//                                   Listing…
//                                 </>
//                               ) : (
//                                 <>
//                                   <BarChart3 className="h-3 w-3" />
//                                   Distribute
//                                 </>
//                               )}
//                             </button>

//                             {/* Status badge */}
//                             <DistributeStatusBadge status={status} />
//                           </div>
//                         </td>
//                       </motion.tr>

//                       {/* Inline results row — shown after distribution */}
//                       <DistributeResultsRow
//                         key={`results-${product.id}`}
//                         colSpan={totalCols}
//                         status={status}
//                       />
//                     </>
//                   );
//                 })
//               )}
//             </tbody>

//             {/* Footer totals */}
//             {filteredProducts.length > 0 && (
//               <tfoot>
//                 <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t-2 border-gray-200">
//                   <td colSpan={3} className="p-4 font-bold text-gray-900 text-sm">
//                     TOTALS ({filteredProducts.length} products)
//                   </td>
//                   {availableMarketplaces.map((mp) => (
//                     <td key={mp.id} className="p-4 text-center">
//                       <span
//                         className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${mp.bgColor} text-white shadow`}
//                       >
//                         {marketplaceTotals.totals[mp.id] ?? 0}
//                       </span>
//                     </td>
//                   ))}
//                   <td className="p-4 text-center">
//                     <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
//                       {marketplaceTotals.grandTotal}
//                     </span>
//                   </td>
//                   <td />
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }