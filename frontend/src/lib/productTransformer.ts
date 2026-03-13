// utils/productTransformer.ts

interface ApiProduct {
  _id: string;
  productName: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  barcode: string;
  isActive: boolean;
  isDeleted: boolean;
  images: string[];
  categoryId: string | { 
    _id: string; 
    categoryName?: string; 
    name?: string; 
    level?: number; 
    parentId?: string 
  };
  categoryPath: (string | { 
    _id: string; 
    categoryName?: string; 
    name?: string; 
    level?: number; 
    parentId?: string 
  })[];
  attributes: Array<{
    sku: string;
    attributes: Record<string, any>;
    pricing: Array<{
      marketplaceName: string;
      costPrice: number;
      sellingPrice: number;
      retailPrice: number;
      discountPercentage: number;
      taxRate: number;
    }>;
    stock: {
      stockQuantity: number;
      stockStatus: string;
      onHand: number;
      reorderPoint: number;
      featured: boolean;
      minStockLevel: number;
      maxStockLevel: number;
    };
    warranty: {
      warrantyType: string;
      warrantyPeriod: string;
    };
  }>;
  ui_price: number;
  ui_totalStock: number;
  tags?: string[];
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  level: number;
  parentId: string;
}

interface TransformedProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  modelNumber: string;
  barcode: string;
  categories: CategoryInfo[]; // Changed from fixed levels to array
  categoryPath: CategoryInfo[]; // Full path from root to leaf
  primaryCategory: CategoryInfo; // The main/leaf category
  price: number;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  stockStatus: string;
  manufacturer: string;
  warranty: string;
  imageUrl: string;
  images: string[];
  featured: boolean;
  status: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  tags: string[];
  keywords: string[];
  attributes: any[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Extract category ID from either string or populated object
 */
const getCategoryId = (category: string | { _id: string } | null | undefined): string => {
  if (!category) return "uncategorized";
  return typeof category === 'string' ? category : (category._id || "uncategorized");
};

/**
 * Extract category display name from either string or populated object
 * Looks for categoryName first, then name
 */
const getCategoryDisplayName = (
  category: string | { 
    _id: string; 
    categoryName?: string; 
    name?: string 
  } | null | undefined, 
  defaultName: string
): string => {
  if (!category) return defaultName;
  if (typeof category === 'string') return defaultName;
  
  // Try categoryName first, then name
  return category.categoryName || category.name || defaultName;
};

/**
 * Extract category level from category object
 */
const getCategoryLevel = (category: any): number => {
  if (!category || typeof category === 'string') return 1;
  return category.level || 1;
};

/**
 * Extract parent ID from category object
 */
const getCategoryParentId = (
  category: string | { _id: string; parentId?: string } | null | undefined, 
  fallback: string
): string => {
  if (!category || typeof category === 'string') return fallback;
  return category.parentId || fallback;
};

/**
 * Process category path - convert string IDs to objects if needed
 */
const processCategoryPath = (
  categoryPath: (string | { 
    _id: string; 
    categoryName?: string; 
    name?: string; 
    level?: number; 
    parentId?: string;
    id?: string; 
  })[]
): { 
  _id: string; 
  categoryName?: string; 
  name?: string; 
  level?: number; 
  parentId?: string 
}[] => {
  if (!categoryPath || !Array.isArray(categoryPath)) {
    return [];
  }
  
  return categoryPath.map(cat => {
    console.log("cat", cat)
    if (typeof cat === 'string') {
      console.log("cat", cat)
     return { _id: cat };
    }
    return cat;
  });
};

/**
 * Build complete category hierarchy from categoryPath
 */
// const buildCategoryHierarchy = (
//   categoryId: any,
//   categoryPath: any[]
// ): CategoryInfo[] => {
//   const processedPath = processCategoryPath(categoryPath || []);
  
//   // If we have a processed path, use it
//   if (processedPath.length > 0) {
//     // Sort by level to ensure proper hierarchy
//     const sortedPath = [...processedPath].sort((a, b) => {
//       const levelA = getCategoryLevel(a);
//       const levelB = getCategoryLevel(b);
//       return levelA - levelB;
//     });
    
//     const categories: CategoryInfo[] = [];
    
//     sortedPath.forEach((cat, index) => {
//       const categoryInfo: CategoryInfo = {
//         id: getCategoryId(cat),
//         name: getCategoryDisplayName(cat, `Level ${getCategoryLevel(cat)}`),
//         level: getCategoryLevel(cat),
//         parentId: getCategoryParentId(cat, index > 0 ? categories[index - 1].id : "")
//       };
      
//       categories.push(categoryInfo);
//     });
    
//     return categories;
//   }
  
//   // Fallback: if we only have categoryId
//   if (categoryId) {
//     return [{
//       id: getCategoryId(categoryId),
//       name: getCategoryDisplayName(categoryId, "Main Category"),
//       level: getCategoryLevel(categoryId),
//       parentId: getCategoryParentId(categoryId, "")
//     }];
//   }
  
//   // Default fallback
//   return [{
//     id: "uncategorized",
//     name: "Uncategorized",
//     level: 1,
//     parentId: ""
//   }];
// };

// utils/productTransformer.ts

const buildCategoryHierarchy = (categoryId: any, categoryPath: any[]): CategoryInfo[] => {
  const processedPath = processCategoryPath(categoryPath);
  
  return processedPath.map((cat: any, index: number) => {
    const id = cat?._id || cat?.id || (typeof cat === 'string' ? cat : undefined);
    
    return {
      id: String(id), // Ensure it's a string
      name: cat?.categoryName || cat?.name || (id ? `Category (${String(id).substring(0, 5)})` : "Unknown"),
      level: cat?.level || (index + 1),
      parentId: cat?.parentId || ""
    };
  });
};

/**
 * Get category by level from hierarchy
 */
const getCategoryByLevel = (
  categories: CategoryInfo[],
  level: number
): CategoryInfo | null => {
  return categories.find(cat => cat.level === level) || null;
};

/**
 * Transform API product to UI product format with n-th level categories
 */
export const transformProduct = (apiProduct: ApiProduct): TransformedProduct => {
  // Get the first attribute (primary variant)
  const firstAttribute = apiProduct.attributes?.[0];
  const firstPricing = firstAttribute?.pricing?.[0];
  const stock = firstAttribute?.stock;

  // Build category hierarchy
  const categoryHierarchy = buildCategoryHierarchy(
    apiProduct.categoryId,
    apiProduct.categoryPath || []
  );
  // Primary category is the last (deepest/leaf) category in the path
  const primaryCategory = categoryHierarchy[categoryHierarchy.length - 1] || {
    id: "uncategorized",
    name: "Uncategorized",
    level: 1,
    parentId: ""
  };

  return {
    id: apiProduct._id,
    name: apiProduct.productName,
    sku: apiProduct.sku,
    description: apiProduct.description || apiProduct.shortDescription || '',
    shortDescription: apiProduct.shortDescription || '',
    brand: apiProduct.brand || '',
    manufacturer: apiProduct.manufacturer || '',
    modelNumber: apiProduct.modelNumber || '',
    barcode: apiProduct.barcode || '',
    categories: categoryHierarchy,
    categoryPath: categoryHierarchy,
    primaryCategory: primaryCategory,
    price: apiProduct.ui_price || firstPricing?.sellingPrice || 0,
    costPrice: firstPricing?.costPrice || 0,
    retailPrice: firstPricing?.retailPrice || 0,
    stockQuantity: apiProduct.ui_totalStock || stock?.stockQuantity || 0,
    stockStatus: stock?.stockStatus || 'out-of-stock',
    warranty: firstAttribute?.warranty 
      ? `${firstAttribute.warranty.warrantyPeriod} ${firstAttribute.warranty.warrantyType}`
      : 'No warranty',
    imageUrl: apiProduct.images?.[0] || 'https://via.placeholder.com/400',
    images: apiProduct.images || [],
    featured: stock?.featured || false,
    status: apiProduct.isActive ? 'active' : 'inactive',
    onHand: stock?.onHand || 0,
    reserved: 0,
    available: stock?.onHand || 0,
    reorderLevel: stock?.reorderPoint || 0,
    reorderQuantity: 0,
    minStockLevel: stock?.minStockLevel || 0,
    maxStockLevel: stock?.maxStockLevel || 0,
    tags: apiProduct.tags || [],
    keywords: apiProduct.keywords || [],
    attributes: apiProduct.attributes || [],
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt
  };
};

/**
 * Transform products response
 */
export const transformProductsResponse = (apiResponse: { data: ApiProduct[] }): TransformedProduct[] => {
  try {
    const transformed = apiResponse.data.map(product => {
      try {
        return transformProduct(product);
      } catch (error) {
        console.error('Error transforming individual product:', error);
        console.log('Problematic product:', product);
        // Return a basic transformed product as fallback
        return {
          id: product._id,
          name: product.productName,
          sku: product.sku,
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          brand: product.brand || '',
          manufacturer: product.manufacturer || '',
          modelNumber: product.modelNumber || '',
          barcode: product.barcode || '',
          categories: [{
            id: 'uncategorized',
            name: 'Uncategorized',
            level: 1,
            parentId: ''
          }],
          categoryPath: [{
            id: 'uncategorized',
            name: 'Uncategorized',
            level: 1,
            parentId: ''
          }],
          primaryCategory: {
            id: 'uncategorized',
            name: 'Uncategorized',
            level: 1,
            parentId: ''
          },
          price: product.ui_price || 0,
          costPrice: 0,
          retailPrice: 0,
          stockQuantity: product.ui_totalStock || 0,
          stockStatus: 'out-of-stock',
          warranty: 'No warranty',
          imageUrl: product.images?.[0] || 'https://via.placeholder.com/400',
          images: product.images || [],
          featured: false,
          status: product.isActive ? 'active' : 'inactive',
          onHand: 0,
          reserved: 0,
          available: 0,
          reorderLevel: 0,
          reorderQuantity: 0,
          minStockLevel: 0,
          maxStockLevel: 0,
          tags: product.tags || [],
          keywords: product.keywords || [],
          attributes: product.attributes || [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        } as TransformedProduct;
      }
    });
      return transformed;
  } catch (error) {
    console.error('Error in transformProductsResponse:', error);
    return [];
  }
};

/**
 * Helper function to extract all category IDs from products
 */
export const extractCategoryIdsFromProducts = (products: TransformedProduct[]): string[] => {
  const categoryIds = new Set<string>();
  
  products.forEach(product => {
    product.categories.forEach(category => {
      if (category.id && category.id !== 'uncategorized') {
        categoryIds.add(category.id);
      }
    });
  });
  
  return Array.from(categoryIds);
};

/**
 * Get all categories at a specific level from products
 */
export const getCategoriesByLevel = (
  products: TransformedProduct[],
  level: number
): CategoryInfo[] => {
  const categoriesMap = new Map<string, CategoryInfo>();
  
  products.forEach(product => {
    const category = getCategoryByLevel(product.categories, level);
    if (category && category.id !== 'uncategorized') {
      categoriesMap.set(category.id, category);
    }
  });
  
  return Array.from(categoriesMap.values());
};

/**
 * Get the maximum category depth from products
 */
export const getMaxCategoryDepth = (products: TransformedProduct[]): number => {
  let maxDepth = 0;
  
  products.forEach(product => {
    const depth = product.categories.length;
    if (depth > maxDepth) {
      maxDepth = depth;
    }
  });
  
  return maxDepth;
};

/**
 * Update categories in transformed product with actual category names
 */
// export const enrichProductCategories = (
//   product: TransformedProduct,
//   categoryMap: Record<string, { id: string; name: string; level: number; parentId?: string }>
// ): TransformedProduct => {
//   const enriched = { ...product };
  
//   // Enrich all categories in the hierarchy
//   enriched.categories = product.categories.map(category => {
//     if (categoryMap[category.id]) {
//       return {
//         ...category,
//         name: categoryMap[category.id].name,
//         level: categoryMap[category.id].level,
//         parentId: categoryMap[category.id].parentId || category.parentId
//       };
//     }
//     return category;
//   });
  
//   // Update categoryPath as well
//   enriched.categoryPath = enriched.categories;
  
//   // Update primary category
//   enriched.primaryCategory = enriched.categories[enriched.categories.length - 1] || product.primaryCategory;
  
//   return enriched;
// };

export const enrichProductCategories = (
  product: TransformedProduct,
  categoryMap: Record<string, any>
): TransformedProduct => {
  const enriched = { ...product };

  enriched.categories = product.categories.map(cat => {
    // Now that cat.id is '6978a...', this lookup will find the 'Mobile' object
    const found = categoryMap[cat.id]; 
    console.log("found", found);
    return {
      ...cat,
      name: found?.categoryName || found?.name || cat.name,
      level: found?.level || cat.level,
      // Optional: if your category object has more fields, add them here
    };
  });

  // Update the primary category to reflect the new name
  enriched.primaryCategory = enriched.categories[enriched.categories.length - 1];

  return enriched;
};
/**
 * Filter products by category at any level
 */
export const filterProductsByCategory = (
  products: TransformedProduct[],
  categoryId: string,
  level?: number
): TransformedProduct[] => {
  return products.filter(product => {
    if (level !== undefined) {
      const category = getCategoryByLevel(product.categories, level);
      return category?.id === categoryId;
    } else {
      // Match any level
      return product.categories.some(cat => cat.id === categoryId);
    }
  });
};

/**
 * Get breadcrumb path for a product's categories
 */
export const getCategoryBreadcrumb = (product: TransformedProduct): string => {
  return product.categories
    .map(cat => cat.name)
    .join(' > ');
};

/**
 * Get root category (level 1) from product
 */
export const getRootCategory = (product: TransformedProduct): CategoryInfo | null => {
  return getCategoryByLevel(product.categories, 1);
};

/**
 * Get leaf/deepest category from product
 */
export const getLeafCategory = (product: TransformedProduct): CategoryInfo => {
  return product.primaryCategory;
};

/**
 * Check if product belongs to a category path
 */
export const productBelongsToPath = (
  product: TransformedProduct,
  categoryIds: string[]
): boolean => {
  const productCategoryIds = product.categories.map(cat => cat.id);
  return categoryIds.every(id => productCategoryIds.includes(id));
};