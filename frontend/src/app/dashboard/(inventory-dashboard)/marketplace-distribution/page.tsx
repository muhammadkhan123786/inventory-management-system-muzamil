'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, TrendingUp, DollarSign, BarChart3,
  PieChart as PieChartIcon, Activity, ArrowUpRight,
  ArrowDownRight, Target, Award, Flame, Shield,
  AlertTriangle, CheckCircle, RefreshCw, Star,
  ChevronRight, TrendingDown, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, AreaChart, Area, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';

// Data
import { MARKETPLACES, PRODUCTS } from './data/marketplaceData';

// Your existing components — untouched
import { AnimatedBackground }        from './components/AnimatedBackground';
import { DashboardHeader }           from './components/DashboardHeader';
import { StatCard }                  from './components/StatCard';
import { MarketplaceCard }           from './components/MarketplaceCard';
import { ChartCard }                 from './components/ChartCard';
import { ProductDistributionTable }  from './components/ProductDistributionTable';
import { AllocationBarChart }        from './components/AllocationBarChart';
import { DistributionPieChart }      from './components/DistributionPieChart';
import { RevenueBarChart }           from './components/RevenueBarChart';

// ── Static profit/analytics data (add to your marketplaceData.ts later) ───────

const PROFIT_DATA = [
  { id: 'woocommerce', name: 'WooCommerce', color: '#7c3aed', bgGrad: 'from-purple-500 to-purple-600', revenue: 48960, cogs: 28400, orders: 198, returns: 8,  aov: 247.27, convRate: 3.8, rating: 4.7, trend: +12.4, monthlySales: [28,34,22,38,42,51,48,55,62,58,71,68] },
  { id: 'ebay',        name: 'eBay',         color: '#f59e0b', bgGrad: 'from-yellow-500 to-amber-600',  revenue: 38560, cogs: 21800, orders: 241, returns: 14, aov: 159.92, convRate: 5.2, rating: 4.4, trend: +8.1,  monthlySales: [22,18,26,31,28,35,38,42,39,45,48,51] },
  { id: 'shopify',     name: 'Shopify',      color: '#10b981', bgGrad: 'from-emerald-500 to-green-600', revenue: 31480, cogs: 17200, orders: 142, returns: 5,  aov: 221.69, convRate: 4.1, rating: 4.8, trend: +18.7, monthlySales: [12,15,18,22,19,24,28,32,35,38,42,46] },
  { id: 'tiktok',      name: 'TikTok Shop',  color: '#ec4899', bgGrad: 'from-pink-500 to-rose-600',    revenue: 14550, cogs:  7800, orders:  97, returns: 3,  aov: 149.90, convRate: 6.8, rating: 4.5, trend: +34.2, monthlySales: [4,6,8,9,12,14,18,22,19,24,28,31] },
];

