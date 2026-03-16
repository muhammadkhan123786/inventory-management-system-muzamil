// components/product/ProductTableView.tsx
import { Badge } from "@/components/form/Badge";
import { Button } from "@/components/form/CustomButton";
import { Star, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Product, ProductListItem, CategoryInfo } from "../types/product";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ProductTableViewProps {
  products: ProductListItem[];
  onView: (product: any) => void;
  onEdit: (product: any) => void;
  onDelete: (product: ProductListItem) => void;
  getStockBadge: (status: string) => { class: string; icon: any };
  currencySymbol: string;
}

export const ProductTableView = ({
  products,
  onView,
  onEdit,
  onDelete,
  getStockBadge,
  currencySymbol
}: ProductTableViewProps) => {
  const getCategoryBadgeColor = (level: number): string => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-300", // Level 1
      "bg-cyan-100 text-cyan-700 border-cyan-300", // Level 2
      "bg-teal-100 text-teal-700 border-teal-300", // Level 3
      "bg-emerald-100 text-emerald-700 border-emerald-300", // Level 4
      "bg-green-100 text-green-700 border-green-300", // Level 5
      "bg-lime-100 text-lime-700 border-lime-300", // Level 6
    ];

    // If level exceeds our color array, cycle through colors
    return colors[(level - 1) % colors.length];
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category Hierarchy
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => {
                const stockInfo = getStockBadge(product.stockStatus);
                const StockIcon = stockInfo.icon;

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {product.manufacturer}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {/* <div className="flex items-center gap-1 text-xs">
                          <Badge className="bg-blue-100 text-blue-700 border border-blue-300 text-xs">
                            L1: {product.categories.level1?.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                          <Badge className="bg-cyan-100 text-cyan-700 border border-cyan-300 text-xs">
                            L2: {product.categories.level2?.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <ChevronRight className="h-3 w-3 text-gray-400 ml-3" />
                          <Badge className="bg-teal-100 text-teal-700 border border-teal-300 text-xs">
                            L3: {product.categories.level3?.name}
                          </Badge>
                        </div> */}
                        {product.categories &&
                          product.categories?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                {product.categories?.map(
                                  (category: CategoryInfo, idx: number) => (
                                    <div
                                      key={category.id}
                                      className="flex items-center gap-1"
                                    >
                                      {idx > 0 && (
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                      )}
                                      <Badge
                                        className={`text-xs border ${getCategoryBadgeColor(category.level)}`}
                                      >
                                        {category.name}
                                      </Badge>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Show category path as text (alternative view) */}
                              <p className="text-xs text-gray-500 italic">
                                {product.categories
                                  ?.map((cat: any) => cat.name)
                                  .join(" → ")}
                              </p>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {currencySymbol}{product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cost: {currencySymbol}{product?.costPrice?.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                              On Hand:
                            </span>
                            <span className="font-bold text-indigo-700">
                              {product.onHand}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">
                              Reserved:
                            </span>
                            <span className="font-bold text-amber-700">
                              {product.reserved}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-indigo-200 pt-1.5">
                            <span className="text-gray-600 font-medium">
                              Available:
                            </span>
                            <span className="font-bold text-emerald-700">
                              {product.available}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-indigo-200 pt-1.5">
                            <span className="text-gray-600 font-medium">
                              Reorder:
                            </span>
                            <span className="font-bold text-purple-700">
                              {product.reorderLevel} / {product.reorderQuantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.stockQuantity} units
                        </p>
                        <Badge className={`${stockInfo.class} gap-1 mt-1`}>
                          <StockIcon className="h-3 w-3" />
                          {product.stockStatus.replace("-", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          product.status === "active"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : product.status === "inactive"
                              ? "bg-gray-100 text-gray-700 border border-gray-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                        }
                      >
                        {product.status}
                      </Badge>
                      {product.featured && (
                        <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 ml-1 mt-1">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-xs text-gray-500">
                          ({product.totalReviews})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
