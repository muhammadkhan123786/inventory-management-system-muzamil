import { LucideIcon, Store, ShoppingCart, Building2, Globe } from 'lucide-react';

export interface MarketplaceData {
  name: string;
  allocated: number;
  sold: number;
  revenue: number;
  color: string;
  icon: LucideIcon;
  enabled: boolean;
}

export interface ProductDistribution {
  id: string;
  name: string;
  sku: string;
  totalStock: number;
  marketplaces: {
    [key: string]: number;
  };
}

export const MARKETPLACES: MarketplaceData[] = [
  {
    name: 'eBay',
    allocated: 45,
    sold: 32,
    revenue: 4800,
    color: '#0064D2',
    icon: Store,
    enabled: true
  },
  {
    name: 'Amazon',
    allocated: 60,
    sold: 48,
    revenue: 7200,
    color: '#FF9900',
    icon: ShoppingCart,
    enabled: true
  },
  {
    name: 'Etsy',
    allocated: 25,
    sold: 18,
    revenue: 2700,
    color: '#F56400',
    icon: Store,
    enabled: true
  },
  {
    name: 'Shopify',
    allocated: 50,
    sold: 35,
    revenue: 5250,
    color: '#96BF48',
    icon: Store,
    enabled: true
  },
  {
    name: 'TikTok',
    allocated: 30,
    sold: 22,
    revenue: 3300,
    color: '#EE1D52',
    icon: Store,
    enabled: true
  },
  {
    name: 'Retail Store',
    allocated: 40,
    sold: 28,
    revenue: 4200,
    color: '#8B5CF6',
    icon: Building2,
    enabled: true
  },
  {
    name: 'Website',
    allocated: 35,
    sold: 25,
    revenue: 3750,
    color: '#10B981',
    icon: Globe,
    enabled: true
  }
];

export const PRODUCTS: ProductDistribution[] = [
  {
    id: '1',
    name: 'Pride Victory 10 3-Wheel',
    sku: 'PV10-3W-001',
    totalStock: 285,
    marketplaces: {
      ebay: 45,
      amazon: 60,
      etsy: 25,
      shopify: 50,
      tiktok: 30,
      retail: 40,
      website: 35
    }
  },
  {
    id: '2',
    name: 'Drive Medical Scout Compact',
    sku: 'DM-SC-002',
    totalStock: 180,
    marketplaces: {
      ebay: 30,
      amazon: 40,
      etsy: 15,
      shopify: 35,
      tiktok: 20,
      retail: 25,
      website: 15
    }
  },
  {
    id: '3',
    name: 'Golden Technologies Buzzaround XL',
    sku: 'GT-BZ-003',
    totalStock: 220,
    marketplaces: {
      ebay: 35,
      amazon: 50,
      etsy: 20,
      shopify: 40,
      tiktok: 25,
      retail: 30,
      website: 20
    }
  }
];