const PRODUCT_DETAILS = [
  { id:'p1', name:'Perferendis veniam Pro',  sku:'PVP-001', category:'Electronics', totalStock:145, costPrice:94,  basePrice:599.97, margin:36.2, status:'active',    trend:+14, distribution:{ woocommerce:52, ebay:48, shopify:30, tiktok:15 }, revenue:{ woocommerce:31198, ebay:28798, shopify:17999, tiktok:8998 } },
  { id:'p2', name:'Obcaecati quos beata X',  sku:'OQB-002', category:'Accessories', totalStock:203, costPrice:42,  basePrice:189.99, margin:42.8, status:'active',    trend:+8,  distribution:{ woocommerce:68, ebay:72, shopify:41, tiktok:22 }, revenue:{ woocommerce:12919, ebay:13679, shopify:7789, tiktok:4179 } },
  { id:'p3', name:'Esse quis temporibus',    sku:'EQT-003', category:'Home',        totalStock:41,  costPrice:156, basePrice:449.99, margin:28.8, status:'low-stock', trend:-7,  distribution:{ woocommerce:14, ebay:15, shopify:8,  tiktok:4  }, revenue:{ woocommerce:6299,  ebay:6749,  shopify:3599, tiktok:1799 } },
  { id:'p4', name:'Nobis ut quod earum',     sku:'NUQ-004', category:'Fashion',     totalStock:312, costPrice:18,  basePrice:79.99,  margin:55.1, status:'active',    trend:+22, distribution:{ woocommerce:98, ebay:72, shopify:48, tiktok:44 }, revenue:{ woocommerce:7839,  ebay:5759,  shopify:3839, tiktok:3519 } },
  { id:'p5', name:'Magni sunt omnis sus',    sku:'MSO-005', category:'Electronics', totalStock:89,  costPrice:28,  basePrice:129.99, margin:31.5, status:'low-stock', trend:-3,  distribution:{ woocommerce:28, ebay:34, shopify:18, tiktok:9  }, revenue:{ woocommerce:3639,  ebay:4419,  shopify:2339, tiktok:1169 } },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const totalRevenue   = PROFIT_DATA.reduce((s, m) => s + m.revenue, 0);
const totalCOGS      = PROFIT_DATA.reduce((s, m) => s + m.cogs, 0);
const totalProfit    = totalRevenue - totalCOGS;
const totalOrders    = PROFIT_DATA.reduce((s, m) => s + m.orders, 0);
const totalReturns   = PROFIT_DATA.reduce((s, m) => s + m.returns, 0);
const profitMargin   = ((totalProfit / totalRevenue) * 100).toFixed(1);
const returnRate     = ((totalReturns / totalOrders) * 100).toFixed(1);

// ── Shared custom tooltip (light theme) ───────────────────────────────────────
const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-xl text-xs">
      <p className="font-bold text-gray-600 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && String(p.name).includes('Revenue') ? `£${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',        icon: BarChart3  },
  { id: 'profit',    label: 'Profit',          icon: DollarSign },
  { id: 'products',  label: 'Products',        icon: Package    },
  { id: 'analytics', label: 'Analytics',       icon: Activity   },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function MarketplaceDistribution() {
  const [activeTab, setActiveTab] = useState('overview');

  // Keep your original computed values
  const marketplaces   = PROFIT_DATA; // same shape as MARKETPLACES
  const totalAllocated = MARKETPLACES.reduce((sum, m) => sum + m.allocated, 0);
  const totalSold      = MARKETPLACES.reduce((sum, m) => sum + m.sold, 0);
  const totalAvailable = totalAllocated - totalSold;

  const allocationChartData = MARKETPLACES.map(m => ({
    name: m.name, Allocated: m.allocated, Sold: m.sold, Available: m.allocated - m.sold,
  }));
  const pieChartData    = MARKETPLACES.map(m => ({ name: m.name, value: m.allocated, color: m.color }));
  const revenueChartData = MARKETPLACES.map(m => ({ name: m.name, Revenue: m.revenue, color: m.color }));

  return (
    <div className="space-y-6 relative">
      <AnimatedBackground />

      <DashboardHeader
        title="Marketplace Distribution"
        subtitle="Inventory allocation across all sales channels"
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
        <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200 shadow-sm w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
              }`}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════════════════════════════
            TAB: OVERVIEW  ← your original code, 100% unchanged
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Allocated" value={totalAllocated} subtitle="Units"     icon={Package}    gradient="bg-gradient-to-br from-blue-500 to-blue-600"   color="text-blue-100"   delay={0.1} />
              <StatCard title="Total Sold"      value={totalSold}      subtitle="Units"     icon={TrendingUp} gradient="bg-gradient-to-br from-green-500 to-green-600" color="text-green-100"  delay={0.2} />
              <StatCard title="Available"       value={totalAvailable} subtitle="Units"     icon={Package}    gradient="bg-gradient-to-br from-purple-500 to-purple-600" color="text-purple-100" delay={0.3} />
              <StatCard title="Total Revenue"   value={`£${PROFIT_DATA.reduce((s,m)=>s+m.revenue,0).toLocaleString()}`} subtitle="GBP" icon={DollarSign} gradient="bg-gradient-to-br from-orange-500 to-orange-600" color="text-orange-100" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MARKETPLACES.map((marketplace, index) => (
                <MarketplaceCard key={marketplace.name} marketplace={marketplace} index={index} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Inventory Allocation & Sales" icon={BarChart3}    iconColor="text-indigo-600" gradient="bg-gradient-to-r from-blue-500 to-purple-500"  delay={0.5}><AllocationBarChart  data={allocationChartData} /></ChartCard>
              <ChartCard title="Distribution Breakdown"      icon={PieChartIcon} iconColor="text-pink-600"   gradient="bg-gradient-to-r from-pink-500 to-orange-500"  delay={0.6}><DistributionPieChart data={pieChartData}         /></ChartCard>
            </div>

            <ChartCard title="Revenue by Marketplace" icon={DollarSign} iconColor="text-green-600" gradient="bg-gradient-to-r from-green-500 to-emerald-500" delay={0.7}>
              <RevenueBarChart data={revenueChartData} />
            </ChartCard>

            <ProductDistributionTable />
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: PROFIT  ← new, matches your design language exactly
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'profit' && (
          <motion.div key="profit" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-6">

            {/* Profit KPI cards — same StatCard style */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Gross Revenue"  value={`£${totalRevenue.toLocaleString()}`}  subtitle="All channels"        icon={DollarSign}    gradient="bg-gradient-to-br from-blue-500 to-blue-600"     color="text-blue-100"   delay={0.1} />
              <StatCard title="Cost of Goods"  value={`£${totalCOGS.toLocaleString()}`}     subtitle="Total COGS"          icon={Package}       gradient="bg-gradient-to-br from-rose-500 to-red-600"      color="text-red-100"    delay={0.2} />
              <StatCard title="Gross Profit"   value={`£${totalProfit.toLocaleString()}`}   subtitle={`${profitMargin}% margin`} icon={TrendingUp} gradient="bg-gradient-to-br from-green-500 to-green-600" color="text-green-100"  delay={0.3} />
              <StatCard title="Avg Order Value" value={`£${(totalRevenue/totalOrders).toFixed(2)}`} subtitle={`${totalOrders} orders`} icon={Target} gradient="bg-gradient-to-br from-orange-500 to-orange-600" color="text-orange-100" delay={0.4} />
            </div>

            {/* Revenue vs COGS vs Profit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      Revenue vs Cost vs Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={PROFIT_DATA.map(m => ({
                          name: m.name,
                          Revenue: m.revenue,
                          'Cost of Goods': m.cogs,
                          Profit: m.revenue - m.cogs,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<LightTooltip />} />
                          <Legend wrapperStyle={{ fontSize:12, color:'#6b7280' }} />
                          <Bar dataKey="Revenue"       fill="#6366f1" radius={[4,4,0,0]} />
                          <Bar dataKey="Cost of Goods" fill="#f43f5e" radius={[4,4,0,0]} />
                          <Bar dataKey="Profit"        fill="#10b981" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profit margin per marketplace */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Profit Margin by Marketplace
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {PROFIT_DATA.map((m) => {
                      const profit  = m.revenue - m.cogs;
                      const margin  = ((profit / m.revenue) * 100);
                      const barColor = margin >= 40 ? '#10b981' : margin >= 25 ? '#f59e0b' : '#f43f5e';
                      return (
                        <div key={m.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                              <span className="text-sm font-semibold text-gray-700">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">£{profit.toLocaleString()}</span>
                              <Badge className="text-white font-bold text-xs px-2 py-0.5" style={{ backgroundColor: barColor }}>
                                {margin.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div initial={{ width:0 }} animate={{ width:`${margin}%` }} transition={{ delay:0.6, duration:0.8 }}
                              className="h-2.5 rounded-full" style={{ backgroundColor: barColor }} />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Revenue: £{m.revenue.toLocaleString()}</span>
                            <span>COGS: £{m.cogs.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Monthly trend line chart */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-pink-500 to-orange-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-pink-600" />
                    Monthly Sales Trend (12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MONTHS.map((month, i) => ({
                        month,
                        ...Object.fromEntries(PROFIT_DATA.map(m => [m.name, m.monthlySales[i]])),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<LightTooltip />} />
                        <Legend wrapperStyle={{ fontSize:12, color:'#6b7280' }} />
                        {PROFIT_DATA.map(m => (
                          <Line key={m.id} type="monotone" dataKey={m.name} stroke={m.color}
                            strokeWidth={2.5} dot={false} activeDot={{ r:5 }} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Channel metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROFIT_DATA.map((m, index) => {
                const profit = m.revenue - m.cogs;
                const margin = ((profit / m.revenue) * 100).toFixed(1);
                return (
                  <motion.div key={m.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.8 + index * 0.1 }}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:`${m.color}20` }}>
                            <DollarSign className="h-5 w-5" style={{ color: m.color }} />
                          </div>
                          <Badge className="text-white text-xs" style={{ backgroundColor: m.color }}>
                            +{m.trend}%
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-3">{m.name}</h3>
                        <div className="space-y-2 text-sm">
                          {[
                            { l:'Revenue',   v:`£${m.revenue.toLocaleString()}`,    c:'text-gray-900 font-bold' },
                            { l:'Profit',    v:`£${profit.toLocaleString()}`,        c:'text-green-600 font-bold' },
                            { l:'Margin',    v:`${margin}%`,                         c:'text-indigo-600 font-bold' },
                            { l:'Avg Order', v:`£${m.aov}`,                          c:'text-gray-600' },
                            { l:'Returns',   v:`${((m.returns/m.orders)*100).toFixed(1)}%`, c:'text-red-500' },
                          ].map(({ l, v, c }) => (
                            <div key={l} className="flex justify-between">
                              <span className="text-gray-500">{l}:</span>
                              <span className={c}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(m.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{m.rating}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: PRODUCTS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-6">

            {/* Product KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Products"   value={PRODUCT_DETAILS.length}  subtitle="Active SKUs"          icon={Package}    gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" color="text-indigo-100"  delay={0.1} />
              <StatCard title="Low Stock Alerts" value={PRODUCT_DETAILS.filter(p=>p.status==='low-stock').length} subtitle="Need reorder" icon={AlertTriangle} gradient="bg-gradient-to-br from-amber-500 to-orange-600" color="text-orange-100" delay={0.2} />
              <StatCard title="Avg Margin"       value={`${(PRODUCT_DETAILS.reduce((s,p)=>s+p.margin,0)/PRODUCT_DETAILS.length).toFixed(1)}%`} subtitle="Across all products" icon={TrendingUp} gradient="bg-gradient-to-br from-green-500 to-green-600" color="text-green-100" delay={0.3} />
              <StatCard title="Best Margin"      value={`${Math.max(...PRODUCT_DETAILS.map(p=>p.margin))}%`} subtitle={PRODUCT_DETAILS.find(p=>p.margin===Math.max(...PRODUCT_DETAILS.map(p=>p.margin)))?.sku ?? ''} icon={Award} gradient="bg-gradient-to-br from-purple-500 to-purple-600" color="text-purple-100" delay={0.4} />
            </div>

            {/* Product Distribution Table — enhanced */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    Product Distribution Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/60">
                          <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                          <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                          <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Price</th>
                          <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Margin</th>
                          {PROFIT_DATA.map(m => (
                            <th key={m.id} className="text-center py-3.5 px-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor:`${m.color}20` }}>
                                  <Layers className="h-3 w-3" style={{ color: m.color }} />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-500">{m.name.split(' ')[0]}</span>
                              </div>
                            </th>
                          ))}
                          <th className="text-center py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRODUCT_DETAILS.map((p, idx) => (
                          <motion.tr key={p.id}
                            initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.5 + idx * 0.08 }}
                            className={`border-b border-gray-100 hover:bg-indigo-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>

                            {/* Product name */}
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5">{p.sku}</Badge>
                                  <span className="text-[10px] text-gray-400">{p.category}</span>
                                  {p.status === 'low-stock' && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                                      Low Stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Stock */}
                            <td className="py-4 px-4 text-center">
                              <span className={`text-sm font-bold ${p.totalStock < 50 ? 'text-amber-500' : 'text-gray-900'}`}>
                                {p.totalStock}
                              </span>
                            </td>

                            {/* Base price */}
                            <td className="py-4 px-4 text-center">
                              <span className="text-sm font-semibold text-gray-700">£{p.basePrice.toFixed(2)}</span>
                            </td>

                            {/* Margin badge */}
                            <td className="py-4 px-4 text-center">
                              <Badge className={`text-xs font-bold px-2 py-0.5 ${
                                p.margin >= 45 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                p.margin >= 30 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                'bg-red-100 text-red-600 border border-red-200'
                              }`}>
                                {p.margin}%
                              </Badge>
                            </td>

                            {/* Per-marketplace distribution */}
                            {PROFIT_DATA.map(m => (
                              <td key={m.id} className="py-4 px-4 text-center">
                                <div>
                                  <Badge className="text-xs font-semibold mb-0.5" style={{ backgroundColor:`${m.color}15`, color: m.color, border:`1px solid ${m.color}30` }}>
                                    {p.distribution[m.id as keyof typeof p.distribution]} u
                                  </Badge>
                                  <p className="text-[10px] text-gray-400">£{(p.revenue[m.id as keyof typeof p.revenue]/1000).toFixed(1)}k</p>
                                </div>
                              </td>
                            ))}

                            {/* Trend */}
                            <td className="py-4 px-4 text-center">
                              <div className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
                                p.trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {p.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(p.trend)}%
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue per product bar chart */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.9 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-orange-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Revenue per Product × Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PRODUCT_DETAILS.map(p => ({
                        name: p.name.split(' ').slice(0,2).join(' '),
                        ...Object.fromEntries(PROFIT_DATA.map(m => [m.name, p.revenue[m.id as keyof typeof p.revenue]])),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize:10, fill:'#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize:10, fill:'#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<LightTooltip />} />
                        <Legend wrapperStyle={{ fontSize:12, color:'#6b7280' }} />
                        {PROFIT_DATA.map(m => (
                          <Bar key={m.id} dataKey={m.name} fill={m.color} radius={[4,4,0,0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: ANALYTICS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-6">

            {/* Insight cards — same Card style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon:Flame,         bg:'bg-gradient-to-br from-orange-500 to-red-500',    title:'Fastest Growing',   body:'TikTok Shop is growing at 34.2% MoM — your fastest channel. Increase allocation by 20% to maximise revenue.',        action:'View Channel' },
                { icon:Shield,        bg:'bg-gradient-to-br from-purple-500 to-indigo-600', title:'Highest Margin',    body:'TikTok Shop delivers the highest profit margin at 46.4%. Your pricing strategy is working well here.',                action:'Optimise' },
                { icon:AlertTriangle, bg:'bg-gradient-to-br from-amber-500 to-orange-500',  title:'2 Low Stock Items', body:'MSO-005 (41 units) and EQT-003 (89 units) are running low. Reorder now to prevent marketplace stockouts.',           action:'Reorder' },
              ].map(({ icon:Icon, bg, title, body, action }, i) => (
                <motion.div key={title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 + i * 0.1 }}>
                  <Card className={`border-0 shadow-lg text-white ${bg}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">{title}</h3>
                      </div>
                      <p className="text-white/85 text-sm leading-relaxed mb-4">{body}</p>
                      <button className="flex items-center gap-1.5 text-sm font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all">
                        {action} <ChevronRight className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Radar + Channel metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-600" />
                      Channel Performance Radar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { metric:'Revenue',      ...Object.fromEntries(PROFIT_DATA.map(m=>[m.name, Math.round(m.revenue/1000)])) },
                          { metric:'Orders',       ...Object.fromEntries(PROFIT_DATA.map(m=>[m.name, m.orders])) },
                          { metric:'Margin',       ...Object.fromEntries(PROFIT_DATA.map(m=>[m.name, Math.round(((m.revenue-m.cogs)/m.revenue)*100)])) },
                          { metric:'Conv Rate',    ...Object.fromEntries(PROFIT_DATA.map(m=>[m.name, Math.round(m.convRate*10)])) },
                          { metric:'Rating',       ...Object.fromEntries(PROFIT_DATA.map(m=>[m.name, Math.round(m.rating*20)])) },
                          { metric:'Growth',       ...Object.fromEntries(PROFIT_DATA.map(m=>[m.name, Math.round(m.trend*2)])) },
                        ]}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fill:'#6b7280' }} />
                          {PROFIT_DATA.map(m => (
                            <Radar key={m.id} name={m.name} dataKey={m.name}
                              stroke={m.color} fill={m.color} fillOpacity={0.1} strokeWidth={2} />
                          ))}
                          <Legend wrapperStyle={{ fontSize:12, color:'#6b7280' }} />
                          <Tooltip content={<LightTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Channel KPI list */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-teal-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      Channel Performance KPIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label:'Best AOV',          value:'£247.27',  sub:'WooCommerce',  icon:Award,       color:'text-purple-600', bg:'bg-purple-100' },
                      { label:'Top Conversion',    value:'6.8%',     sub:'TikTok Shop',  icon:TrendingUp,  color:'text-pink-600',   bg:'bg-pink-100'   },
                      { label:'Lowest Return Rate',value:'0.7%',     sub:'TikTok Shop',  icon:CheckCircle, color:'text-green-600',  bg:'bg-green-100'  },
                      { label:'Fastest Growth',    value:'+34.2%',   sub:'TikTok Shop',  icon:Flame,       color:'text-orange-600', bg:'bg-orange-100' },
                      { label:'Highest Margin',    value:'46.4%',    sub:'TikTok Shop',  icon:Star,        color:'text-amber-600',  bg:'bg-amber-100'  },
                      { label:'Overall Return Rate',value:`${returnRate}%`, sub:`${totalReturns} returns`, icon:RefreshCw, color:'text-red-600', bg:'bg-red-100' },
                    ].map(({ label, value, sub, icon:Icon, color, bg }, i) => (
                      <motion.div key={label} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.6 + i * 0.07 }}
                        className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700">{label}</p>
                          <p className="text-[10px] text-gray-400">{sub}</p>
                        </div>
                        <span className={`text-sm font-black ${color}`}>{value}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Revenue area chart */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="h-1 bg-gradient-to-r from-pink-500 to-red-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-pink-600" />
                    12-Month Revenue Trend by Channel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MONTHS.map((month, i) => ({
                        month,
                        ...Object.fromEntries(PROFIT_DATA.map(m => [m.name, m.monthlySales[i] * Math.round(m.revenue / m.orders)])),
                      }))}>
                        <defs>
                          {PROFIT_DATA.map(m => (
                            <linearGradient key={m.id} id={`ag-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={m.color} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={m.color} stopOpacity={0.02} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<LightTooltip />} />
                        <Legend wrapperStyle={{ fontSize:12, color:'#6b7280' }} />
                        {PROFIT_DATA.map(m => (
                          <Area key={m.id} type="monotone" dataKey={m.name} stroke={m.color}
                            strokeWidth={2.5} fill={`url(#ag-${m.id})`} />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}