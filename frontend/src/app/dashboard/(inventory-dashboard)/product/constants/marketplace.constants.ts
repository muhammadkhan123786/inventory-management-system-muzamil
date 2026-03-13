// constants/marketplace.constants.ts
import { 
  ShoppingCart, 
  Store, 
  Smartphone, 
  Globe, 
  Instagram, 
  Facebook,
  Truck,
  Package 
} from 'lucide-react';

// Common marketplace icons mapping
export const MARKETPLACE_ICONS: Record<string, any> = {
  'ebay': ShoppingCart,
  'amazon': ShoppingCart,
  'etsy': Store,
  'shopify': Store,
  'tiktok': Smartphone,
  'facebook': Facebook,
  'instagram': Instagram,
  'walmart': ShoppingCart,
  'aliexpress': Globe,
  'daraz': Package,
  'default': Store
};

// Common marketplace colors mapping
export const MARKETPLACE_COLORS: Record<string, { bg: string, text: string, gradient: string }> = {
  'ebay': {
    bg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    text: 'text-yellow-700',
    gradient: 'from-yellow-500 to-amber-500'
  },
  'amazon': {
    bg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    text: 'text-orange-700',
    gradient: 'from-orange-500 to-amber-600'
  },
  'etsy': {
    bg: 'bg-gradient-to-br from-orange-400 to-red-500',
    text: 'text-red-700',
    gradient: 'from-orange-400 to-red-500'
  },
  'shopify': {
    bg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    text: 'text-green-700',
    gradient: 'from-green-500 to-emerald-500'
  },
  'tiktok': {
    bg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    text: 'text-pink-700',
    gradient: 'from-pink-500 to-rose-500'
  },
  'default': {
    bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    text: 'text-gray-700',
    gradient: 'from-gray-500 to-gray-600'
  }
};