// src/components/StockAlerts.tsx
'use client';

import { ChevronRight } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  status: 'critical' | 'low' | 'available';
  image: string;
}

export default function StockAlerts() {
  const stockItems: StockItem[] = [
    {
      id: '1',
      name: 'Micro Scooter Schweiz',
      price: '£1.2k',
      quantity: 2,
      status: 'critical',
      image: '/scooter.png',
    },
    {
      id: '2',
      name: 'Micro Scooter Schweiz',
      price: '£1.2k',
      quantity: 4,
      status: 'low',
      image: '/scooter.png',
    },
    {
      id: '3',
      name: 'Micro Scooter Schweiz',
      price: '£1.2k',
      quantity: 20,
      status: 'available',
      image: '/scooter.png',
    },
  ];

  const getStatusColor = (status: StockItem['status']) => {
    switch (status) {
      case 'critical':
        return 'text-destructive';
      case 'low':
        return 'text-chart-3'; // Using orange from chart colors
      case 'available':
        return 'text-chart-2'; // Using green from chart colors
    }
  };

  const getStatusBgColor = (status: StockItem['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-destructive/10';
      case 'low':
        return 'bg-chart-3/10';
      case 'available':
        return 'bg-chart-2/10';
    }
  };

  const getStatusText = (quantity: number) => {
    if (quantity <= 2) return 'Left';
    if (quantity <= 10) return 'Left';
    return 'Left';
  };

  return (
    <div className="w-full bg-card rounded-2xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-fg">
            Stock Alerts
          </h3>
          <span className={`px-2.5 py-1 ${getStatusBgColor('critical')} text-destructive text-xs font-semibold rounded-full`}>
            {stockItems.length} Items
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stock Items List */}
      <div className="space-y-4">
        {stockItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
          >
            {/* Product Image */}
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {/* Placeholder for product image */}
              <div className="w-10 h-10 rounded-full bg-muted" />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-fg truncate">
                {item.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted">
                  {item.price}
                </span>
                <span className={`text-sm font-semibold ${getStatusColor(item.status)}`}>
                  {item.quantity} {getStatusText(item.quantity)}
                </span>
              </div>
            </div>

            {/* Restock Button */}
            <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0">
              Restock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}