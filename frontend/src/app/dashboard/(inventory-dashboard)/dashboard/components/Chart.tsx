// src/components/SalesByChannelChart.tsx
'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface MonthData {
  month: string;
  value: number;
}

type ChannelType = 'Shopify' | 'eBay' | 'Direct' | 'Retail';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MonthData;
  }>;
}

// Sales data by channel and month
const salesData: Record<ChannelType, MonthData[]> = {
  Shopify: [
    { month: 'Jan', value: 55000 },
    { month: 'Feb', value: 42000 },
    { month: 'Mar', value: 50000 },
    { month: 'Apr', value: 70000 },
    { month: 'May', value: 58000 },
    { month: 'Jun', value: 41000 },
    { month: 'Jul', value: 33000 },
    { month: 'Aug', value: 48000 },
    { month: 'Sep', value: 52000 },
    { month: 'Oct', value: 61000 },
    { month: 'Nov', value: 45000 },
    { month: 'Dec', value: 55000 },
  ],
  eBay: [
    { month: 'Jan', value: 38000 },
    { month: 'Feb', value: 45000 },
    { month: 'Mar', value: 41000 },
    { month: 'Apr', value: 52000 },
    { month: 'May', value: 48000 },
    { month: 'Jun', value: 39000 },
    { month: 'Jul', value: 35000 },
    { month: 'Aug', value: 43000 },
    { month: 'Sep', value: 47000 },
    { month: 'Oct', value: 51000 },
    { month: 'Nov', value: 42000 },
    { month: 'Dec', value: 46000 },
  ],
  Direct: [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 48000 },
    { month: 'Mar', value: 43000 },
    { month: 'Apr', value: 58000 },
    { month: 'May', value: 52000 },
    { month: 'Jun', value: 44000 },
    { month: 'Jul', value: 39000 },
    { month: 'Aug', value: 49000 },
    { month: 'Sep', value: 53000 },
    { month: 'Oct', value: 57000 },
    { month: 'Nov', value: 47000 },
    { month: 'Dec', value: 51000 },
  ],
  Retail: [
    { month: 'Jan', value: 32000 },
    { month: 'Feb', value: 36000 },
    { month: 'Mar', value: 34000 },
    { month: 'Apr', value: 44000 },
    { month: 'May', value: 40000 },
    { month: 'Jun', value: 33000 },
    { month: 'Jul', value: 30000 },
    { month: 'Aug', value: 37000 },
    { month: 'Sep', value: 41000 },
    { month: 'Oct', value: 45000 },
    { month: 'Nov', value: 35000 },
    { month: 'Dec', value: 39000 },
  ],
};

// Channel colors mapping using CSS variables
const channelColors = {
  Shopify: 'var(--chart-1)',
  eBay: 'var(--chart-2)',
  Direct: 'var(--chart-3)',
  Retail: 'var(--chart-4)',
};

export default function SalesByChannelChart() {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('Shopify');
  const [startIndex, setStartIndex] = useState(0);
  const channels: ChannelType[] = ['Shopify', 'eBay', 'Direct', 'Retail'];
  
  const visibleMonths = 7; // Show 7 months at a time
  const currentData = salesData[selectedChannel];
  const displayData = currentData.slice(startIndex, startIndex + visibleMonths);
  
  // Find the maximum value in the displayed data
  const maxValue = Math.max(...displayData.map(item => item.value));
  
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + visibleMonths < currentData.length;

  const handlePrevious = () => {
    if (canGoBack) {
      setStartIndex(Math.max(0, startIndex - 1));
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setStartIndex(Math.min(currentData.length - visibleMonths, startIndex + 1));
    }
  };

  // Custom Tooltip with proper typing
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-chart-tooltip border-chart-tooltip px-3 py-2 rounded-lg shadow-lg border">
          <p className="text-sm font-semibold text-fg">
            £{(payload[0].value / 1000).toFixed(0)}k
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${value / 1000}k`;
    }
    return value.toString();
  };

  return (
    <div className="w-full bg-card border-border rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-fg mb-1">
            Sales by Channel
          </h3>
          <p className="text-sm text-muted">
            Performance over last year
          </p>
        </div>
         {/* Channel Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin bg-secondary rounded-lg p-1">
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => {
              setSelectedChannel(channel);
              setStartIndex(0); // Reset to beginning when changing channel
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedChannel === channel
                ? 'bg-primary text-primary-fg'
                : 'bg-card text-muted hover:bg-accent'
            }`}
          >
            {channel}
          </button>
        ))}
      </div>
        
        {/* Frequency Dropdown */}
        <div className="relative">
          <select className="appearance-none bg-secondary rounded-lg px-4 py-2 pr-10 text-sm text-fg cursor-pointer">
            <option>Select Frequency</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none rotate-90" />
        </div>
      </div>

     

      {/* Chart Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={handlePrevious}
          disabled={!canGoBack}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            canGoBack
              ? 'bg-card shadow-md hover:shadow-lg text-fg cursor-pointer'
              : 'bg-muted/50 text-muted cursor-not-allowed'
          }`}
          aria-label="Previous months"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Chart */}
        <div className="px-8">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={displayData} 
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="var(--chart-grid)"
              />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: 'var(--chart-axis)', 
                  fontSize: 12 
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: 'var(--chart-axis)', 
                  fontSize: 12 
                }}
                tickFormatter={formatYAxis}
                domain={[0, 70000]}
              />
              {/* <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ 
                  fill: 'rgba(0, 0, 0, 0.05)',
                  className: 'cursor-fill'
                }} 
              /> */}
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.value === maxValue 
                        ? 'var(--chart-bar-active)' 
                        : 'var(--chart-bar-inactive)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          disabled={!canGoForward}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            canGoForward
              ? 'bg-card shadow-md hover:shadow-lg text-fg cursor-pointer'
              : 'bg-muted/50 text-muted cursor-not-allowed'
          }`}
          aria-label="Next months"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}