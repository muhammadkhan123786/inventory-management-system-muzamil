'use client';

import { useState } from 'react';
import { motion }   from 'framer-motion';
import { GoodsReturnHeader }    from './GoodsReturnHeader';
import { GoodsReturnStats }     from './GoodsReturnStats';
import { GoodsReturnFilters }   from './GoodsReturnFilters';
import { GoodsReturnGridView }  from './GoodsReturnGridView';
import { GoodsReturnTableView } from './GoodsReturnTableView';
import { CreateReturnDialog }   from './CreateReturnDialog';
import { ViewReturnDialog }     from './ViewReturnDialog';
import { useGoodsReturn }       from '@/hooks/useGoodsReturn';
import { GoodsReturnNote }      from '../types/goodsReturn';

export default function GoodsReturnPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen,   setIsViewDialogOpen]   = useState(false);
  const [viewingReturn,      setViewingReturn]      = useState<GoodsReturnNote | null>(null);

  const {
    filteredReturns, stats, availableGRNs, statuses,
    searchTerm,    setSearchTerm,
    selectedStatus, setSelectedStatus,
    viewMode,      setViewMode,

    // ✅ Status update — was missing before
    isUpdatingStatus,
    handleStatusUpdate,

    // Export
    handleExportReturn,

    // Form
    selectedGRN, returnedBy,   setReturnedBy,
    returnReason, setReturnReason,
    returnNotes,  setReturnNotes,
    returningItems, returnDate, setReturnDate,
    handleGRNSelection, handleUpdateItemReturn,
    handleCreateReturn, resetForm,
  } = useGoodsReturn();

  const handleOpenCreate = () => { resetForm(); setIsCreateDialogOpen(true); };
  const handleOpenView   = (grtn: GoodsReturnNote) => {
    setViewingReturn(grtn);
    setIsViewDialogOpen(true);
  };

  const handleCreateAndClose = async () => {
    await handleCreateReturn();
    setIsCreateDialogOpen(false);
  };
  return (
    <div className="space-y-6 relative p-4 md:p-6">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale:[1,1.2,1], rotate:[0,90,0], opacity:[0.3,0.5,0.3] }}
          transition={{ duration:20, repeat:Infinity, ease:"linear" }}
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-red-400 via-orange-400 to-amber-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale:[1.2,1,1.2], rotate:[90,0,90], opacity:[0.3,0.5,0.3] }}
          transition={{ duration:15, repeat:Infinity, ease:"linear" }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 rounded-full blur-3xl"
        />
      </div>

      <GoodsReturnHeader onCreateReturn={handleOpenCreate} />
      <GoodsReturnStats stats={stats} />
      <GoodsReturnFilters
        searchTerm={searchTerm}         onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus} onStatusChange={setSelectedStatus}
        viewMode={viewMode}             onViewModeChange={setViewMode}
        statuses={statuses}
      />

      {viewMode === 'table' ? (
        <GoodsReturnTableView
          returns={filteredReturns}
          onView={handleOpenView}
          onDownload={handleExportReturn}
          onStatusUpdate={handleStatusUpdate}
          isUpdatingStatus={isUpdatingStatus}
        />
      ) : (
        // ✅ FIXED: onStatusUpdate + isUpdatingStatus properly passed
        
        <GoodsReturnGridView
          returns={filteredReturns}
          onView={handleOpenView}
          onDownload={handleExportReturn}
        />
      )}

      <CreateReturnDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        selectedGRN={selectedGRN}           onSelectGRN={handleGRNSelection}
        returnedBy={returnedBy}             onReturnedByChange={setReturnedBy}
        returnReason={returnReason}         onReturnReasonChange={setReturnReason}
        returnNotes={returnNotes}           onReturnNotesChange={setReturnNotes}
        returningItems={returningItems}     onUpdateItem={handleUpdateItemReturn}
        availableGRNs={availableGRNs}
        onCreateReturn={handleCreateAndClose}
        onCancel={() => { setIsCreateDialogOpen(false); resetForm(); }}
        returnDate={returnDate}             onReturnDateChange={setReturnDate}
      />

      <ViewReturnDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        grtn={viewingReturn}
        onDownload={handleExportReturn}
      />
    </div>
  );
}
