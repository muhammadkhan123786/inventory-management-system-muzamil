'use client';

export interface MarketplaceTemplate {
  _id: string;
  name: string;
  icon: {
    _id: string;
    icon: string;
    iconName: string;
  };
}

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/form/Badge';
import { Card, CardContent } from '@/components/form/Card';
import {
  Star, Plus, Trash2, Ruler, Info, CheckCircle, AlertCircle,
  Save, Store, ShoppingBag, EyeOff, XCircle, ChevronRight,
  Package, ClipboardList, Tag, ShieldAlert,
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useFormActions } from '@/hooks/useFormActions';

import { AttributesSection } from '../sections/AttributesSection';
import { PricingSection } from '../sections/PricingSection';
import { InventorySection, validateInventory } from '../sections/InventorySection';
import { WarrantySection } from '../sections/WarrantySection';
import { VariantSummary } from '../sections/VariantSummarySections';
import { Input } from '@/components/form/Input';
import { Button } from '@/components/form/CustomButton';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/form/Select";
import InfoBoxSection from '../sections/InfoBoxSection';
import { useCurrencyStore } from "@/stores/currency.store";


import { ProductVariant, MarketplacePricing } from '../../hooks/useProductForm';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ValidationIssue {
  section: 'attributes' | 'pricing' | 'inventory' | 'warranty';
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface AttributesAndPricingStepProps {
  dynamicFields: Record<string, any>;
  formData: any;
  onDynamicFieldChange: (fieldName: string, value: any) => void;
  onInputChange: (field: string, value: string) => void;
  attributes: any[];
  currencies: any[];
  taxes: any[];
  warehouses: any[];
  warehouseStatus: any[];
  productStatus: any[];
  conditions: any[];
  marketplaces?: any[];
  warrantyOptions?: any[];
  getAllFields?: () => any[];
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
}

// ─── Section label map ─────────────────────────────────────────────────────────
const SECTION_META = {
  attributes: { label: 'Product Attributes', icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  pricing: { label: 'Marketplace Pricing', icon: Store, color: 'text-green-600', bg: 'bg-green-50  border-green-200' },
  inventory: { label: 'Stock & Inventory', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  warranty: { label: 'Warranty', icon: ShieldAlert, color: 'text-blue-600', bg: 'bg-blue-50   border-blue-200' },
} as const;

// ─── Professional Validation Error Panel ───────────────────────────────────────
function ValidationPanel({
  issues,
  onDismiss,
  onScrollTo,
}: {
  issues: ValidationIssue[];
  onDismiss: () => void;
  onScrollTo: (section: ValidationIssue['section']) => void;
}) {
  const grouped = issues.reduce<Record<string, ValidationIssue[]>>((acc, issue) => {
    if (!acc[issue.section]) acc[issue.section] = [];
    acc[issue.section].push(issue);
    return acc;
  }, {});

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-xl border-2 border-red-300 bg-white shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-500 to-rose-600">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              Variant Cannot Be Added
            </p>
            <p className="text-xs text-red-100">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
              {warningCount > 0 && ` · ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
              {' '}across {Object.keys(grouped).length} section{Object.keys(grouped).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <XCircle className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Issues grouped by section */}
      <div className="p-4 space-y-3">
        {(Object.keys(grouped) as ValidationIssue['section'][]).map((section) => {
          const meta = SECTION_META[section];
          const SIcon = meta.icon;
          const sIssues = grouped[section];
          const hasErrors = sIssues.some(i => i.severity === 'error');

          return (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-lg border p-3 ${meta.bg}`}
            >
              {/* Section row */}
              <button
                type="button"
                onClick={() => onScrollTo(section)}
                className="w-full flex items-center justify-between mb-2 group"
              >
                <div className="flex items-center gap-2">
                  <SIcon className={`h-4 w-4 ${meta.color}`} />
                  <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
                  {hasErrors ? (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {sIssues.filter(i => i.severity === 'error').length} error{sIssues.filter(i => i.severity === 'error').length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-amber-400 text-white text-[10px] font-bold rounded-full">
                      {sIssues.length} warning{sIssues.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <ChevronRight className={`h-3.5 w-3.5 ${meta.color} group-hover:translate-x-0.5 transition-transform`} />
              </button>

              {/* Individual issues */}
              <div className="space-y-1 pl-6">
                {sIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${issue.severity === 'error' ? 'bg-red-500' : 'bg-amber-400'
                      }`} />
                    <p className={`text-xs ${issue.severity === 'error' ? 'text-red-700' : 'text-amber-700'
                      }`}>
                      {issue.message}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500">
          Click any section above to jump directly to the issue. All errors must be resolved before saving.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function AttributesAndPricingStep({
  dynamicFields,
  formData,
  onDynamicFieldChange,
  onInputChange,
  attributes = [],
  currencies = [],
  taxes = [],
  warehouses = [],
  warehouseStatus = [],
  productStatus = [],
  conditions = [],
  marketplaces = [],
  warrantyOptions = [],
  getAllFields,
  variants,
  setVariants,
}: AttributesAndPricingStepProps) {

  // ── UI state ────────────────────────────────────────────────────────────
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [addedMarketplacePricing, setAddedMarketplacePricing] = useState<MarketplacePricing[]>([]);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [pricingHasErrors, setPricingHasErrors] = useState(false);

  // ── Validation panel state ──────────────────────────────────────────────
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);  // forces InventorySection to reveal all errors

  // ── Section refs for scroll-to ──────────────────────────────────────────
  const attributesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);
  const warrantyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
const currencySymbol = useCurrencyStore((s) => s.currencySymbol);

  const scrollToSection = useCallback((section: ValidationIssue['section']) => {
    const map = {
      attributes: attributesRef,
      pricing: pricingRef,
      inventory: inventoryRef,
      warranty: warrantyRef,
    };
    map[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const [currentMarketplacePricing, setCurrentMarketplacePricing] = useState<Partial<MarketplacePricing>>({
    marketplaceId: '', marketplaceName: '', costPrice: 0, sellingPrice: 0,
    retailPrice: 0, discountPercentage: 0, taxId: '', taxRate: 0, vatExempt: false,
  });

  const [variantId, setVariantId] = useState<string>('');

  const [currentVariant, setCurrentVariant] = useState<Partial<ProductVariant>>({
    sku: '', attributes: {}, marketplacePricing: [],
    stockQuantity: 0, minStockLevel: 0, maxStockLevel: 0, reorderPoint: 0,
    stockLocation: '', warehouseId: '', binLocation: '',
    productStatusId: '', conditionId: '', warehouseStatusId: '',
    supplierId: '',
    featured: false, safetyStock: 0, leadTimeDays: 0, warranty: '', warrantyPeriod: '',
  });

  const hasDynamicFields = attributes && attributes.length > 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAttributeChange = (fieldId: string, value: any) =>
    setCurrentVariant(p => ({ ...p, attributes: { ...p.attributes, [fieldId]: value } }));

  const handleVariantFieldChange = (field: string, value: any) =>
    setCurrentVariant(p => ({ ...p, [field]: value }));

  const handleMarketplacePricingChange = (field: string, value: any) =>
    setCurrentMarketplacePricing(p => ({ ...p, [field]: value }));

  const handleTaxChange = (v: string) => setCurrentMarketplacePricing(p => ({ ...p, taxId: v, taxRate: 0 }));
  const handleVatExemptChange = (v: boolean) => setCurrentMarketplacePricing(p => ({ ...p, vatExempt: v }));

  const removeMarketplacePricing = (marketplaceId: string) =>
    setAddedMarketplacePricing(p => p.filter(x => x.marketplaceId !== marketplaceId));

  const addMarketplacePricing = () => {
    if (!currentMarketplacePricing.costPrice || !currentMarketplacePricing.sellingPrice) {
      toast.warning('Please fill in Cost Price and Selling Price');
      return;
    }
    if (pricingHasErrors) {
      toast.error('Fix pricing errors before adding this marketplace');
      return;
    }
    const newPricing: MarketplacePricing = {
      id: `pricing-${Date.now()}`,
      marketplaceId: currentMarketplacePricing.marketplaceId || '',
      marketplaceName: currentMarketplacePricing.marketplaceName || '',
      costPrice: Number(currentMarketplacePricing.costPrice || 0),
      sellingPrice: Number(currentMarketplacePricing.sellingPrice || 0),
      retailPrice: Number(currentMarketplacePricing.retailPrice || 0),
      discountPercentage: Number(currentMarketplacePricing.discountPercentage || 0),
      taxId: currentMarketplacePricing.taxId || '',
      taxRate: Number(currentMarketplacePricing.taxRate || 0),
      vatExempt: currentMarketplacePricing.vatExempt || false,
    };
    const existingIndex = addedMarketplacePricing.findIndex(p => p.marketplaceId === currentMarketplacePricing.marketplaceId);
    if (existingIndex > -1) {
      setAddedMarketplacePricing(p => p.map((x, i) => i === existingIndex ? newPricing : x));
    } else {
      setAddedMarketplacePricing(p => [...p, newPricing]);
    }
    setCurrentMarketplacePricing({ marketplaceId: '', marketplaceName: '', costPrice: 0, sellingPrice: 0, retailPrice: 0, discountPercentage: 0, taxId: '', taxRate: 0, vatExempt: false });
    setSelectedMarketplace('');
    setShowPricingForm(false);
  };

  // ── PROFESSIONAL addVariant with full validation ──────────────────────
  const addVariant = () => {
    setSubmitAttempted(true);
    const issues: ValidationIssue[] = [];

    // ── Section 1: Attributes ──────────────────────────────────────────
    const missingAttrs = attributes
      .filter((a: any) => a.isRequired && !currentVariant.attributes?.[a._id!]);
    missingAttrs.forEach((a: any) => {
      issues.push({
        section: 'attributes', field: a._id, severity: 'error',
        message: `"${a.attributeName}" is a required attribute.`
      });
    });

    // ── Section 2: Pricing ─────────────────────────────────────────────
    if (addedMarketplacePricing.length === 0) {
      issues.push({
        section: 'pricing', field: 'marketplace', severity: 'error',
        message: 'At least one marketplace pricing configuration must be added.'
      });
    }

    // ── Section 3: Inventory — required fields ─────────────────────────
    const invRequired: { key: keyof typeof currentVariant; label: string }[] = [
      { key: 'stockQuantity', label: 'Stock Quantity' },
      { key: 'minStockLevel', label: 'Minimum Stock Level' },
      { key: 'maxStockLevel', label: 'Maximum Stock Level' },
      { key: 'reorderPoint', label: 'Reorder Point' },
      { key: 'safetyStock', label: 'Safety Stock' },
      { key: 'leadTimeDays', label: 'Lead Time (Days)' },
      { key: 'stockLocation', label: 'Stock Location' },
      { key: 'conditionId', label: 'Item Condition' },
      { key: 'productStatusId', label: 'Product Status' },
      { key: 'supplierId', label: 'Supplier' },

    ];
    invRequired.forEach(({ key, label }) => {
      if (!currentVariant[key]) {
        issues.push({
          section: 'inventory', field: String(key), severity: 'error',
          message: `${label} is required.`
        });
      }
    });

    // ── Section 3: Inventory — cross-field rules (validateInventory) ───
    const stockQty = Number(currentVariant.stockQuantity || 0);
    const safetyStock = Number(currentVariant.safetyStock || 0);
    const minLevel = Number(currentVariant.minStockLevel || 0);
    const reorderPoint = Number(currentVariant.reorderPoint || 0);
    const maxLevel = Number(currentVariant.maxStockLevel || 0);
    const leadTimeDays = Number(currentVariant.leadTimeDays || 0);
    const avgDailySales = Number((currentVariant as any).avgDailySales || 0);

    const inventoryRuleErrors = validateInventory(
      stockQty, safetyStock, minLevel, reorderPoint, maxLevel, leadTimeDays, avgDailySales
    );
    inventoryRuleErrors.forEach(e => {
      // Skip duplicates already caught by required-field check
      const isDup = issues.some(i => i.section === 'inventory' && i.field === e.field);
      if (!isDup) {
        issues.push({ section: 'inventory', field: e.field, severity: e.severity, message: e.message });
      }
    });

    // ── Section 4: Warranty ────────────────────────────────────────────
    if (!currentVariant.warrantyPeriod) {
      issues.push({
        section: 'warranty', field: 'warrantyPeriod', severity: 'error',
        message: 'Warranty Period is required.'
      });
    }

    // ── Gate on errors (warnings pass through) ─────────────────────────
    const blockingIssues = issues.filter(i => i.severity === 'error');

    if (blockingIssues.length > 0) {
      setValidationIssues(issues);
      setShowValidation(true);
      // Scroll to validation panel
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      return; // ← stop here, do NOT add variant
    }

    // ── All clear — build and save variant ────────────────────────────
    const newVariant: ProductVariant = {
      id: editingVariantId || variantId,
      sku: currentVariant.sku || '',
      attributes: currentVariant.attributes || {},
      marketplacePricing: addedMarketplacePricing,
      stockQuantity: Number(currentVariant.stockQuantity || 0),
      minStockLevel: Number(currentVariant.minStockLevel || 0),
      maxStockLevel: Number(currentVariant.maxStockLevel || 0),
      reorderPoint: Number(currentVariant.reorderPoint || 0),
      safetyStock: Number(currentVariant.safetyStock || 0),
      leadTimeDays: Number(currentVariant.leadTimeDays || 0),
      stockLocation: currentVariant.stockLocation || '',
      warehouseId: currentVariant.warehouseId || '',
      binLocation: currentVariant.binLocation || '',
      productStatusId: currentVariant.productStatusId || '',
      conditionId: currentVariant.conditionId || '',
      supplierId: currentVariant.supplierId || '',
      warehouseStatusId: currentVariant.warehouseStatusId || '',
      featured: currentVariant.featured || false,
      warranty: currentVariant.warranty || '',
      warrantyPeriod: currentVariant.warrantyPeriod || '',
    };

    if (editingVariantId) {
      setVariants(p => p.map(v => v.id === editingVariantId ? newVariant : v));
      setEditingVariantId(null);
    } else {
      setVariants(p => [...p, newVariant]);
    }

    // ── Success feedback ──────────────────────────────────────────────
    toast.success(editingVariantId ? 'Variant updated successfully!' : 'Variant added successfully!');
    setShowValidation(false);
    setSubmitAttempted(false);
    setValidationIssues([]);
    resetForm();
  };

  const resetForm = () => {
    setVariantId(`variant-${Date.now()}`);
    setCurrentVariant({
      sku: '', attributes: {}, marketplacePricing: [],
      stockQuantity: 0, minStockLevel: 0, maxStockLevel: 0, reorderPoint: 0,
      stockLocation: '', warehouseId: '', binLocation: '',
      supplierId: '', productStatusId: '', conditionId: '', warehouseStatusId: '',
      featured: false, safetyStock: 0, leadTimeDays: 0, warranty: '', warrantyPeriod: '',
    });
    setAddedMarketplacePricing([]);
    setCurrentMarketplacePricing({ marketplaceId: '', marketplaceName: '', costPrice: 0, sellingPrice: 0, retailPrice: 0, discountPercentage: 0, taxId: '', taxRate: 0, vatExempt: false });
    setSelectedMarketplace('');
    setShowPricingForm(false);
    setShowValidation(false);
    setSubmitAttempted(false);
    setValidationIssues([]);
  };

  const editVariant = (variant: ProductVariant) => {
    setCurrentVariant(variant);
    setAddedMarketplacePricing(variant.marketplacePricing || []);
    setEditingVariantId(variant.id);
    setShowValidation(false);
    setSubmitAttempted(false);
  };

  const deleteVariant = (id: string) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      setVariants(p => p.filter(v => v.id !== id));
    }
  };

  const cancelEdit = () => { 
    setVariantId(`variant-${Date.now()}`);
    resetForm(); 
    setEditingVariantId(null); 
  };


  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-20 -z-10" />

      <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

        <CardContent className="p-8 space-y-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg"
            >
              <Ruler className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Product Variants Configuration
              </h2>
              <p className="text-sm text-gray-600">Configure attributes, variants, pricing and stock</p>
            </div>
          </div>

          {hasDynamicFields ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h4 className="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  {editingVariantId ? 'Edit Product Variant' : 'Add New Product Variant'}
                </h4>

                {/* SKU */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Product SKU (Stock Keeping Unit)
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={currentVariant.sku}
                    onChange={(e) => handleVariantFieldChange('sku', e.target.value)}
                    placeholder="e.g., PROD-RED-LG-001"
                    className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-lg ${submitAttempted && !currentVariant.sku
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-blue-300 focus:border-blue-500'
                      }`}
                  />
                  {submitAttempted && !currentVariant.sku && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> SKU is required
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Unique identifier for this variant (e.g., PRODUCT-COLOR-SIZE-###)
                  </p>
                </div>

                {/* ── Attributes ── */}
                <div className="mb-6" ref={attributesRef}>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    Product Attributes
                  </h5>
                  <AttributesSection
                    attributes={attributes}
                    currentVariant={currentVariant}
                    onAttributeChange={handleAttributeChange}
                  />
                  {/* Show missing required attributes after submit attempt */}
                  {submitAttempted && attributes.some((a: any) => a.isRequired && !currentVariant.attributes?.[a._id!]) && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                    >
                      {attributes
                        .filter((a: any) => a.isRequired && !currentVariant.attributes?.[a._id!])
                        .map((a: any) => (
                          <p key={a._id} className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {`"${a.attributeName}" is required`}
                          </p>
                        ))}
                    </motion.div>
                  )}
                </div>

                {/* ── Marketplace Pricing ── */}
                <div className="mb-6" ref={pricingRef}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-green-600" />
                      <h5 className="text-sm font-bold text-gray-800">Marketplace-Specific Pricing</h5>
                    </div>
                    
                  </div>

                  {/* Missing pricing alert after submit attempt */}
                  {submitAttempted && addedMarketplacePricing.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <p className="text-xs font-semibold text-red-700">
                        At least one marketplace pricing must be configured before adding this variant.
                      </p>
                    </motion.div>
                  )}


                 

             
                    <div className="space-y-3 mb-4">
                      <AnimatePresence>
                        {addedMarketplacePricing.map((pricing, index) => {
                          const cost = pricing.costPrice || 0;
                          const selling = pricing.sellingPrice || 0;
                          const profit = selling - cost;
                          const margin = selling > 0 ? (profit / selling) * 100 : 0;
                          return (
                            <motion.div
                              key={pricing.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-4 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Store className="h-4 w-4 text-green-600" />
                                    <h6 className="font-bold text-gray-800">{pricing.marketplaceName}</h6>
                                    {pricing.vatExempt && <Badge className="bg-green-500 text-white text-xs">VAT Exempt</Badge>}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><p className="text-xs text-gray-600">Cost Price</p><p className="font-semibold text-gray-900">{currencySymbol}{cost.toFixed(2)}</p></div>
                                    <div><p className="text-xs text-gray-600">Selling Price</p><p className="font-bold text-green-700">{currencySymbol}{selling.toFixed(2)}</p></div>
                                    <div><p className="text-xs text-gray-600">Profit</p><p className={`font-semibold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{currencySymbol}{profit.toFixed(2)}</p></div>
                                    <div><p className="text-xs text-gray-600">Margin</p><p className={`font-bold ${margin >= 0 ? 'text-teal-700' : 'text-red-700'}`}>{margin.toFixed(1)}%</p></div>
                                  </div>
                                  {pricing.discountPercentage && pricing.discountPercentage > 0 && (
                                    <div className="mt-2"><Badge className="bg-orange-500 text-white text-xs">{pricing.discountPercentage}% Discount</Badge></div>
                                  )}
                                </div>
                                <button type="button" onClick={() => removeMarketplacePricing(pricing.marketplaceId)}
                                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
               

                  {/* Pricing form */}
                  <AnimatePresence>
                  
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h6 className="font-bold text-gray-800 flex items-center gap-2">
                              <Store className="h-5 w-5 text-blue-600" />
                              Pricing for: {currentMarketplacePricing.marketplaceName}
                            </h6>
                            <button type="button"
                              onClick={() => { setShowPricingForm(false); setSelectedMarketplace(''); setCurrentMarketplacePricing({ marketplaceId: '', marketplaceName: '', costPrice: 0, sellingPrice: 0, retailPrice: 0, discountPercentage: 0, taxId: '', taxRate: 0, vatExempt: false }); }}
                              className="p-1 text-gray-600 hover:bg-white rounded-lg transition-colors">
                              <EyeOff className="h-4 w-4" />
                            </button>
                          </div>

                          <PricingSection
                            currentVariant={currentMarketplacePricing}
                            currencySymbol={currencySymbol}
                            taxes={taxes}
                            onVariantFieldChange={handleMarketplacePricingChange}
                            onTaxChange={handleTaxChange}
                            onVatExemptChange={handleVatExemptChange}
                            onValidationChange={setPricingHasErrors}
                          />

                          <div className="mt-4 flex gap-3">
                            <button
                              type="button"
                              onClick={addMarketplacePricing}
                              disabled={pricingHasErrors}
                              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${pricingHasErrors
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                }`}
                            >
                              {pricingHasErrors ? (
                                <><AlertCircle className="h-5 w-5" /> Fix Pricing Errors First</>
                              ) : (
                                <><Plus className="h-5 w-5" /> Add Marketplace Pricing</>
                              )}
                            </button>
                            <button type="button"
                              onClick={() => { setShowPricingForm(false); setSelectedMarketplace(''); }}
                              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    
                  </AnimatePresence>

                  
                </div>

                {/* ── Inventory ── */}
                <div className="mb-6" ref={inventoryRef}>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Stock & Inventory (Common Across All Marketplaces)
                  </h5>
                  <InventorySection
                    currentVariant={currentVariant}
                    warehouses={warehouses}
                    warehouseStatus={warehouseStatus}
                    productStatus={productStatus}
                    conditions={conditions}
                    onVariantFieldChange={handleVariantFieldChange}
                    supplierApiUrl="/suppliers"
                    forceShowErrors={submitAttempted}
                  />
                </div>

                {/* ── Warranty ── */}
                <div className="mb-6" ref={warrantyRef}>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Warranty Information
                  </h5>
                  <WarrantySection
                    currentVariant={currentVariant}
                    onVariantFieldChange={handleVariantFieldChange}
                  />
                  {submitAttempted && !currentVariant.warrantyPeriod && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> Warranty Period is required
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* ── Professional Validation Panel ── */}
                <AnimatePresence>
                  {showValidation && validationIssues.length > 0 && (
                    <div ref={panelRef} className="mb-6">
                      <ValidationPanel
                        issues={validationIssues}
                        onDismiss={() => setShowValidation(false)}
                        onScrollTo={scrollToSection}
                      />
                    </div>
                  )}
                </AnimatePresence>

                {/* ── Action Buttons ── */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <Button
                    type="button"
                    onClick={addVariant}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {editingVariantId ? (
                      <><Save className="h-6 w-6" /> Update Variant</>
                    ) : (
                      <><Plus className="h-6 w-6" /> Add Variant</>
                    )}
                  </Button>
                  {editingVariantId && (
                    <button type="button" onClick={cancelEdit}
                      className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl border-2 border-gray-200"
            >
              <motion.div className="inline-block mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-gray-200 to-slate-300 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Attributes Available</h3>
              <p className="text-gray-500 mb-4">Please select a category in Step 1 to see available attributes</p>
            </motion.div>
          )}

          {/* Variants Summary */}
          {variants.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Product Variants ({variants.length})
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">{variants.length} Variant{variants.length !== 1 ? 's' : ''}</Badge>
                  <Badge className="bg-blue-500 text-white">{variants.filter(v => v.featured).length} Featured</Badge>
                </div>
              </div>
              <VariantSummary
                variants={variants}
                attributes={attributes}
                currencySymbol={currencySymbol}
                productStatus={productStatus}
                conditions={conditions}
                onEditVariant={editVariant}
                onDeleteVariant={deleteVariant}
              />
            </motion.div>
          )}

          <InfoBoxSection />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AttributesAndPricingStep;