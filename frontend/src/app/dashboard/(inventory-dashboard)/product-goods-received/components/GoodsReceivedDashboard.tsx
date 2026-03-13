'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GRNHeader } from './GRNHeader';
import { GRNStat } from './GRNStats';
import { GRNFilters } from './GRNFilters';
import { GRNTable } from './GRNTable';
import { CreateGRNDialog } from './CreateGRNDialog';
import { ViewGRNDialog } from './ViewGRNDialog';
import { useGoodsReceived } from '@/hooks/useGoodsReceived';
import { GoodsReceivedNote } from '../types/goodsReceived';
import { toast } from 'sonner';

// Add statuses constant
const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'received', label: 'Received' },
  { value: 'ordered', label: 'Ordered' },

];

export default function GoodsReceivedPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingGRN, setViewingGRN] = useState<GoodsReceivedNote | null>(null);

  const {
    grns,
    stats,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedPO,
    handleSelectPO,
    receivedBy,
    setReceivedBy,
    grnNotes,
    setGRNNotes,
    receivingItems,
    newProduct,
    setNewProduct,
    availablePOs,
    handleUpdateItem,
    handleAddManualProduct,
    handleCreateGRN,
    resetForm,
    handleExportGRN,
    loadGRNs
  } = useGoodsReceived();


  console.log("receivingItems", receivingItems)
  const handleOpenCreateGRN = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleOpenViewGRN = (grn: GoodsReceivedNote) => {
    setViewingGRN(grn);
    setIsViewDialogOpen(true);
  };

  const handleDownloadGRN = async(grn: GoodsReceivedNote) => {
   await handleExportGRN(grn);
    toast.info(`Downloading GRN: ${grn.grnNumber}`);
  };

  const handleCreateAndClose = async () => {
    try {
      await handleCreateGRN();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create GRN:", error);
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6 relative p-4 md:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 rounded-full blur-3xl"
        />
      </div>

      <GRNHeader onCreateGRN={handleOpenCreateGRN} />
      
      <GRNStat stats={stats} />
      
      <GRNFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statuses={statuses}
      />
      
      <GRNTable
        grns={grns}
        onView={handleOpenViewGRN}
        onDownload={handleDownloadGRN}
      />

      {/* Dialogs */}
      <CreateGRNDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        selectedPO={selectedPO}
        onSelectPO={handleSelectPO}
        receivedBy={receivedBy}
        onReceivedByChange={setReceivedBy}
        grnNotes={grnNotes}
        onGRNNotesChange={setGRNNotes}
        receivingItems={receivingItems}
        onUpdateItem={handleUpdateItem as any}
        newProduct={newProduct}
        onNewProductChange={setNewProduct}
        onAddManualProduct={handleAddManualProduct}
        availablePOs={availablePOs}
        onCreateGRN={handleCreateAndClose}
        onCancel={handleCloseCreateDialog}
        
      />

      <ViewGRNDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        grn={viewingGRN}
        handleDownloadGRN = { handleDownloadGRN}
        // receivingItems = { receivingItems }
      /> 
    </div>
  );
}