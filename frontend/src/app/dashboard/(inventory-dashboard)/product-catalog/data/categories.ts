import { 
  Package, 
  Zap, 
  Box, 
  Tag 
} from 'lucide-react';
import { Category } from '../types/products';

export const categories: Category[] = [
  {
    id: 'all',
    name: 'All Products',
    icon: Package,
    count: 45,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'mobility-scooters',
    name: 'Mobility Scooters',
    icon: Zap,
    count: 18,
    color: 'from-blue-500 to-cyan-500',
    subcategories: [
      { id: 'travel-scooters', name: 'Travel Scooters', icon: Package, count: 8, color: 'from-blue-400 to-cyan-400' },
      { id: 'mid-size-scooters', name: 'Mid-Size Scooters', icon: Package, count: 6, color: 'from-blue-500 to-cyan-500' },
      { id: 'heavy-duty-scooters', name: 'Heavy Duty Scooters', icon: Package, count: 4, color: 'from-blue-600 to-cyan-600' }
    ]
  },
  {
    id: 'wheelchairs',
    name: 'Wheelchairs',
    icon: Box,
    count: 12,
    color: 'from-green-500 to-emerald-500',
    subcategories: [
      { id: 'manual-wheelchairs', name: 'Manual Wheelchairs', icon: Box, count: 7, color: 'from-green-400 to-emerald-400' },
      { id: 'electric-wheelchairs', name: 'Electric Wheelchairs', icon: Box, count: 5, color: 'from-green-600 to-emerald-600' }
    ]
  },
  {
    id: 'parts-accessories',
    name: 'Parts & Accessories',
    icon: Tag,
    count: 15,
    color: 'from-orange-500 to-amber-500',
    subcategories: [
      { id: 'batteries', name: 'Batteries', icon: Tag, count: 5, color: 'from-orange-400 to-amber-400' },
      { id: 'chargers', name: 'Chargers', icon: Tag, count: 4, color: 'from-orange-500 to-amber-500' },
      { id: 'tires', name: 'Tires & Wheels', icon: Tag, count: 6, color: 'from-orange-600 to-amber-600' }
    ]
  }
];