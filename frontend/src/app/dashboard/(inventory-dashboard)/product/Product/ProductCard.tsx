import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/form/Card";
import { Badge } from "@/components/form/Badge";
import { Button } from "@/components/form/CustomButton";
import { Star, ChevronRight, Eye, Edit, Package } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductListItem } from "../types/product";

// ─── Category Helpers ─────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-300",
  "bg-cyan-100 text-cyan-700 border-cyan-300",
  "bg-teal-100 text-teal-700 border-teal-300",
  "bg-emerald-100 text-emerald-700 border-emerald-300",
  "bg-green-100 text-green-700 border-green-300",
  "bg-lime-100 text-lime-700 border-lime-300",
];

const getCategoryBadgeColor = (level: number) =>
  CATEGORY_COLORS[(level - 1) % CATEGORY_COLORS.length];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ProductListItem;
  index: number;
  onView: (product: any) => void;
  onEdit: (product: any) => void;
  getStockBadge: (status: string) => { class: string; icon: any };
  currencySymbol: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProductCard = ({
  product,
  index,
  onView,
  onEdit,
  getStockBadge,
  currencySymbol,
}: ProductCardProps) => {
  const stockInfo = getStockBadge(product.stockStatus);
  const StockIcon = stockInfo.icon;

  // ✅ Handle all image formats
  const rawImage = product.images?.[0];

  let imageUrl = "";

  if (!rawImage) {
    imageUrl = "";
  } else if (rawImage.startsWith("data:image")) {
    imageUrl = rawImage;
  } else if (rawImage.startsWith("http")) {
    imageUrl = rawImage;
  } else {
    imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${rawImage}`;
  }

  const isBase64 = imageUrl.startsWith("data:image");

  console.log("product", product);
  console.log("imageUrl", imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        
        {/* Image Section */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          
          {imageUrl ? (
            isBase64 ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="object-contain w-full h-full bg-gray-50"
                draggable={false}
              />
            ) : (
              <img
                src={imageUrl}
                alt={product.name}               
                className="object-contain w-full h-full bg-gray-50"
                loading="lazy"
                draggable={false}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-20 w-20 text-gray-400" />
            </div>
          )}

          {product.featured && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white gap-1">
                <Star className="h-3 w-3" /> Featured
              </Badge>
            </div>
          )}

          <div className="absolute bottom-3 left-3 z-10">
            <Badge className={`${stockInfo.class} gap-1`}>
              <StockIcon className="h-3 w-3" />
              {product.stockStatus.replace("-", " ")}
            </Badge>
          </div>
        </div>

        {/* Header */}
        <CardHeader className="pb-3 flex-grow">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <p className="text-sm text-gray-500 font-mono">{product.sku}</p>

          {product.categories && product.categories.length > 0 && (
            <div className="mt-3 flex items-center gap-1 flex-wrap">
              {product.categories.map((category: any, idx: number) => (
                <div key={category.id} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                  <Badge
                    className={`text-[10px] px-1.5 py-0 border ${getCategoryBadgeColor(
                      category.level
                    )}`}
                  >
                    {category.name}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-3 pt-0">
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {product.price.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                Cost: {currencySymbol}
                {product?.costPrice?.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">
                Stock: {product.stockQuantity}
              </p>

              {product.rating && (
                <div className="flex items-center gap-1 text-xs text-amber-600 justify-end">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {product.rating}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90"
              onClick={() => onView(product)}
            >
              <Eye className="h-3 w-3 mr-1" /> View
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-gray-200 hover:bg-gray-50"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};