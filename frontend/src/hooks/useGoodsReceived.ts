"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GoodsReceivedNote, PurchaseOrder, GRNStats,
  NewProductForm,
  GoodsReceivedNoteItem as GRNItem,
} from "@/app/dashboard/(inventory-dashboard)/product-goods-received/types/goodsReceived";
import { fetchGRNs, createGRN, deleteGRN, exportSingleGRNToPDF } from "../helper/goodsReceived";
import { fetchOrders } from "../helper/purchaseOrderApi";

export interface GoodsReceivedNoteItem extends GRNItem {
  _id?: string;
}

export const useGoodsReceived = () => {

  // ── Server State ─────────────────────────────────────────────────────────
  const [grns,           setGrns]           = useState<GoodsReceivedNote[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [isExporting,    setIsExporting]    = useState<string | null>(null);
  const [page,           setPage]           = useState(1);
  const [total,          setTotal]          = useState(0);

  // ── Server-side stats (from API, not from current page) ──────────────────
  // These come from the backend so they reflect ALL records, not just page 1
  const [serverStats, setServerStats] = useState({
    totalGRNs:          0,
    completedGRNs:      0,
    discrepancyGRNs:    0,
    totalItemsReceived: 0,
  });

  // ── Filter State ─────────────────────────────────────────────────────────
  const [searchTerm,     setSearchTerm]     = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // ── Form State ───────────────────────────────────────────────────────────
  const [selectedPO,     setSelectedPO]     = useState<string>("");
  const [receivedBy,     setReceivedBy]     = useState("");
  const [grnNotes,       setGRNNotes]       = useState("");
  const [receivingItems, setReceivingItems] = useState<GoodsReceivedNoteItem[]>([]);

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    purchaseOrderItemId: "",
    productName:         "",
    sku:                 "",
    status:              "received",
    orderedQuantity:     0,
    receivedQuantity:    0,
    unitPrice:           0,
  });

  // ── Load Data ─────────────────────────────────────────────────────────────
  const loadGRNs = async () => {
    try {
      setLoading(true);
      const [grnRes, poRes] = await Promise.all([
        fetchGRNs(page, 10, searchTerm, selectedStatus),
        fetchOrders(),
      ]);

      setGrns(grnRes.data);
      setTotal(grnRes.total);
      setPurchaseOrders(poRes.data as unknown as PurchaseOrder[]);

      // ── ✅ Server stats — calculated from ALL GRNs, not just current page ──
      // If your backend returns stats separately, use that.
      // Otherwise fetch page=1 limit=9999 once for stats.
      // Best: add a /api/grns/stats endpoint on backend.
      // For now: use total + grnRes.stats if backend sends them:
      if ((grnRes as any).stats) {
        setServerStats((grnRes as any).stats);
      } else {
        // ── Fallback: calculate from ALL fetched data ──────────────────────
        // Fetch all to calculate accurate stats (one-time, lightweight)
        const allRes = await fetchGRNs(1, 9999, "", "all");
        const allGRNs: GoodsReceivedNote[] = allRes.data;

        // ✅ FIXED completedGRNs definition:
        // "Completed" = received + NO rejections + NO damage (clean delivery)
        // "status === received" sirf stock update confirm karta hai
        // Lekin GRN-006 mein 0 accepted, 20 rejected, 20 damaged hai —
        // woh "received" (stock ran) lekin "completed" (clean) nahi
        const completedGRNs = allGRNs.filter(grn => {
          if (grn.status !== "received") return false;
          const hasIssues = grn.items?.some(item =>
            (Number(item.rejectedQuantity) || 0) > 0 ||
            (Number(item.damageQuantity)   || 0) > 0
          );
          return !hasIssues;
        }).length;

        // discrepancy = koi bhi rejection ya damage tha
        const discrepancyGRNs = allGRNs.filter(grn =>
          grn.items?.some(item =>
            (Number(item.rejectedQuantity) || 0) > 0 ||
            (Number(item.damageQuantity)   || 0) > 0
          )
        ).length;

        // ✅ FIXED: acceptedQuantity = what went INTO STOCK (not receivedQuantity)
        const totalItemsReceived = allGRNs.reduce((sum, grn) => {
          return sum + (grn.items?.reduce((iSum, item) => {
            return iSum + (Number(item.acceptedQuantity) || 0);
          }, 0) || 0);
        }, 0);

        setServerStats({
          totalGRNs:       allRes.total,
          completedGRNs,
          discrepancyGRNs,
          totalItemsReceived,
        });
      }

    } catch (error) {
      console.error("Failed to load GRNs:", error);
      toast.error("Failed to load Goods Received Notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGRNs(); }, [page, searchTerm, selectedStatus]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  // Uses serverStats so numbers are accurate across ALL pages
  const stats: GRNStats = useMemo(() => ({
    totalGRNs:          serverStats.totalGRNs,
    completedGRNs:      serverStats.completedGRNs,
    totalItemsReceived: serverStats.totalItemsReceived,
    discrepancyGRNs:    serverStats.discrepancyGRNs,
  }), [serverStats]);

  // ── Available POs ─────────────────────────────────────────────────────────
  // ✅ FIXED: ONLY "ordered" POs — GRN sirf ordered PO ke against banta hai
  //
  // draft    → supplier ko order bhi nahi bheja, GRN kaise banega?
  // pending  → manager ne approve nahi kiya
  // approved → order place nahi hua
  // ordered  → ✅ supplier ko order gaya, maal aa sakta hai
  // received → already poora receive ho gaya
  // cancelled→ cancel ho gaya
const availablePOs = useMemo(() => {
  return purchaseOrders.filter(po => {
    const status = po.status?.toLowerCase().trim();
    return ["ordered", "received", "draft"].includes(status);
    // ordered  → normal delivery
    // received → partial delivery baki hai (partial shipments)
    // draft    → ❌ supplier ko pata hi nahi
    // cancelled→ ❌ order cancel ho gaya
  });
}, [purchaseOrders])

  // ── PO Selection ──────────────────────────────────────────────────────────
  const handleSelectPO = (poId: string) => {
    setSelectedPO(poId);
    const po = purchaseOrders.find(p => p._id === poId);
    if (!po) return;

    const items: GoodsReceivedNoteItem[] = po.items.map(item => {
      const product = item.productId;
      return {
        purchaseOrderItemId: item._id ?? product._id,
        productId:           product._id,
        productName:         product?.productName ?? "",
        sku:                 product?.sku         ?? "",
        orderedQuantity:     item.quantity,
        receivedQuantity:    0,
        acceptedQuantity:    0,
        rejectedQuantity:    0,
        damageQuantity:      0,
        condition:           "good" as const,
        notes:               "",
        unitPrice:           item.unitPrice,
      };
    });

    setReceivingItems(items);
  };

  // ── Update Item ───────────────────────────────────────────────────────────
  // acceptedQuantity = receivedQuantity - rejectedQuantity - damageQuantity
  const handleUpdateItem = (
    purchaseOrderItemId: string,
    field: keyof GoodsReceivedNoteItem,
    value: any
  ) => {
    setReceivingItems(items =>
      items.map(item => {
        if (item.purchaseOrderItemId !== purchaseOrderItemId) return item;
        const updated  = { ...item, [field]: value };
        const received = Number(updated.receivedQuantity) || 0;
        const rejected = Number(updated.rejectedQuantity) || 0;
        const damaged  = Number(updated.damageQuantity)   || 0;
        updated.acceptedQuantity = Math.max(0, received - rejected - damaged);
        return updated;
      })
    );
  };

  // ── Create GRN ────────────────────────────────────────────────────────────
  const handleCreateGRN = async () => {
    if (!selectedPO || !receivedBy) {
      toast.error("Purchase order and receiver name are required");
      return;
    }

    const validItems = receivingItems.filter(i => i.receivedQuantity > 0);
    if (validItems.length === 0) {
      toast.error("At least one item must have received quantity > 0");
      return;
    }

    // ✅ FIXED: NO status from frontend — backend sets it automatically
    // Backend sets "received" after applyGRNToStock() runs successfully
    const payload: Partial<GoodsReceivedNote> = {
      purchaseOrderId: selectedPO,
      receivedBy,
      notes: grnNotes,
      items: validItems,
      // ❌ REMOVED: status: newProduct.status  ← backend decides, not frontend
    };

    try {
      setLoading(true);
      console.log("payloa", payload)
      await createGRN(payload);
      toast.success("GRN created — stock is being updated in background");
      resetForm();
      loadGRNs();
    } catch (error: any) {
      console.error("Failed to create GRN:", error);
      toast.error(error?.response?.data?.message || "Failed to create GRN");
    } finally {
      setLoading(false);
    }
  };

  // ── Manual Product Add ────────────────────────────────────────────────────
  const handleAddManualProduct = () => {
    if (
      !newProduct.productName ||
      !newProduct.sku         ||
      newProduct.orderedQuantity  <= 0 ||
      newProduct.receivedQuantity <= 0 ||
      newProduct.unitPrice        <= 0
    ) {
      toast.error("Please fill in all product fields with valid values");
      return;
    }

    const manualItem: GoodsReceivedNoteItem = {
      purchaseOrderItemId: `manual-${Date.now()}`,
      productName:         newProduct.productName,
      sku:                 newProduct.sku,
      status:              newProduct.status,
      orderedQuantity:     newProduct.orderedQuantity,
      receivedQuantity:    newProduct.receivedQuantity,
      acceptedQuantity:    newProduct.receivedQuantity,
      rejectedQuantity:    0,
      damageQuantity:      0,
      condition:           "good",
      notes:               "",
      unitPrice:           newProduct.unitPrice,
    };

    setReceivingItems(prev => [...prev, manualItem]);
    setNewProduct({
      purchaseOrderItemId: "",
      productName:         "",
      sku:                 "",
      orderedQuantity:     0,
      receivedQuantity:    0,
      unitPrice:           0,
      status:              "received",
    });
    toast.success("Product added successfully!");
  };

  // ── Delete GRN ────────────────────────────────────────────────────────────
  const handleDeleteGRN = async (id: string) => {
    try {
      await deleteGRN(id);
      setGrns(prev => prev.filter(g => g._id !== id));
      toast.success("GRN deleted");
    } catch {
      toast.error("Failed to delete GRN");
    }
  };

  // ── Export GRN ────────────────────────────────────────────────────────────
  const handleExportGRN = async (grn: GoodsReceivedNote) => {
    if (!grn?._id) return toast.error("Invalid GRN ID");
    try {
      setIsExporting(grn._id);
      const loadingToast = toast.loading(`Generating PDF for ${grn.grnNumber}...`);
      const blob = await exportSingleGRNToPDF(grn._id);
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `${grn.grnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("Downloaded!", { id: loadingToast });
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  // ── Reset Form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setSelectedPO("");
    setReceivedBy("");
    setGRNNotes("");
    setReceivingItems([]);
    setNewProduct({
      purchaseOrderItemId: "",
      productName:         "",
      sku:                 "",
      orderedQuantity:     0,
      receivedQuantity:    0,
      unitPrice:           0,
      status:              "received",
    });
  };

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    grns, purchaseOrders, availablePOs, stats,
    loading, page, total, isExporting,
    searchTerm, selectedStatus,
    selectedPO, receivedBy, grnNotes, receivingItems, newProduct,
    setPage, setSearchTerm, setSelectedStatus,
    setReceivedBy, setGRNNotes, setNewProduct,
    handleSelectPO, handleUpdateItem, handleCreateGRN,
    handleDeleteGRN, resetForm, handleAddManualProduct,
    loadGRNs, handleExportGRN,
  };
};
