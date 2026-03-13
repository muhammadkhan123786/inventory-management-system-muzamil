import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product } from '../types/products';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'table';
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  viewMode,
  onView,
  onEdit,
  onDelete
}) => {
  if (viewMode === 'table') {
    // Implement table view here
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="grid"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};