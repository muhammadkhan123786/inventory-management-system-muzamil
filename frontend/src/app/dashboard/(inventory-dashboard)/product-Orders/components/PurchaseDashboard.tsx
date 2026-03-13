'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PurchaseOrdersHeader } from './PurchaseOrdersHeader';
import { PurchaseOrdersStats } from './PurchaseOrdersStats';
import { PurchaseOrdersFilters } from './PurchaseOrdersFilters';
import { PurchaseOrdersTable } from './PurchaseOrdersTable';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { ViewOrderDialog } from './ViewOrderDialog';
import { DeleteOrderDialog } from './DeleteOrderDialog';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { IPurchaseOrder } from '../types/purchaseOrders';
import { toast } from 'sonner';

export default function PurchaseOrdersPage() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<IPurchaseOrder | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
const [nextNumber, setNextNumber] = useState();
  const {
    filteredOrders,
    stats,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    editingOrder,
    orderForm,
    setOrderForm,
    orderItems,
    newItem,
    setNewItem,
    suppliers,
    statuses,
    loading,
    handleAddItem,
    handleRemoveItem,
    handleSaveOrder,
    resetForm,
    handleDeleteOrder,
    handleStatusChange,
    handleEditOrder,
    calculateTotals,
    orderNumber,
    handleExportSingleOrder,
    handleCreateBulkOrders,
  } = usePurchaseOrders();


  const getUserId = () => {
    if (typeof window === "undefined") return "";
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id;
  };
  const handleOpenCreateOrder = () => {
    resetForm();
    setIsOrderDialogOpen(true);
  };

  const handleOpenEditOrder = (order: IPurchaseOrder) => {
    handleEditOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleOpenViewOrder = (order: IPurchaseOrder) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteOrder = (orderId: string) => {
    setDeletingOrderId(orderId);
    setIsDeleteDialogOpen(true);
  };

const handleConfirmDelete = async () => {

  try {
    await handleDeleteOrder(deletingOrderId);
    toast.success("Order is Deleted successfully")
  } finally {
    setIsDeleteDialogOpen(false);
    setDeletingOrderId(null);
  }
};


  const handleCloseOrderDialog = () => {
    setIsOrderDialogOpen(false);
    resetForm();
  };
  

  // In your PurchaseOrdersPage component
// Remove or comment out this line from ViewOrderDialog props:
// onExport: handleExportOrders,

// Instead, create a separate function for single order export:


// Then in your ViewOrderDialog:
<ViewOrderDialog
  open={isViewDialogOpen}
  onOpenChange={setIsViewDialogOpen}
  order={viewingOrder}
  onExport={handleExportSingleOrder} // Pass the correct function
/>
  return (
    <div className="space-y-6 relative p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-full blur-3xl"
        />
      </div>

      <PurchaseOrdersHeader onCreateOrder={handleOpenCreateOrder} />
      
      <PurchaseOrdersStats stats={stats} />
      
      <PurchaseOrdersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statuses={statuses}
      />
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <PurchaseOrdersTable
          orders={filteredOrders || []}
          onView={handleOpenViewOrder}
          onEdit={handleOpenEditOrder}
          onDelete={handleOpenDeleteOrder}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Dialogs */}
      <PurchaseOrderForm
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        editingOrder={editingOrder}
        orderForm={orderForm}
        onOrderFormChange={setOrderForm}
        orderItems={orderItems}
        newItem={newItem}
        onNewItemChange={setNewItem}
        suppliers={suppliers}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onSaveOrder={handleSaveOrder}
        onCancel={handleCloseOrderDialog}
        calculateTotals={calculateTotals}
       orderNumber = {orderNumber}
       userId={ getUserId() }
       onCreateBulkOrders = {handleCreateBulkOrders}
      />

      <ViewOrderDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={viewingOrder}
        onExport = { handleExportSingleOrder }
      />

      <DeleteOrderDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}