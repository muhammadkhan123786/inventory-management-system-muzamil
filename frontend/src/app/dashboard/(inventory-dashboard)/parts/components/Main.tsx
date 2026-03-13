'use client';

import { PartsHeader } from './PartsHeader';
import { PartsStatsCards } from './PartsStatsCards';
import { PartsSearch } from './PartsSearch';
import { PartsGrid } from './PartsGrid';
import { usePartsInventory } from '@/hooks/usePartsInventory';
import { toast } from 'sonner';

export default function PartsInventoryPage() {
  const {
    filteredParts,
    statCards,
    searchTerm,
    setSearchTerm,
    updatePartQuantity
  } = usePartsInventory();

  const handleOrderMore = (partId: string) => {
    // Find the part
    const part = filteredParts.find(p => p.id === partId);
    if (!part) return;

    // Show success message
    toast.success(`Order placed for ${part.name}`, {
      description: 'Your order has been submitted successfully.'
    });

    // In a real app, you would make an API call here
    // For now, simulate increasing stock by 10
    updatePartQuantity(partId, part.quantity + 10);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PartsHeader />
      
      <PartsStatsCards stats={statCards} />
      
      <PartsSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <PartsGrid 
        parts={filteredParts}
        onOrderMore={handleOrderMore}
      />
    </div>
  );
}