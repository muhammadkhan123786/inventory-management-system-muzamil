"use client"
import { Package, TrendingUp, AlertCircle } from "lucide-react"
import { useState, useMemo } from 'react';
import { Part, PartsStats } from '../app/dashboard/(inventory-dashboard)/parts/types/parts';
import { mockParts } from '../app/dashboard/(inventory-dashboard)/parts/data/parts';

export const usePartsInventory = () => {
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics
  const stats: PartsStats = useMemo(() => ({
    totalParts: parts.length,
    totalValue: parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0),
    lowStock: parts.filter(part => part.quantity > 0 && part.quantity <= 3).length,
    outOfStock: parts.filter(part => part.quantity === 0).length
  }), [parts]);

  // Filter parts based on search
  const filteredParts = useMemo(() => {
    return parts.filter(part =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parts, searchTerm]);

  // Stat card data
  const statCards = useMemo(() => [
    { 
      label: 'Total Parts', 
      value: stats.totalParts, 
      gradient: 'from-blue-500 to-cyan-500',
      icon: Package 
    },
    { 
      label: 'Total Value', 
      value: `$${stats.totalValue.toFixed(2)}`, 
      gradient: 'from-emerald-500 to-green-500',
      icon: TrendingUp 
    },
    { 
      label: 'Low Stock', 
      value: stats.lowStock, 
      gradient: 'from-amber-500 to-orange-500',
      icon: AlertCircle 
    },
    { 
      label: 'Out of Stock', 
      value: stats.outOfStock, 
      gradient: 'from-rose-500 to-pink-500',
      icon: AlertCircle 
    }
  ], [stats]);

  // Update part quantity
  const updatePartQuantity = (id: string, newQuantity: number) => {
    setParts(prev => prev.map(part => 
      part.id === id ? { ...part, quantity: newQuantity } : part
    ));
  };

  // Add new part
  const addPart = (part: Omit<Part, 'id'>) => {
    const newPart = {
      ...part,
      id: `part-${Date.now()}`
    };
    setParts(prev => [...prev, newPart]);
  };

  return {
    parts,
    filteredParts,
    stats,
    statCards,
    searchTerm,
    setSearchTerm,
    updatePartQuantity,
    addPart
  };
};