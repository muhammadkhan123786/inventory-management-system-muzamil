"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  GoodsReturnNote, GRNForReturn, ReturningItem,
  CreateGoodsReturnDto, ReturnStatus
} from "../app/dashboard/(inventory-dashboard)/product-goods-return/types/goodsReturn";
import {
  fetchGoodsReturns, createGoodsReturn,
  deleteGoodsReturn, exportSingleGRNToPDF, updateGoodsReturn
} from "../helper/goodsReturn";
import { fetchGRNs } from "../helper/goodsReceived";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ReturnStats {
  totalReturns: number;
  completed:    number;
  pending:      number;
  rejected:     number;
  totalValue:   number;
}

interface UseGoodsReturnOptions {
  supplierId?: string;
}

// ── Normalize status — never returns undefined ────────────────────────────
const normalizeStatus = (status: any): ReturnStatus =>
  (status as ReturnStatus) || "pending";

// ── Compute stats from full data array ───────────────────────────────────
const computeStats = (data: any[]): ReturnStats => ({
  totalReturns: data.length,
  completed: data.filter(r => normalizeStatus(r.status) === "completed").length,
  pending:   data.filter(r =>
    ["pending", "approved", "in-transit"].includes(normalizeStatus(r.status))
  ).length,
  rejected:  data.filter(r => normalizeStatus(r.status) === "rejected").length,
  totalValue: data.reduce((sum, r) => {
    const itemsTotal = (r.items || []).reduce((s: number, item: any) =>
      s + (item.returnQty || item.returnQuantity || 0) * (item.unitPrice || 0), 0
    );
    return sum + (r.totalAmount || itemsTotal || 0);
  }, 0),
});

