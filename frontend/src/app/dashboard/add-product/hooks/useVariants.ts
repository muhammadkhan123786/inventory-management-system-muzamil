// // hooks/useVariants.ts - Custom hook for variant management
// import { useState, useCallback, useMemo } from 'react';
// import { ProductVariant, VariantCombination } from '@/types/variant';

// export function useVariants() {
//   const [variants, setVariants] = useState<ProductVariant[]>([]);
//   const [generatedCombinations, setGeneratedCombinations] = useState<VariantCombination[]>([]);

//   // Generate all possible attribute combinations
//   const generateAttributeCombinations = useCallback((
//     attributes: Array<{
//       id: string;
//       name: string;
//       values: Array<{ id: string; value: string }>;
//     }>
//   ): VariantCombination[] => {
//     if (!attributes.length) return [];

//     const generate = (current: AttributeValue[], index: number): VariantCombination[] => {
//       if (index === attributes.length) {
//         const sku = generateSKU(current);
//         return [{
//           attributes: [...current],
//           sku: sku
//         }];
//       }

//       const results: VariantCombination[] = [];
//       const attribute = attributes[index];
      
//       attribute.values.forEach(value => {
//         const newCombination: AttributeValue = {
//           attributeId: attribute.id,
//           value: value.id,
//           label: value.value
//         };
//         results.push(...generate([...current, newCombination], index + 1));
//       });

//       return results;
//     };

//     return generate([], 0);
//   }, []);

//   const generateSKU = (attributes: AttributeValue[]): string => {
//     const prefix = 'VAR';
//     const attrCodes = attributes.map(attr => 
//       attr.label?.substring(0, 3).toUpperCase() || attr.value.substring(0, 3)
//     ).join('-');
//     const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//     return `${prefix}-${attrCodes}-${random}`;
//   };

//   // Create variant from combination
//   const createVariantFromCombination = useCallback((
//     combination: VariantCombination,
//     basePricing: any[],
//     baseStock: any[]
//   ): ProductVariant => {
//     return {
//       id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       sku: combination.sku,
//       attributes: combination.attributes.reduce((acc, attr) => {
//         acc[attr.attributeId] = attr.value;
//         return acc;
//       }, {} as Record<string, any>),
//       pricing: basePricing.map(p => ({
//         marketplaceId: p.marketplaceId,
//         price: p.price,
//         currency: p.currency,
//         taxId: p.taxId,
//         isActive: true
//       })),
//       stock: baseStock.map(s => ({
//         warehouseId: s.warehouseId,
//         quantity: s.quantity || 0,
//         statusId: s.statusId,
//         conditionId: s.conditionId
//       })),
//       isActive: true
//     };
//   }, []);

//   // Add variant
//   const addVariant = useCallback((variant: ProductVariant) => {
//     setVariants(prev => {
//       const exists = prev.find(v => v.sku === variant.sku);
//       if (exists) {
//         return prev.map(v => v.sku === variant.sku ? variant : v);
//       }
//       return [...prev, variant];
//     });
//   }, []);

//   // Bulk generate variants
//   const bulkGenerateVariants = useCallback((
//     attributes: any[],
//     basePricing: any[],
//     baseStock: any[]
//   ) => {
//     const combinations = generateAttributeCombinations(attributes);
//     setGeneratedCombinations(combinations);
    
//     const newVariants = combinations.map(combination => 
//       createVariantFromCombination(combination, basePricing, baseStock)
//     );
    
//     setVariants(newVariants);
//     return newVariants;
//   }, [generateAttributeCombinations, createVariantFromCombination]);

//   // Update variant pricing
//   const updateVariantPricing = useCallback((
//     variantId: string,
//     marketplaceId: string,
//     updates: Partial<MarketplacePricing>
//   ) => {
//     setVariants(prev => prev.map(variant => {
//       if (variant.id === variantId) {
//         return {
//           ...variant,
//           pricing: variant.pricing.map(p => 
//             p.marketplaceId === marketplaceId ? { ...p, ...updates } : p
//           )
//         };
//       }
//       return variant;
//     }));
//   }, []);

//   // Update variant stock
//   const updateVariantStock = useCallback((
//     variantId: string,
//     warehouseId: string,
//     updates: Partial<StockInfo>
//   ) => {
//     setVariants(prev => prev.map(variant => {
//       if (variant.id === variantId) {
//         return {
//           ...variant,
//           stock: variant.stock.map(s => 
//             s.warehouseId === warehouseId ? { ...s, ...updates } : s
//           )
//         };
//       }
//       return variant;
//     }));
//   }, []);

//   // Get variant by attributes
//   const getVariantByAttributes = useCallback((attributes: Record<string, any>) => {
//     return variants.find(variant => 
//       Object.keys(attributes).every(key => 
//         variant.attributes[key] === attributes[key]
//       )
//     );
//   }, [variants]);

//   // Calculate total stock across all warehouses
//   const getTotalStock = useCallback((variantId: string) => {
//     const variant = variants.find(v => v.id === variantId);
//     return variant?.stock.reduce((total, s) => total + s.quantity, 0) || 0;
//   }, [variants]);

//   return {
//     variants,
//     generatedCombinations,
//     addVariant,
//     bulkGenerateVariants,
//     updateVariantPricing,
//     updateVariantStock,
//     getVariantByAttributes,
//     getTotalStock,
//     generateAttributeCombinations,
//     setVariants
//   };
// }