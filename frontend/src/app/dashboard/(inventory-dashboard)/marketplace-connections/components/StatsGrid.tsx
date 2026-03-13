import { CheckCircle2, TrendingUp, ShoppingBag, Activity } from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsGridProps {
  connectedCount: number;
  totalSales: number;
  totalListings: number;
  total24hRevenue: number;
  totalPending: number;
}

export function StatsGrid({
  connectedCount,
  totalSales,
  totalListings,
  total24hRevenue,
  totalPending
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Connected"
        value={connectedCount}
        subtitle="Active Channels"
        icon={CheckCircle2}
        iconBg="from-green-400 to-emerald-500"
        iconColor="shadow-green-500/50"
        textColor="from-green-600 to-emerald-600"
        borderColor="border-green-200"
        delay={0.1}
        iconAnimation="bounce"
      />

      <StatCard
        title="Total Sales"
        value={`£${totalSales.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle="All Time Revenue"
        icon={TrendingUp}
        iconBg="from-yellow-400 to-orange-500"
        iconColor="shadow-yellow-500/50"
        textColor="from-yellow-600 to-orange-600"
        borderColor="border-yellow-200"
        delay={0.15}
        iconAnimation="bounce"
      />

      <StatCard
        title="Active Listings"
        value={totalListings}
        subtitle="Products Listed"
        icon={ShoppingBag}
        iconBg="from-blue-400 to-indigo-500"
        iconColor="shadow-blue-500/50"
        textColor="from-blue-600 to-indigo-600"
        borderColor="border-blue-200"
        delay={0.2}
        iconAnimation="rotate"
      />

      <StatCard
        title="24h Revenue"
        value={`£${total24hRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle={`${totalPending} Pending Orders`}
        icon={Activity}
        iconBg="from-purple-400 to-pink-500"
        iconColor="shadow-purple-500/50"
        textColor="from-purple-600 to-pink-600"
        borderColor="border-purple-200"
        delay={0.25}
        iconAnimation="pulse"
      />
    </div>
  );
}