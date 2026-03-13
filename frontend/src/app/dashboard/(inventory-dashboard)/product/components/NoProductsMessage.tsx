
import { Button } from "@/components/form/CustomButton";
import {
  Package, 
 
} from "lucide-react";
interface NoProductsMessageProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const NoProductsMessage: React.FC<NoProductsMessageProps> = ({
  hasActiveFilters,
  onResetFilters,
}) => (
  <div className="text-center py-12">
    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No products found
    </h3>
    <p className="text-gray-500 mb-4">
      {hasActiveFilters
        ? "Try adjusting your search or filter criteria"
        : "Start by adding your first product"}
    </p>
    {hasActiveFilters && (
      <Button onClick={onResetFilters} variant="outline">
        Clear Filters
      </Button>
    )}
  </div>
);