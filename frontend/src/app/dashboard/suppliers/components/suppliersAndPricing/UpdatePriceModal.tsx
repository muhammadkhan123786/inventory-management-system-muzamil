// components/UpdatePriceModal.tsx
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/form/Dialog";
import { Button }   from "@/components/form/CustomButton";
import { Input }    from "@/components/form/Input";
import { Textarea } from "@/components/form/Textarea";
import { Label }    from "@/components/form/Label";
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle, Package } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Props {
  open:          boolean;
  onOpenChange:  (v: boolean) => void;
  supplierId:    string;
  supplierName:  string;
  productId:     string;
  productName:   string;
  sku:           string;
  currentPrice:  number;
  userId:        string;
  onSuccess:     () => void;
  currencySymbol: string;
}

export function UpdatePriceModal({
  open, onOpenChange,
  supplierId, supplierName,
  productId, productName, sku,
  currentPrice, userId, onSuccess,
  currencySymbol,
}: Props) {
  const [newPrice, setNewPrice] = useState<string>(String(currentPrice));
  const [reason,   setReason]   = useState("");
  const [saving,   setSaving]   = useState(false);

  const num   = parseFloat(newPrice) || 0;
  const diff  = num - currentPrice;
  const pct   = currentPrice > 0 ? (diff / currentPrice * 100) : 0;
  const isUp  = diff > 0.001;
  const isDn  = diff < -0.001;

  const handleSave = async () => {
    if (num <= 0) { toast.error("Price must be greater than 0"); return; }
    if (reason.trim().length < 3) { toast.error("Please enter a reason (min 3 chars)"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/supplier-price-history/manual`, {
        productId, supplierId, sku, newPrice: num,
        changeReason: reason, userId,
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(`Price updated: ${currencySymbol}${currentPrice} → ${currencySymbol}${num}`);
      onSuccess();
      onOpenChange(false);
      setReason("");
      setNewPrice(String(num));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update price");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-5">
          <DialogTitle className="text-white font-bold text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-300" /> Update Supplier Price
          </DialogTitle>
          <p className="text-slate-400 text-xs mt-1">{supplierName}</p>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Context banner */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border text-sm">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{productName}</p>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{sku}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Current</p>
              <p className="font-bold text-gray-900">{currencySymbol}{currentPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* New price input */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              New Cost Price ({currencySymbol}) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">{currencySymbol}</span>
              <Input
                type="number" step="0.01" min="0.01"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                className="pl-8 text-xl font-bold h-12"
                autoFocus
              />
            </div>
          </div>

          {/* Live diff */}
          {newPrice && Math.abs(diff) > 0.001 && (
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium ${
              isUp ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {isUp ? <TrendingUp className="h-5 w-5 shrink-0" /> : <TrendingDown className="h-5 w-5 shrink-0" />}
              <span>
                {isUp ? "Price increase" : "Price decrease"} of{" "}
                <strong>{currencySymbol}{Math.abs(diff).toFixed(2)}</strong>
                {" "}({isUp ? "+" : "-"}{Math.abs(pct).toFixed(1)}%)
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Reason for Change <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='e.g. "Annual price revision", "New contract rate", "GRN invoice discrepancy"'
              rows={3}
              className="resize-none text-sm"
            />
            <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
              <AlertCircle className="h-3 w-3" />
              Saved permanently in price history for audit trail
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2 bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || num <= 0 || reason.trim().length < 3}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white flex items-center justify-center gap-2 border-0"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}