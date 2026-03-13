
import { motion } from "framer-motion";
export const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 rounded-full blur-3xl"
    />
    <motion.div
      animate={{
        scale: [1.2, 1, 1.2],
        rotate: [90, 0, 90],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 rounded-full blur-3xl"
    />
  </div>
);





  // // Stats Calculation
  // const stats: ProductStats = useMemo(() => {
  //   if (statistics) {
  //     return {
  //       total: statistics.total,
  //       active: statistics.activeCount,
  //       inStock: statistics.inStockCount,
  //       lowStock: statistics.lowStockCount,
  //       outOfStock: statistics.outOfStockCount,
  //       featured: statistics.featuredCount,
  //     };
  //   }

  //   return {
  //     total: products.length,
  //     active: products.filter((p) => p.status === "active").length,
  //     inStock: products.filter((p) => p.stockStatus === "in-stock").length,
  //     lowStock: products.filter((p) => p.stockStatus === "low-stock").length,
  //     outOfStock: products.filter((p) => p.stockStatus === "out-of-stock").length,
  //     featured: products.filter((p) => p.featured).length,
  //   };
  // }, [products, statistics]);