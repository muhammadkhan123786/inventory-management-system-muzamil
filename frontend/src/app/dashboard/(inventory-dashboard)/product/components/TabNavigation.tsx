import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/form/Card";
import { Button } from "@/components/form/CustomButton";
import Link from "next/link";
import {
  Package,
  Plus,
  Grid3x3,
  List,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { TabButton } from "./TabButton";
interface TabNavigationProps {
  activeTab: "products" | "distribution";
  onTabChange: (tab: "products" | "distribution") => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 via-rose-500 via-orange-500 via-amber-500 via-yellow-500 via-lime-500 via-green-500 via-emerald-500 via-teal-500 via-cyan-500 via-sky-500 via-blue-500 via-indigo-500 to-purple-500 animate-gradient" />
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-3">
          <TabButton
            active={activeTab === "products"}
            icon={Package}
            title="Product Listing"
            subtitle="Browse & Manage"
            onClick={() => onTabChange("products")}
            gradient="from-purple-600 via-pink-600 to-rose-600"
          />
          <TabButton
            active={activeTab === "distribution"}
            icon={BarChart3}
            title="Marketplace Distribution"
            subtitle="Multi-Channel Analytics"
            onClick={() => onTabChange("distribution")}
            gradient="from-orange-600 via-amber-600 to-yellow-600"
          />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);