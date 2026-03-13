import { Badge } from "@/components/form/Badge";
import { Button } from "@/components/form/CustomButton";
import { Card, CardContent } from "@/components/form/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/form/Dialog";
import {
  X,
  Star,
  ChevronRight,
  Package,
  DollarSign,
  Tag,
  Archive,
  TrendingUp,
  Factory,
  Ruler,
  Weight,
  Shield,
  Edit,
  Trash2,
  Package2,
} from "lucide-react";
import { Product, ProductListItem, CategoryInfo } from "../types/product";

interface ProductDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductListItem | null;
  getStockBadge: (status: string) => { class: string; icon: any };
  onDelete: any;
}

export default function ProductDetailsModal({
  open,
  onOpenChange,
  product,
  getStockBadge,
  onDelete,
}: ProductDetailsModalProps) {
  if (!product) return null;
  console.log("pro", product);
console.log("product.categories", product.categories)
  const profitMargin = product.price - product?.costPrice;
  const profitPercentage = ((profitMargin / product?.costPrice) * 100)?.toFixed(
    1,
  );

  const getCategoryBadgeColor = (level: number): string => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-300',      // Level 1
    'bg-cyan-100 text-cyan-700 border-cyan-300',      // Level 2
    'bg-teal-100 text-teal-700 border-teal-300',      // Level 3
    'bg-emerald-100 text-emerald-700 border-emerald-300', // Level 4
    'bg-green-100 text-green-700 border-green-300',   // Level 5
    'bg-lime-100 text-lime-700 border-lime-300',      // Level 6
  ];
  
  // If level exceeds our color array, cycle through colors
  return colors[(level - 1) % colors.length];
};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 -mx-6 -mt-6 px-6 py-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                {product.sku}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-3">
                {product.featured && (
                  <Badge className="bg-yellow-400 text-yellow-900 gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </Badge>
                )}
                <Badge
                  className={
                    product.status === "active"
                      ? "bg-green-400 text-green-900"
                      : product.status === "inactive"
                        ? "bg-gray-400 text-gray-900"
                        : "bg-red-400 text-red-900"
                  }
                >
                  {product.status}
                </Badge>
                <Badge className={getStockBadge(product.stockStatus).class}>
                  {product.stockStatus.replace("-", " ")}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-4">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Pricing & Rating */}
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                    Pricing Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-indigo-200">
                      <span className="text-sm text-gray-600">
                        Retail Price:
                      </span>
                      <span className="text-3xl font-bold text-indigo-700">
                        £{product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cost Price:</span>
                      <span className="text-lg font-semibold text-gray-700">
                        £{product.costPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-indigo-200">
                      <span className="text-sm text-gray-600 font-medium">
                        Profit Margin:
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        £{profitMargin.toFixed(2)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({profitPercentage}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-600" />
                    Customer Rating
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-600">
                        {product.rating}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product?.rating ?? 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 text-center border-l border-amber-200 pl-4">
                      <div className="text-2xl font-bold text-gray-700">
                        {product.totalReviews}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Total Reviews
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>

          {/* Description */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Package2 className="h-4 w-4 text-blue-600" />
                Product Description
              </h3>
              <p className="text-gray-700">{product.description}</p>
            </CardContent>
          </Card>

          {/* Category Hierarchy */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-cyan-600" />
                Category Hierarchy
              </h3>
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Level 1:</span>
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-300">
                    {product.categories.level1?.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Level 2:</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Badge className="bg-cyan-100 text-cyan-700 border border-cyan-300">
                    {product.categories.level2?.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-24">Level 3:</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-6" />
                  <Badge className="bg-teal-100 text-teal-700 border border-teal-300">
                    {product.categories.level3?.name}
                  </Badge>
                </div>
              </div> */}
              {product.categories && product.categories?.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              {product.categories?.map((category: CategoryInfo, idx: number) => (
                                <div key={category.id} className="flex items-center gap-1">
                                  {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                                  <Badge className={`text-xs border ${getCategoryBadgeColor(category.level)}`}>
                                    {category.name}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            
                            {/* Show category path as text (alternative view) */}
                            <p className="text-xs text-gray-500 italic">
                              {product.categories?.map((cat: any) => cat.name).join(' → ')}
                            </p>
                          </div>
                        )}
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Archive className="h-4 w-4 text-indigo-600" />
                Inventory Management
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="text-xs text-gray-600 mb-1">On Hand</div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {product.onHand}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="text-xs text-gray-600 mb-1">Reserved</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {product.reserved}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="text-xs text-gray-600 mb-1">Available</div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {product.available}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-xs text-gray-600 mb-1">
                    Reorder Point
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {product.reorderLevel} / {product.reorderQuantity}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">level / qty</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Product Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Factory className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Manufacturer</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {product.manufacturer}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Ruler className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Dimensions</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {product.dimensions}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Weight className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Weight</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {product.weight}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">
                      Warranty Coverage
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {product.warranty}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
            {/* <Button variant="outline" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button> */}
            <Button
  variant="outline"
  className="text-red-600 hover:bg-red-50 hover:text-red-700"
   onClick={() => onDelete(product)}
  >
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
