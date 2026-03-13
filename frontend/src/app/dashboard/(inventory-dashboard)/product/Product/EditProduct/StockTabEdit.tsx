import { Input } from "@/components/form/Input";
import { Label } from "@/components/form/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";
import {
  Warehouse,
  AlertCircle,
  Shield,
  MapPin,
  Clock,
  Package,
} from "lucide-react";

interface StockTabProps {
  formData: any;
  updateField: (path: string, value: any) => void;
  warehouses?: any[];
  productStatuses?: any[];
  conditions?: any[];
  warehouseStatuses?: any[];
}

export const StockTab: React.FC<StockTabProps> = ({
  formData,
  updateField,
  warehouses = [],
  productStatuses = [],
  conditions = [],
  warehouseStatuses = [],
}) => {
  const isLowStock =
    formData.stockQuantity <= formData.reorderLevel && formData.reorderLevel > 0;

  const extractId = (item: any): string =>
    item?._id || item?.value || item?.id || "";

  const extractLabel = (item: any): string =>
    item?.label ||
    item?.name ||
    item?.warehouseName ||
    item?.statusName ||
    item?.conditionName ||
    "Unknown";

  return (
    <div className="space-y-6">
      {/* ── Inventory Management ── */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Warehouse className="h-5 w-5" /> Inventory Management
        </h4>

        {/* Quantities */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Stock Quantity *</Label>
            <Input
              type="number"
              value={formData.stockQuantity ?? ""}
              onChange={(e) =>
                updateField("stockQuantity", parseInt(e.target.value) || 0)
              }
              className={isLowStock ? "border-orange-300" : ""}
            />
          </div>
          <div>
            <Label>Min Stock Level</Label>
            <Input
              type="number"
              value={formData.minStockLevel ?? ""}
              onChange={(e) =>
                updateField("minStockLevel", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label>Max Stock Level</Label>
            <Input
              type="number"
              value={formData.maxStockLevel ?? ""}
              onChange={(e) =>
                updateField("maxStockLevel", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        {/* Reorder / Safety / Lead Time */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Reorder Point</Label>
            <Input
              type="number"
              value={formData.reorderLevel ?? ""}
              onChange={(e) =>
                updateField("reorderLevel", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label>Safety Stock</Label>
            <Input
              type="number"
              value={formData.safetyStock ?? ""}
              onChange={(e) =>
                updateField("safetyStock", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Lead Time (days)
            </Label>
            <Input
              type="number"
              value={formData.leadTimeDays ?? ""}
              onChange={(e) =>
                updateField("leadTimeDays", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Stock Location
            </Label>
            <Input
              value={formData.stockLocation || ""}
              onChange={(e) => updateField("stockLocation", e.target.value)}
              placeholder="e.g. Aisle 3, Shelf B"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1">
              <Package className="h-3 w-3" /> Bin Location
            </Label>
            <Input
              value={formData.binLocation || ""}
              onChange={(e) => updateField("binLocation", e.target.value)}
              placeholder="e.g. BIN-A12"
            />
          </div>
        </div>

        {/* Warehouse & Warehouse Status */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Warehouse</Label>
            <Select
              value={formData.warehouseId || ""}
              onValueChange={(v) => updateField("warehouseId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((item) => (
                  <SelectItem key={extractId(item)} value={extractId(item)}>
                    {extractLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Warehouse Status</Label>
            <Select
              value={formData.warehouseStatusId || ""}
              onValueChange={(v) => updateField("warehouseStatusId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {warehouseStatuses.map((item) => (
                  <SelectItem key={extractId(item)} value={extractId(item)}>
                    {extractLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Status & Condition */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Product Status</Label>
            <Select
              value={formData.productStatusId || ""}
              onValueChange={(v) => updateField("productStatusId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {productStatuses.map((item) => (
                  <SelectItem key={extractId(item)} value={extractId(item)}>
                    {extractLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Condition</Label>
            <Select
              value={formData.conditionId || ""}
              onValueChange={(v) => updateField("conditionId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((item) => (
                  <SelectItem key={extractId(item)} value={extractId(item)}>
                    {extractLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <Label>Stock Status</Label>
          <Select
            value={formData.stockStatus || "in-stock"}
            onValueChange={(v) => updateField("stockStatus", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLowStock && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Stock is at or below reorder point!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Warranty ── */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" /> Warranty Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Warranty Type</Label>
            <Input
              value={formData.warrantyType || ""}
              onChange={(e) => updateField("warrantyType", e.target.value)}
              placeholder="e.g. Manufacturer, Extended"
            />
          </div>
          <div>
            <Label>Warranty Period</Label>
            <Select
              value={formData.warrantyPeriod || ""}
              onValueChange={(v) => updateField("warrantyPeriod", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30-days">30 Days</SelectItem>
                <SelectItem value="90-days">90 Days</SelectItem>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="2-years">2 Years</SelectItem>
                <SelectItem value="3-years">3 Years</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};