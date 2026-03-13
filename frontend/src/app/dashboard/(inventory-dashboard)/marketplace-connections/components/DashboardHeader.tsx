import { motion } from 'framer-motion';
import { Store, Sparkles, Plus, Zap } from 'lucide-react';
import { Button } from "@/components/form/CustomButton"

interface DashboardHeaderProps {
  onAddMarketplace: () => void;
}

export function DashboardHeader({ onAddMarketplace }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-2xl shadow-2xl p-8 border-2 border-transparent bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0"
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Store className="h-10 w-10 text-indigo-600" />
            </motion.div>
            Marketplace Connections
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2 text-lg"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Manage integrations with e-commerce platforms
          </motion.p>
        </div>
        
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onAddMarketplace}
            className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 border-0 px-6 py-6 text-lg"
          >
            <Plus className="h-6 w-6" />
            Add Marketplace
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}