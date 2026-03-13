'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

// Data
import { 
  MARKETPLACES, 
  PRODUCTS 
} from '../data/marketplaceData';

// Components
import { AnimatedBackground } from './AnimatedBackground';
import { DashboardHeader } from './DashboardHeader';
import { StatCard } from './StatCard';
import { MarketplaceCard } from './MarketplaceCard';
import { ChartCard } from './ChartCard';
import { ProductDistributionTable } from './ProductDistributionTable';

// Charts
import { AllocationBarChart } from './AllocationBarChart';
import { DistributionPieChart } from './DistributionPieChart';
import { RevenueBarChart } from './RevenueBarChart';

export default function MarketplaceDistribution() {
  const [marketplaces] = useState(MARKETPLACES);
  const [products] = useState(PRODUCTS);

  // Calculate totals
  const totalAllocated = marketplaces.reduce((sum, m) => sum + m.allocated, 0);
  const totalSold = marketplaces.reduce((sum, m) => sum + m.sold, 0);
  const totalRevenue = marketplaces.reduce((sum, m) => sum + m.revenue, 0);
  const totalAvailable = totalAllocated - totalSold;

  // Prepare chart data
  const allocationChartData = marketplaces.map(m => ({
    name: m.name,
    Allocated: m.allocated,
    Sold: m.sold,
    Available: m.allocated - m.sold
  }));

  const pieChartData = marketplaces.map(m => ({
    name: m.name,
    value: m.allocated,
    color: m.color
  }));

  const revenueChartData = marketplaces.map(m => ({
    name: m.name,
    Revenue: m.revenue,
    color: m.color
  }));

  return (
    <div className="space-y-6 relative">
      <AnimatedBackground />

      <DashboardHeader 
        title="Marketplace Distribution"
        subtitle="Inventory allocation across all sales channels"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Allocated"
          value={totalAllocated}
          subtitle="Units"
          icon={Package}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          color="text-blue-100"
          delay={0.1}
        />

        <StatCard
          title="Total Sold"
          value={totalSold}
          subtitle="Units"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          color="text-green-100"
          delay={0.2}
        />

        <StatCard
          title="Available"
          value={totalAvailable}
          subtitle="Units"
          icon={Package}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          color="text-purple-100"
          delay={0.3}
        />

        <StatCard
          title="Total Revenue"
          value={`£${totalRevenue.toLocaleString()}`}
          subtitle="GBP"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          color="text-orange-100"
          delay={0.4}
        />
      </div>

      {/* Marketplace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketplaces.map((marketplace, index) => (
          <MarketplaceCard 
            key={marketplace.name}
            marketplace={marketplace}
            index={index}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Inventory Allocation & Sales"
          icon={BarChart3}
          iconColor="text-indigo-600"
          gradient="bg-gradient-to-r from-blue-500 to-purple-500"
          delay={0.5}
        >
          <AllocationBarChart data={allocationChartData} />
        </ChartCard>

        <ChartCard
          title="Distribution Breakdown"
          icon={PieChartIcon}
          iconColor="text-pink-600"
          gradient="bg-gradient-to-r from-pink-500 to-orange-500"
          delay={0.6}
        >
          <DistributionPieChart data={pieChartData} />
        </ChartCard>
      </div>

      {/* Revenue Chart */}
      <ChartCard
        title="Revenue by Marketplace"
        icon={DollarSign}
        iconColor="text-green-600"
        gradient="bg-gradient-to-r from-green-500 to-emerald-500"
        delay={0.7}
      >
        <RevenueBarChart data={revenueChartData} />
      </ChartCard>

      {/* Product Distribution Table */}
      <ProductDistributionTable />
    </div>
  );
}