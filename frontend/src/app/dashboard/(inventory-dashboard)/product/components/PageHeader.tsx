
"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/form/Card";
import { Button } from "@/components/form/CustomButton";
import Link from "next/link";
import {
  Package,
  Plus,
  Grid3x3,
  List, 
  RefreshCw,
} from "lucide-react";

interface PageHeaderProps {
  activeTab: "products" | "distribution";
  viewMode: "grid" | "table";
  isLoading: boolean;
  onRefresh: () => void;
  onViewModeChange: (mode: "grid" | "table") => void;
}



const AddProductButton = () => (
  <Button asChild className="bg-white text-cyan-600 hover:bg-white/90">
    <Link href="/dashboard/add-product">
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </Link>
  </Button>
);

interface ViewModeButtonProps {
  mode: "grid" | "table";
  icon: any;
  isActive: boolean;
  onClick: () => void;
}

const ViewModeButton: React.FC<ViewModeButtonProps> = ({
  mode,
  icon: Icon,
  isActive,
  onClick,
}) => (
  <Button
    variant={isActive ? "default" : "outline"}
    onClick={onClick}
    className={
      isActive
        ? "bg-white text-cyan-600 hover:bg-white/90"
        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
    }
  >
    <Icon className="h-4 w-4 mr-2" />
    {mode === "grid" ? "Grid" : "Table"}
  </Button>
);
const HeaderTitle: React.FC<{ activeTab: "products" | "distribution" }> = ({
  activeTab,
}) => (
  <div className="flex items-center gap-4">
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-xl"
    >
      <Package className="h-8 w-8 text-white" />
    </motion.div>
    <div>
      <h1 className="text-4xl font-bold text-white drop-shadow-lg">
        {activeTab === "products"
          ? "Product Listing"
          : "Marketplace Distribution"}
      </h1>
      <p className="text-white/90 mt-1 text-lg">
        {activeTab === "products"
          ? "Browse products by hierarchical categories"
          : "Multi-channel analytics and distribution management"}
      </p>
    </div>
  </div>
);

const HeaderActions: React.FC<PageHeaderProps> = ({
  activeTab,
  viewMode,
  isLoading,
  onRefresh,
  onViewModeChange,
}) => (
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      onClick={onRefresh}
      disabled={isLoading}
      className="bg-white/20 text-white border-white/30 hover:bg-white/30"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
      Refresh
    </Button>

    {activeTab === "products" && (
      <>
        <AddProductButton />
        <ViewModeButton
          mode="grid"
          icon={Grid3x3}
          isActive={viewMode === "grid"}
          onClick={() => onViewModeChange("grid")}
        />
        <ViewModeButton
          mode="table"
          icon={List}
          isActive={viewMode === "table"}
          onClick={() => onViewModeChange("table")}
        />
      </>
    )}
  </div>
);
export const PageHeader: React.FC<PageHeaderProps> = ({
  activeTab,
  viewMode,
  isLoading,
  onRefresh,
  onViewModeChange,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-20 -z-10"></div>
    <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <HeaderTitle activeTab={activeTab} />
          <HeaderActions
            activeTab={activeTab}
            viewMode={viewMode}
            isLoading={isLoading}
            onRefresh={onRefresh}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);