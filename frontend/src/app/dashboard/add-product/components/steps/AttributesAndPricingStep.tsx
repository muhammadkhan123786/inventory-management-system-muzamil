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
  Package, ClipboardList, Tag, ShieldAlert, DollarSign,
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';


import { AttributesSection } from '../sections/AttributesSection';
import { PricingSection } from '../sections/PricingSection';
import { InventorySection } from '../sections/InventorySection';
import { WarrantySection } from '../sections/WarrantySection';

import { Input } from '@/components/form/Input';



import { useCurrencyStore } from "@/stores/currency.store";

import { ProductVariant } from '../../hooks/useProductForm';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ValidationIssue {
  section: 'attributes' | 'pricing' | 'inventory' | 'warranty';
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface SimplePricing {
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId: string;
  taxRate: number;
  vatExempt: boolean;
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
  warrantyOptions?: any[];
  getAllFields?: () => any[];
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
}

// ─── Section label map ─────────────────────────────────────────────────────────
const SECTION_META = {
  attributes: { label: 'Product Attributes', icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  pricing: { label: 'Pricing', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  inventory: { label: 'Stock & Inventory', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  warranty: { label: 'Warranty', icon: ShieldAlert, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
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
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-500 to-rose-600">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Variant Cannot Be Added</p>
            <p className="text-xs text-red-100">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
              {warningCount > 0 && ` · ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button onClick={onDismiss} className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
          <XCircle className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {(Object.keys(grouped) as ValidationIssue['section'][]).map((section) => {
          const meta = SECTION_META[section];
          const SIcon = meta.icon;
          const sIssues = grouped[section];
          const hasErrors = sIssues.some(i => i.severity === 'error');

          return (
            <div key={section} className={`rounded-lg border p-3 ${meta.bg}`}>
              <button onClick={() => onScrollTo(section)} className="w-full flex items-center justify-between mb-2 group">
                <div className="flex items-center gap-2">
                  <SIcon className={`h-4 w-4 ${meta.color}`} />
                  <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
                  {hasErrors && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {sIssues.filter(i => i.severity === 'error').length}
                    </span>
                  )}
                </div>
                <ChevronRight className={`h-3.5 w-3.5 ${meta.color} group-hover:translate-x-0.5 transition-transform`} />
              </button>
              <div className="space-y-1 pl-6">
                {sIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${issue.severity === 'error' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <p className={`text-xs ${issue.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                      {issue.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function AttributesAndPricingStep({
 
  attributes = [],
   taxes = [],
  warehouses = [],
  warehouseStatus = [],
  productStatus = [],
  conditions = [],
  
  setVariants,
}: AttributesAndPricingStepProps) {

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const attributesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);
  const warrantyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const currencySymbol = useCurrencyStore((s) => s.currencySymbol);



  const [variantId, setVariantId] = useState<string>('');

  // Simple pricing state (no marketplace)
  const [pricing, setPricing] = useState<SimplePricing>({
    costPrice: 0,
    sellingPrice: 0,
    retailPrice: 0,
    discountPercentage: 0,
    taxId: '',
    taxRate: 0,
    vatExempt: false,
  });

  const [currentVariant, setCurrentVariant] = useState<Partial<ProductVariant>>({
    sku: '', attributes: {},
    stockQuantity: 0, minStockLevel: 0, maxStockLevel: 0, reorderPoint: 0,
    stockLocation: '', warehouseId: '', binLocation: '',
    productStatusId: '', conditionId: '', warehouseStatusId: '',
    supplierId: '',
    featured: false, safetyStock: 0, leadTimeDays: 0, warranty: '', warrantyPeriod: '',
  });

  const hasDynamicFields = attributes && attributes.length > 0;

  const handleAttributeChange = (fieldId: string, value: any) =>
    setCurrentVariant(p => ({ ...p, attributes: { ...p.attributes, [fieldId]: value } }));

  const handleVariantFieldChange = (field: string, value: any) =>
    setCurrentVariant(p => ({ ...p, [field]: value }));

  const handlePricingChange = (field: string, value: any) =>
    setPricing(p => ({ ...p, [field]: value }));

  const handleTaxChange = (v: string) => {
    const selectedTax = taxes.find(t => (t._id || t.id) === v);
    setPricing(p => ({ ...p, taxId: v, taxRate: selectedTax?.rate || 0 }));
  };

  const handleVatExemptChange = (v: boolean) =>
    setPricing(p => ({ ...p, vatExempt: v }));

  const addVariant = () => {
    setSubmitAttempted(true);
    const issues: ValidationIssue[] = [];

    // Attributes validation
    const missingAttrs = attributes.filter((a: any) => a.isRequired && !currentVariant.attributes?.[a._id!]);
    missingAttrs.forEach((a: any) => {
      issues.push({
        section: 'attributes',
        field: a._id,
        severity: 'error',
        message: `"${a.attributeName}" is a required attribute.`
      });
    });

    // Pricing validation - simple check
    if (!pricing.costPrice || pricing.costPrice <= 0) {
      issues.push({
        section: 'pricing',
        field: 'costPrice',
        severity: 'error',
        message: 'Cost price is required and must be greater than 0.'
      });
    }
    if (!pricing.sellingPrice || pricing.sellingPrice <= 0) {
      issues.push({
        section: 'pricing',
        field: 'sellingPrice',
        severity: 'error',
        message: 'Selling price is required and must be greater than 0.'
      });
    }
    if (pricing.sellingPrice < pricing.costPrice) {
      issues.push({
        section: 'pricing',
        field: 'sellingPrice',
        severity: 'warning',
        message: 'Selling price is less than cost price. You will incur a loss on each sale.'
      });
    }

    // Warranty validation
    if (!currentVariant.warrantyPeriod) {
      issues.push({
        section: 'warranty',
        field: 'warrantyPeriod',
        severity: 'error',
        message: 'Warranty Period is required.'
      });
    }

    const blockingIssues = issues.filter(i => i.severity === 'error');

    if (blockingIssues.length > 0) {
      setValidationIssues(issues);
      setShowValidation(true);
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      return;
    }

    // Create variant with simple pricing
    const newVariant: any = {
      id: editingVariantId || variantId,
      sku: currentVariant.sku || '',
      attributes: currentVariant.attributes || {},
      pricing: { ...pricing },
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

    toast.success(editingVariantId ? 'Variant updated successfully!' : 'Variant added successfully!');
    setShowValidation(false);
    setSubmitAttempted(false);
    setValidationIssues([]);
    resetForm();
  };

  const resetForm = () => {
    setVariantId(`variant-${Date.now()}`);
    setCurrentVariant({
      sku: '', attributes: {},
      stockQuantity: 0, minStockLevel: 0, maxStockLevel: 0, reorderPoint: 0,
      stockLocation: '', warehouseId: '', binLocation: '',
      supplierId: '', productStatusId: '', conditionId: '', warehouseStatusId: '',
      featured: false, safetyStock: 0, leadTimeDays: 0, warranty: '', warrantyPeriod: '',
    });
    setPricing({
      costPrice: 0, sellingPrice: 0, retailPrice: 0,
      discountPercentage: 0, taxId: '', taxRate: 0, vatExempt: false,
    });
    setShowValidation(false);
    setSubmitAttempted(false);
    setValidationIssues([]);
  };

 

 
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
              <p className="text-sm text-gray-600">Configure attributes, pricing, stock and warranty</p>
            </div>
          </div>

          {hasDynamicFields ? (
            <div className="space-y-6">
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

                {/* Attributes Section */}
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
                  {submitAttempted && attributes.some((a: any) => a.isRequired && !currentVariant.attributes?.[a._id!]) && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      {attributes
                        .filter((a: any) => a.isRequired && !currentVariant.attributes?.[a._id!])
                        .map((a: any) => (
                          <p key={a._id} className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {`"${a.attributeName}" is required`}
                          </p>
                        ))}
                    </div>
                  )}
                </div>

                {/* Simple Pricing Section - No Marketplace */}
                <div className="mb-6" ref={pricingRef}>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h5 className="text-sm font-bold text-gray-800">Pricing Information</h5>
                    <Badge className="bg-green-500 text-white text-xs">Required</Badge>
                  </div>

                  <div className="p-6 bg-white rounded-lg border-2 border-green-200">
                    <PricingSection
                      currentVariant={pricing}
                      currencySymbol={currencySymbol}
                      taxes={taxes}
                      onVariantFieldChange={handlePricingChange}
                      onTaxChange={handleTaxChange}
                      onVatExemptChange={handleVatExemptChange}
                      onValidationChange={() => {}}
                    />
                  </div>

                  {submitAttempted && (!pricing.costPrice || !pricing.sellingPrice) && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Cost price and selling price are required
                      </p>
                    </div>
                  )}
                </div>

                {/* Inventory Section */}
                <div className="mb-6" ref={inventoryRef}>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    Stock & Inventory
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

                {/* Warranty Section */}
                <div className="mb-6" ref={warrantyRef}>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Warranty Information
                  </h5>
                  <WarrantySection
                    currentVariant={currentVariant}
                    onVariantFieldChange={handleVariantFieldChange}
                  />
                  {submitAttempted && !currentVariant.warrantyPeriod && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> Warranty Period is required
                      </p>
                    </div>
                  )}
                </div>

              
              </div>
            </div>
          ) : 
          (
            <div className="p-12 text-center bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl border-2 border-gray-200">
              <div className="inline-block mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-gray-200 to-slate-300 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Attributes Available</h3>
              <p className="text-gray-500 mb-4">Please select a category in Step 1 to see available attributes</p>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AttributesAndPricingStep;