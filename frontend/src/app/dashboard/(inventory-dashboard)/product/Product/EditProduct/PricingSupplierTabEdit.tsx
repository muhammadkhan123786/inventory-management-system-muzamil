import { Input } from "@/components/form/Input";
import { Label } from "@/components/form/Label";
import { Switch } from "@/components/form/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Mail,
  Percent,
  Globe,
} from "lucide-react";
import { useState } from "react";

interface PricingSupplierTabProps {
  formData: any;
  updateField: (path: string, value: any) => void;
  onSupplierChange: (supplierId: string) => void;
  suppliers: any[];
  profit: number;
  margin: number;
}

export const PricingSupplierTab: React.FC<PricingSupplierTabProps> = ({
  formData,
  updateField,
  onSupplierChange,
  suppliers,
  profit,
  margin,
}) => {
  const [supplierSearch, setSupplierSearch] = useState("");

  const getSupplierName = (supplier: any): string =>
    supplier?.contactInformation?.primaryContactName ||
    supplier?.supplierIdentification?.legalBusinessName ||
    supplier?.legalBusinessName ||
    "Unnamed Supplier";

  const getSupplierEmail = (supplier: any): string =>
    supplier?.contactInformation?.emailAddress ||
    supplier?.operationalInformation?.orderContactEmail ||
    "";

  const filteredSuppliers = supplierSearch
    ? suppliers.filter((s) => {
        const name = getSupplierName(s).toLowerCase();
        const email = getSupplierEmail(s).toLowerCase();
        const q = supplierSearch.toLowerCase();
        return name.includes(q) || email.includes(q);
      })
    : suppliers;

  const calculateMarkup = () => {
    const cost = formData.costPrice || 0;
    const sell = formData.price || 0;
    if (cost > 0) return (((sell - cost) / cost) * 100).toFixed(1);
    return "0";
  };

  const discountedPrice =
    formData.price && formData.discountPercentage
      ? formData.price - (formData.price * formData.discountPercentage) / 100
      : formData.price || 0;

  const selectedSupplier = suppliers.find((s) => s._id === formData?.supplierId);

  return (
    <div className="space-y-5">

      {/* ── Marketplace ── */}
      {/* <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
        <h4 className="font-semibold text-violet-800 mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4" /> Marketplace
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Marketplace Name</Label>
            <Select
              value={formData?.marketplaceName || "woocommerce"}
              onValueChange={(v) => updateField("marketplaceName", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="woocommerce">WooCommerce</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
                <SelectItem value="etsy">Etsy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Marketplace ID</Label>
            <Input
              value={formData?.marketplaceId || ""}
              onChange={(e) => updateField("marketplaceId", e.target.value)}
              placeholder="Marketplace reference ID"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div> */}

      {/* ── Pricing ── */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Pricing Information
        </h4>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Cost Price (£) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
              <Input
                type="number" step="0.01"
                value={formData?.costPrice ?? ""}
                onChange={(e) => updateField("costPrice", parseFloat(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <Label>Selling Price (£) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
              <Input
                type="number" step="0.01"
                value={formData?.price ?? ""}
                onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <Label>Retail Price (£)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
              <Input
                type="number" step="0.01"
                value={formData?.retailPrice ?? ""}
                onChange={(e) => updateField("retailPrice", parseFloat(e.target.value) || 0)}
                className="pl-7"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <Label>Discount %</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="number" step="0.1" min="0" max="100"
                value={formData?.discountPercentage ?? ""}
                onChange={(e) => updateField("discountPercentage", parseFloat(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label>Tax Rate %</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                type="number" step="0.1" min="0"
                value={formData?.taxRate ?? ""}
                onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">VAT Exempt</Label>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border">
              <Switch
                checked={formData?.vatExempt ?? false}
                onCheckedChange={(c) => updateField("vatExempt", c)}
              />
              <span className="text-sm text-gray-600">
                {formData?.vatExempt ? "Yes — Exempt" : "No — VAT applies"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-lg border-2 border-green-200 text-center">
            <p className="text-xs text-gray-500 mb-1">Gross Profit</p>
            <p className={`text-lg font-bold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
              £{profit.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border-2 border-green-200 text-center">
            <p className="text-xs text-gray-500 mb-1">Margin</p>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className={`h-4 w-4 ${margin >= 0 ? "text-green-600" : "text-red-500"}`} />
              <p className={`text-lg font-bold ${margin >= 0 ? "text-green-600" : "text-red-500"}`}>
                {margin.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg border-2 border-blue-200 text-center">
            <p className="text-xs text-gray-500 mb-1">Markup</p>
            <p className="text-lg font-bold text-blue-600">{calculateMarkup()}%</p>
          </div>
          <div className="p-3 bg-white rounded-lg border-2 border-purple-200 text-center">
            <p className="text-xs text-gray-500 mb-1">After Discount</p>
            <p className="text-lg font-bold text-purple-600">£{discountedPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ── Supplier ── */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Supplier Information
        </h4>

        {selectedSupplier && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {getSupplierName(selectedSupplier)}
              </p>
              {getSupplierEmail(selectedSupplier) && (
                <p className="text-xs text-green-600 mt-0.5">
                  {getSupplierEmail(selectedSupplier)}
                </p>
              )}
            </div>
          </div>
        )}

        <Label className="flex items-center gap-1 mb-2">
          <Users className="h-3.5 w-3.5" /> Change Supplier
        </Label>
        <Select value={formData?.supplierId || ""} onValueChange={onSupplierChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a supplier...">
              {selectedSupplier && getSupplierName(selectedSupplier)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <div className="sticky top-0 bg-white p-2 border-b z-10">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search suppliers..."
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="pl-7 h-8 text-sm"
                />
              </div>
            </div>
            {filteredSuppliers.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No suppliers found</div>
            ) : (
              filteredSuppliers.map((supplier) => (
                <SelectItem key={supplier._id} value={supplier._id} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{getSupplierName(supplier)}</p>
                      {getSupplierEmail(supplier) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {getSupplierEmail(supplier)}
                        </p>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1.5">{suppliers.length} suppliers available</p>
      </div>
    </div>
  );
};