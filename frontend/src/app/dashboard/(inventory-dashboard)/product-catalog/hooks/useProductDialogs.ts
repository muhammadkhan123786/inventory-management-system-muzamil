import { useState } from 'react';
import { Product } from '../types/products';

export const useProductDialogs = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});

  const openViewDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData(product);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const closeAllDialogs = () => {
    setShowViewDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setSelectedProduct(null);
    setEditFormData({});
  };

  return {
    selectedProduct,
    showViewDialog,
    showEditDialog,
    showDeleteDialog,
    editFormData,
    setEditFormData,
    openViewDialog,
    openEditDialog,
    openDeleteDialog,
    closeAllDialogs
  };
};