export const useGoodsReturn = (options: UseGoodsReturnOptions = {}) => {
  const { supplierId } = options;
  const isSupplierMode = Boolean(supplierId);

  // ── Core data ──────────────────────────────────────────────────────────
  const [goodsReturnNotes, setGoodsReturnNotes] = useState<GoodsReturnNote[]>([]);
  const [availableGRNs,    setAvailableGRNs]    = useState<GRNForReturn[]>([]);
  const [serverStats,      setServerStats]      = useState<ReturnStats>({
    totalReturns: 0, pending: 0, completed: 0, rejected: 0, totalValue: 0,
  });

  // ── UI ─────────────────────────────────────────────────────────────────
  const [selectedStatus,   setSelectedStatus]   = useState("");
  const [viewMode,         setViewMode]         = useState<"grid" | "table">("grid");
  const [page,             setPage]             = useState(1);
  const [limit,            setLimit]            = useState(10);
  const [total,            setTotal]            = useState(0);
  const [isLoading,        setIsLoading]        = useState(true);
  const [isExporting,      setIsExporting]      = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // ── Search — raw input + debounced term ───────────────────────────────
  const [searchInput, setSearchInput] = useState(""); // bound to <input> directly
  const [searchTerm,  setSearchTerm]  = useState(""); // debounced — triggers fetch

  // Debounce 400ms — keystrokes don't fire a fetch until user stops typing
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Form state ─────────────────────────────────────────────────────────
  const [selectedGRN,    setSelectedGRN]    = useState("");
  const [returnedBy,     setReturnedBy]     = useState("");
  const [returnReason,   setReturnReason]   = useState("");
  const [returnNotes,    setReturnNotes]    = useState("");
  const [returnDate,     setReturnDate]     = useState(new Date().toISOString().split("T")[0]);
  const [returningItems, setReturningItems] = useState<ReturningItem[]>([]);

  // ── GENERATION COUNTER — the real fix for the disappearing data ────────
  // Every fetch call gets a unique generation number.
  // When the fetch completes, it checks if it's still the LATEST one.
  // If a newer fetch started while this one was in-flight → result discarded.
  // This means: typing in form → triggers search → old search result comes back
  // late → gets DISCARDED → table never gets set to empty. ✅
  const fetchGenRef = useRef(0);

  // ── Load Returns ───────────────────────────────────────────────────────
  const loadGoodsReturns = useCallback(async () => {
    const myGen = ++fetchGenRef.current; // claim this generation
    setIsLoading(true);

    try {
      if (isSupplierMode) {
        const token = localStorage.getItem("token");
        const res   = await axios.get(
          `${BASE_URL}/goods-return-notice/by-supplier/${supplierId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (myGen !== fetchGenRef.current) return; // stale — discard ✅

        const data       = res.data?.data ?? [] as any[];
        const normalized = data.map((r: any) => ({ ...r, status: normalizeStatus(r.status) }));

        setGoodsReturnNotes(normalized as GoodsReturnNote[]);
        setTotal(normalized.length);
        setServerStats(computeStats(normalized));

      } else {
        // Fetch current page + full dataset in parallel for accurate stats
        const [pageRes, allRes] = await Promise.all([
          fetchGoodsReturns(page, limit, searchTerm),
          fetchGoodsReturns(1, 9999, ""),
        ]);

        if (myGen !== fetchGenRef.current) return; // stale — discard ✅

        const pageData = (pageRes.data as any[]).map(r => ({
          ...r, status: normalizeStatus(r.status)
        }));
        const allData = (allRes.data as any[]).map(r => ({
          ...r, status: normalizeStatus(r.status)
        }));

        setGoodsReturnNotes(pageData as GoodsReturnNote[]);
        setTotal(pageRes.total);
        setServerStats(computeStats(allData)); // stats from full data always ✅
      }

    } catch (err: any) {
      if (myGen !== fetchGenRef.current) return; // stale error — ignore ✅
      console.error(err);
      toast.error("Failed to load goods return notes");
    } finally {
      if (myGen === fetchGenRef.current) {
        setIsLoading(false); // only clear spinner for latest fetch ✅
      }
    }
  }, [page, limit, searchTerm, supplierId, isSupplierMode]);

  // ── ONE effect — useCallback handles the deps correctly ───────────────
  useEffect(() => {
    loadGoodsReturns();
  }, [loadGoodsReturns]);

  // ── Load Available GRNs ────────────────────────────────────────────────
  const loadAvailableGRNs = useCallback(async () => {
    try {
      const [grnRes, returnRes] = await Promise.all([
        fetchGRNs(1, 200, ""),
        fetchGoodsReturns(1, 9999, ""),
      ]);

      const allReturns    = returnRes.data as any[];
      let   receivedGRNs  = (grnRes.data as any[]).filter(g => g.status === "received");

      if (isSupplierMode) {
        receivedGRNs = receivedGRNs.filter((grn: any) => {
          const s = grn?.purchaseOrderId?.supplier?._id || grn?.purchaseOrderId?.supplier;
          return String(s) === String(supplierId);
        });
      }

      // Build map of already-returned qty per GRN per SKU
      const returnedQtyMap: Record<string, Record<string, number>> = {};
      for (const ret of allReturns) {
        if (normalizeStatus(ret.status) === "rejected") continue;
        if (!ret.grnId) continue;
        const grnId = typeof ret.grnId === "object" ? (ret.grnId as any)._id : String(ret.grnId);
        if (!grnId) continue;
        if (!returnedQtyMap[grnId]) returnedQtyMap[grnId] = {};
        for (const item of ret.items) {
          returnedQtyMap[grnId][item.sku] =
            (returnedQtyMap[grnId][item.sku] || 0) + item.returnQty;
        }
      }

      const normalised = receivedGRNs
        .map((grn) => {
          const grnId        = String(grn._id ?? grn.id);
          const grnReturnMap = returnedQtyMap[grnId] || {};
          const items = (grn.items || []).map((item: any) => {
            const accepted      = Number(item.acceptedQuantity) || 0;
            const alreadyRet    = grnReturnMap[item.sku] || 0;
            const returnableQty = Math.max(0, accepted - alreadyRet);
            return { ...item, id: item._id ?? item.id, acceptedQuantity: accepted, returnableQty };
          });
          return { ...grn, id: grnId, items };
        })
        .filter(grn => grn.items.some((i: any) => i.returnableQty > 0));

      setAvailableGRNs(normalised as GRNForReturn[]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load available GRNs");
    }
  }, [supplierId, isSupplierMode]);

  useEffect(() => {
    loadAvailableGRNs();
  }, [loadAvailableGRNs]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => serverStats, [serverStats]);

  // ── Filtered returns ───────────────────────────────────────────────────
  const filteredReturns = useMemo(() => {
    return goodsReturnNotes.filter(grtn => {
      const status = normalizeStatus(grtn.status);
      return !selectedStatus || selectedStatus === "all" || status === selectedStatus;
    });
  }, [goodsReturnNotes, selectedStatus]);

  // ── GRN Selection ──────────────────────────────────────────────────────
  const handleGRNSelection = (grnId: string) => {
    const grn = availableGRNs.find(g => g.id === grnId);
    if (!grn) { toast.error("Selected GRN not found."); return; }
    setSelectedGRN(grnId);

    const returnableItems = grn.items.filter((item: any) => (item.returnableQty ?? 0) > 0);
    if (returnableItems.length === 0) {
      toast.warning("All items in this GRN have already been fully returned.");
      return;
    }

    setReturningItems(
      returnableItems.map((item: any, index: number) => ({
        _id:              item.id || `${item.sku}-${index}`,
        productId:        item.productId,
        productName:      item.productName,
        sku:              item.sku,
        acceptedQuantity: item.acceptedQuantity ?? 0,
        receivedQuantity: item.returnableQty    ?? 0,
        returnQuantity:   0,
        returnReason:     "damaged",
        condition:        "",
        notes:            "",
        unitPrice:        item.unitPrice ?? 0,
      }))
    );
  };

  // ── Update Item ────────────────────────────────────────────────────────
  const handleUpdateItemReturn = (itemId: string, field: string, value: any) => {
    setReturningItems(prev =>
      prev.map(item => {
        if (item._id !== itemId) return item;
        if (field === "returnQuantity") {
          const clamped = Math.min(
            item.receivedQuantity,
            Math.max(0, typeof value === "number" ? value : parseInt(value) || 0)
          );
          return { ...item, returnQuantity: clamped };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // ── Create Return ──────────────────────────────────────────────────────
  const handleCreateReturn = async () => {
    if (!selectedGRN)       return toast.error("Please select a GRN");
    if (!returnedBy.trim()) return toast.error("Please enter who is processing the return");

    const itemsToReturn = returningItems.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0)
      return toast.error("Please specify at least one item to return");

    for (const item of itemsToReturn) {
      if (item.returnQuantity > item.receivedQuantity)
        return toast.error(`"${item.productName}" exceeds returnable qty (${item.receivedQuantity})`);
      if (!item.returnReason)
        return toast.error(`Select a return reason for "${item.productName}"`);
      if (!item.productId)
        return toast.error(`Product ID missing for "${item.productName}" — re-select GRN`);
    }

    const payload: CreateGoodsReturnDto = {
      grnId:        selectedGRN,
      returnedBy,
      returnDate:   new Date(returnDate),
      returnReason: returnReason || "General return",
      notes:        returnNotes,
      items: itemsToReturn.map(item => ({
        productId:   item.productId,
        sku:         item.sku,
        productName: item.productName,
        returnQty:   item.returnQuantity,
        totalAmount: item.returnQuantity * item.unitPrice,
        unitPrice:   item.unitPrice,
        itemsNotes:  item.notes || item.condition,
      })),
    };

    try {
      // Cast to any — createGoodsReturn may return the record directly
      // or wrapped in { data: ... } depending on your helper implementation
      const response = await createGoodsReturn(payload) as any;

      // Unwrap either shape: { data: {...} }  OR  the record itself
      const serverRecord = response?.data ?? response ?? {};

      // ✅ Build optimistic record with status always set
      const optimisticRecord: GoodsReturnNote = {
        ...serverRecord,
        _id:          serverRecord?._id || `temp-${Date.now()}`,
        grnId:        selectedGRN as any,
        returnedBy,
        returnDate:   new Date(returnDate).toISOString(),
        returnReason: returnReason || "General return",
        notes:        returnNotes,
        status:       "pending",
        grtnNumber:   serverRecord?.grtnNumber || "Processing...",
        totalAmount:  itemsToReturn.reduce((s, i) => s + i.returnQuantity * i.unitPrice, 0) || 0,
        items: itemsToReturn.map(item => ({
          ...item,
          returnQty:   item.returnQuantity,
          totalAmount: item.returnQuantity * item.unitPrice,
        })) as any,
      };

      // Use a local variable — avoids "possibly undefined" TS error
      const recordTotal: number = optimisticRecord.totalAmount || 0;

      // ✅ Show immediately — no wait, no flash
      setGoodsReturnNotes(prev => [optimisticRecord, ...prev]);
      setServerStats(prev => ({
        ...prev,
        totalReturns: prev.totalReturns + 1,
        pending:      prev.pending + 1,
        totalValue:   prev.totalValue + recordTotal,
      }));

      toast.success("Return Note created — awaiting manager approval");
      resetForm();

      // ✅ Background sync with generation counter — won't overwrite if stale
      setTimeout(async () => {
        await loadGoodsReturns();
        await loadAvailableGRNs();
      }, 600);

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create goods return note");
    }
  };

  // ── Status Update ──────────────────────────────────────────────────────
  const handleStatusUpdate = async (returnId: string, newStatus: ReturnStatus) => {
    const current = goodsReturnNotes.find(g => g._id === returnId);
    if (!current) return;

    const currentStatus = normalizeStatus(current.status);
    const validTransitions: Record<ReturnStatus, ReturnStatus[]> = {
      "pending":    ["approved",   "rejected"],
      "approved":   ["in-transit", "rejected"],
      "in-transit": ["completed",  "rejected"],
      "completed":  [],
      "rejected":   [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      toast.error(`Cannot move from "${currentStatus}" to "${newStatus}"`);
      return;
    }

    try {
      setIsUpdatingStatus(returnId);
      await updateGoodsReturn(returnId, { status: newStatus });

      setGoodsReturnNotes(prev =>
        prev.map(g => g._id === returnId ? { ...g, status: newStatus } : g)
      );

      setServerStats(prev => {
        const u = { ...prev };
        if (["pending","approved","in-transit"].includes(currentStatus)) u.pending   = Math.max(0, u.pending   - 1);
        if (currentStatus === "completed")                               u.completed = Math.max(0, u.completed - 1);
        if (currentStatus === "rejected")                                u.rejected  = Math.max(0, u.rejected  - 1);
        if (["pending","approved","in-transit"].includes(newStatus))     u.pending   = u.pending   + 1;
        if (newStatus === "completed")                                   u.completed = u.completed + 1;
        if (newStatus === "rejected")                                    u.rejected  = u.rejected  + 1;
        return u;
      });

      const messages: Record<ReturnStatus, string> = {
        "approved":   "✅ Return approved — items ready to dispatch",
        "in-transit": "🚚 Items dispatched to supplier",
        "completed":  "✅ Return completed — stock reversed automatically",
        "rejected":   "❌ Return rejected — stock unchanged",
        "pending":    "Return set to pending",
      };
      toast.success(messages[newStatus]);

      await loadGoodsReturns();
      if (newStatus === "completed") await loadAvailableGRNs();

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
      await loadGoodsReturns();
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // ── Export PDF ─────────────────────────────────────────────────────────
  const handleExportReturn = async (returnNote: GoodsReturnNote) => {
    const targetId = returnNote._id;
    if (!targetId) return toast.error("Invalid Return Note ID");
    try {
      setIsExporting(targetId);
      const loadingToast = toast.loading(`Generating PDF for ${returnNote.grtnNumber}...`);
      const blob = await exportSingleGRNToPDF(targetId);
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `${returnNote.grtnNumber || "Return-Note"}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("Downloaded!", { id: loadingToast });
    } catch {
      toast.error("Failed to generate PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDeleteReturn = async (id: string) => {
    const target = goodsReturnNotes.find(g => g._id === id);
    const status = normalizeStatus(target?.status);
    if (target && !["pending", "rejected"].includes(status)) {
      toast.error(`Cannot delete a return in "${status}" status`);
      return;
    }
    try {
      await deleteGoodsReturn(id);
      setGoodsReturnNotes(prev => prev.filter(g => g._id !== id));
      setServerStats(prev => ({
        ...prev,
        totalReturns: Math.max(0, prev.totalReturns - 1),
        pending:      status === "pending"  ? Math.max(0, prev.pending  - 1) : prev.pending,
        rejected:     status === "rejected" ? Math.max(0, prev.rejected - 1) : prev.rejected,
      }));
      await loadAvailableGRNs();
      toast.success("Return Note deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ── Reset Form ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setSelectedGRN("");
    setReturnedBy("");
    setReturnReason("");
    setReturnNotes("");
    setReturningItems([]);
    setReturnDate(new Date().toISOString().split("T")[0]);
  };

  const statuses = ["all", "pending", "approved", "in-transit", "completed", "rejected"];

  return {
    goodsReturnNotes, filteredReturns, stats, availableGRNs, statuses,
    // ✅ searchTerm/setSearchTerm map to raw input — debounce is internal
    searchTerm:    searchInput,
    setSearchTerm: setSearchInput,
    selectedStatus, setSelectedStatus,
    viewMode, setViewMode,
    isLoading, isExporting, isUpdatingStatus,
    page, setPage, limit, setLimit, total,
    selectedGRN, returnedBy, setReturnedBy,
    returnReason, setReturnReason,
    returnNotes,  setReturnNotes,
    returningItems, returnDate, setReturnDate,
    handleGRNSelection, handleUpdateItemReturn,
    handleCreateReturn, handleStatusUpdate,
    handleDeleteReturn, handleExportReturn,
    resetForm, loadGoodsReturns,
    isSupplierMode,
  };
};