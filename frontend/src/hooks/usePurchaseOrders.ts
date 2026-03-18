
"use client"
import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  IPurchaseOrder,
  IPurchaseOrderItem,
  IPurchaseOrderWithSupplier,
  ISupplier,
  PurchaseOrderStats,
  OrderFormData,
  OrderItemForm,
  OrderStatus,
  PurchaseOrderFilters,
  validateOrderForm,
  validateItemForm,
  itemFormToOrderItem,
  orderToFormData,
  calculateOrderTotals,
  formDataToCreateDTO
} from '../app/dashboard/(inventory-dashboard)/product-Orders/types/purchaseOrders';
import * as PurchaseOrderAPI from '../helper/purchaseOrderApi';
import { BulkOrderGroup } from '@/helper/purchaseOrderApi';

export const usePurchaseOrders = () => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [orders, setOrders] = useState<IPurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingOrder, setEditingOrder] = useState<IPurchaseOrder | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    supplier: '',
    orderContactEmail: '',
    expectedDelivery: '',
    notes: ''
  });
  const [orderItems, setOrderItems] = useState<IPurchaseOrderItem[]>([]);
  const [newItem, setNewItem] = useState<OrderItemForm>({
    productId: '',
    productName: '',
    sku: '',
    quantity: '',
    unitPrice: ''
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [loadingOrderNumber, setLoadingOrderNumber] = useState(false);
const [suppliersList, setSupplierList] = useState<ISupplier[]>([]);

  // ============================================================================
  // FETCH OPERATIONS
  // ============================================================================

 
const fetchOrdersData = async () => {
  try {
    setLoading(true);
    
    // Build query parameters
    const params: any = {
      page,
      limit,
    };
    
    // Add search term if exists
    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    
    // Add status filter if not 'all'
    if (selectedStatus && selectedStatus !== 'all') {
      params.status = selectedStatus;
    }
    
    const response = await PurchaseOrderAPI.fetchOrders(params.page, params.limit, params.search, params.status);
    setOrders(response?.data as any || []);
    setTotal(response.total || 0);
  } catch (error) {
    console.error("Failed to load orders", error);
    toast.error('Failed to load purchase orders');
  } finally {
    setLoading(false);
  }
};


  /**
   * Fetch suppliers from backend
   */
  const fetchSuppliers = async () => {
    try {
      const res = await PurchaseOrderAPI.fetchSuppliers();
      setSupplierList(res);
    } catch (error) {
      console.error("Error in fetching suppliers", error);
      toast.error('Failed to load suppliers');
    }
  };


  /**
   * Fetch next order number
   */
  const fetchOrderNumber = async () => {
    try {
      setLoadingOrderNumber(true);
      const  nextOrderNumber  = await PurchaseOrderAPI.generateNextOrderNumber();
      console.log("purchaseOrderNumber", nextOrderNumber);
      setOrderNumber(nextOrderNumber?.purchaseOrderAutoCode);
    } catch (err) {
      console.error("Failed to generate order number", err);
      toast.error('Failed to generate order number');
    } finally {
      setLoadingOrderNumber(false);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchSuppliers();
    fetchOrderNumber();
  }, []);

  useEffect(() => {
    fetchOrdersData();
  }, [page, searchTerm, selectedStatus]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Calculate statistics from orders
   */
  const stats: PurchaseOrderStats = useMemo(() => ({
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(o => o.status === 'pending' || o.status === 'approved').length || 0,
    orderedCount: orders?.filter(o => o.status === 'ordered').length || 0,
    receivedCount: orders?.filter(o => o.status === 'received').length || 0
  }), [orders]);

  /**
   * Filter orders (client-side for immediate feedback)
   */
  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  // ============================================================================
  // ITEM MANAGEMENT
  // ============================================================================

  /**
   * Add item to order
   */
  const handleAddItem = () => {
    // Validate item form
    const validationError = validateItemForm(newItem);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Convert form data to order item
    const item = itemFormToOrderItem(newItem);
    
    setOrderItems(prev => [...prev, item]);
    setNewItem({productId: '', productName: '', sku: '', quantity: '', unitPrice: '' });
    toast.success('Item added to order');
  };

  /**
   * Remove item from order by index
   */
  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
    toast.success('Item removed');
  };

  // ============================================================================
  // ORDER CRUD OPERATIONS
  // ============================================================================

  /**
   * Save order (create or update)
   */
  const handleSaveOrder = async (): Promise<boolean> => {
    // Validate form
    const formErrors = validateOrderForm(orderForm);
    if (formErrors.length > 0) {
      toast.error(formErrors[0]);
      return false;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return false;
    }

    const { subtotal, tax, total } = calculateOrderTotals(orderItems, 20);

    try {
      setLoading(true);

      if (editingOrder?._id) {
        // Update existing order
        const updatePayload: Partial<IPurchaseOrder> = {
          supplier: orderForm.supplier,
          orderContactEmail: orderForm.orderContactEmail,
          expectedDelivery: new Date(orderForm.expectedDelivery),
          items: orderItems,
          subtotal,
          tax,
          total,
          notes: orderForm.notes
        };

        await PurchaseOrderAPI.updatePurchaseOrder(editingOrder._id, updatePayload as any);
        // toast.success('Purchase order updated successfully!');
      } else {
        // Create new order
        const newOrder = formDataToCreateDTO(orderForm, orderItems, orderNumber);
        newOrder.status = 'draft';
        newOrder.subtotal = subtotal;
        newOrder.tax = tax;
        newOrder.total = total;
        await PurchaseOrderAPI.createPurchaseOrder(newOrder);
        // toast.success('Purchase order created successfully!');
      }

      resetForm();
      await fetchOrdersData();
      await fetchOrderNumber(); // Get new order number for next order
      return true;
    } catch (error: any) {
      console.error('Error saving order:', error);
      toast.error(error.response?.data?.message || 'Failed to save purchase order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete order
   */
  const handleDeleteOrder = async (id: string | null | undefined) => {
    if (!id) {
      toast.error('Invalid order ID');
      return;
    }

    try {
      setLoading(true);
      await PurchaseOrderAPI.deletePurchaseOrder(id);
      toast.success('Purchase order deleted successfully!');
      await fetchOrdersData();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete purchase order');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update order status
   */
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setLoading(true);
      await PurchaseOrderAPI.updatePurchaseOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrdersData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Edit order - populate form with order data
   */
  const handleEditOrder = (order: IPurchaseOrder) => {
    setEditingOrder(order);
    setOrderForm(orderToFormData(order));
    setOrderItems([...order.items]);
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setEditingOrder(null);
    setOrderForm({
      supplier: '',
      orderContactEmail: '',
      expectedDelivery: '',
      notes: ''
    });
    setOrderItems([]);
    setNewItem({productId: '', productName: '', sku: '', quantity: '', unitPrice: '' });
  };

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Export single order as PDF
   */
  const handleExportSingleOrder = async (order: IPurchaseOrder): Promise<boolean> => {
    try {
      setLoading(true);
      
      const filters: PurchaseOrderFilters = {
        orderId: order._id,
        status: order.status,
      };
      
      const blob = await PurchaseOrderAPI.exportPurchaseOrders(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Purchase-Order-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Order ${order.orderNumber} exported successfully`);
      return true;
    } catch (error: any) {
      console.error('Error exporting order:', error);
      toast.error('Failed to export order');
      return false;
    } finally {
      setLoading(false);
    }
  };

// In your usePurchaseOrders hook

const handleCreateBulkOrders = useCallback(async (groups: BulkOrderGroup[]) => {
  console.log("🔍 RAW GROUPS RECEIVED:", JSON.stringify(groups, null, 2));
  
  try {
    setLoading(true);
    
    // Log each product's quantity before filtering
    groups.forEach((group, groupIndex) => {
      console.log(`Group ${groupIndex} (${group.supplierName}):`);
      group.products.forEach((product, productIndex) => {
        console.log(`  Product ${productIndex}: ${product.productName}`, {
          suggestedQty: product.suggestedQty,
          costPrice: product.costPrice,
          parsedQty: Number(product.suggestedQty)
        });
      });
    });

    // ✅ Filter products but KEEP the original format (suggestedQty/costPrice)
    const filteredGroups = groups
      .map(group => ({
        ...group,
        products: group.products.filter(product => {
          const qty = Number(product.suggestedQty);
          return qty > 0;
        })
      }))
      .filter(group => group.products.length > 0);

    console.log("📦 FILTERED GROUPS (modal format):", JSON.stringify(filteredGroups, null, 2));

    if (filteredGroups.length === 0) {
      toast.error('No products with valid quantity selected');
      return;
    }

    // Get userId
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || user._id || '';
    const userEmail = user.email || '';

    // ✅ Pass the filtered groups (modal format) to the API function
    // The API function will handle transformation to API format
    const result = await PurchaseOrderAPI.createBulkPurchaseOrders(
      userId,
      filteredGroups,  // This has suggestedQty/costPrice
      // "Humber Mobility Scooter",
      "Inventory System",
      userEmail
    );
    
    console.log("✅ Bulk orders created:", result);
    toast.success(result.message);
    
    // Refresh orders
    await fetchOrdersData();
    setPage(1);
    
    return result;
  } catch (error: any) {
    console.error("❌ Bulk order creation failed:", error);
    toast.error(error.message || "Failed to create bulk orders");
    throw error;
  } finally {
    setLoading(false);
  }
}, [fetchOrdersData, setPage]);
  // ============================================================================
  // RETURN API
  // ============================================================================

  const statuses = ['all', 'draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'];

  return {
    // Data
    orders,
    filteredOrders,
    stats,
    suppliers: suppliersList,
    statuses,
    
    // Loading states
    loading,
    loadingOrderNumber,
    
    // Pagination
    page,
    setPage,
    limit,
    total,
    
    // Filters
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    
    // Form state
    editingOrder,
    orderForm,
    setOrderForm,
    orderItems,
    newItem,
    setNewItem,
    orderNumber,
    
    // Actions
    handleAddItem,
    handleRemoveItem,
    handleSaveOrder,
    resetForm,
    handleDeleteOrder,
    handleStatusChange,
    handleEditOrder,
    calculateTotals: calculateOrderTotals,
    refreshOrders: fetchOrdersData,
    handleExportSingleOrder,
    handleCreateBulkOrders,
  };
};



