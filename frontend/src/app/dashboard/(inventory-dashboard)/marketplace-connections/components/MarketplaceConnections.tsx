"use client";

import { useState } from "react";
import { toast } from "sonner";
import {  AnimatePresence } from "framer-motion";
import {
  Marketplace,
  FormData,
  initialFormData,
  MarketplaceTemplate,
} from "../data/marketplaceData";
import { MarketplaceCard } from "../components/MarketplaceCard";

import { useFormActions } from "@/hooks/useFormActions";

import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { AddEditDialog } from "./AddEditDialog";
import { DeleteDialog } from "./DeleteDialog";

export default function MarketplaceConnections() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // const [marketplaces, setMarketplaces] = useState<Marketplace[]>(INITIAL_MARKETPLACES);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] =
    useState<Marketplace | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(
    null,
  );
  const [syncingMarketplace, setSyncingMarketplace] = useState<string | null>(
    null,
  );

  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);

  const getAuthConfig = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const getUserId = () => {
    if (typeof window === "undefined") return "";
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id;
  };

  /* =========================
     TEMPLATES
  ========================= */
  const {
    data: templates,
    total,
    isLoading,
    deleteItem,
    updateItem,
    createItem,
    isDeleting,
    isSaving,
    ConnectionItem,
    SynData,
  } = useFormActions<MarketplaceTemplate>(
    "/marketplace",
    "marketplace",
    "Marketplace Connection",
  );

  const marketplace = templates || [];
  console.log("data", marketplace);

  /* =========================
     SAVE MARKETPLACE
  ========================= */
  const saveMarketplace = async () => {
    if (!formData.type) {
      return toast.error("Select type");
    }

    try {
      createItem({
        type: formData.name,
        name: formData.type,
        environment: formData.environment,
        userId: getUserId(),
        descripation: formData.description,
        credentials: formData.credentials,
      });
      setShowDialog(false);
      setFormData(initialFormData);
    } catch (error) {
      console.log("error", error);
    }
  };

  const testConnection = async (marketplace: Marketplace) => {
    // 1. Set the loading state in UI
    setTestingConnection(marketplace._id);

    try {
       await ConnectionItem(marketplace._id);
    } catch (error) {
      // Error is handled by mutation onError, but we catch it here to prevent crash
      console.error("Test failed", error);
    } finally {
      // 4. Stop the loading spinner regardless of success/fail
      setTestingConnection(null);
    }
  };

  const syncMarketplace = async (marketplace: Marketplace) => {
    if (marketplace.status !== "connected") {
      toast.error("Cannot sync disconnected marketplace", {
        description: "Please test connection first.",
      });
      return;
    }

    try {
      SynData(marketplace._id);
      toast.success(`${marketplace.name} synced successfully! ✨`, {
        description: "Latest data has been updated",
      });
    } catch (error) {
      console.error("Error in sync data");
    }
  };
  const handleDeleteMarketplace = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMarketplace = async () => {
    if (!selectedMarketplace?._id) return;

    try {
      await deleteItem(selectedMarketplace._id);

      setShowDeleteDialog(false);
      setSelectedMarketplace(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEditMarketplace = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace);
    // setFormData({
    //   name: marketplace.name,
    //   type: marketplace.type,
    //   apiKey: marketplace.apiKey || '',
    //   apiSecret: marketplace.apiSecret || '',
    //   shopUrl: marketplace.shopUrl || '',
    //   accessToken: marketplace.accessToken || '',
    //   marketplaceId: '',
    //   description: marketplace.description
    // });
    setShowEditDialog(true);
  };
  return (
    <div className="space-y-6">
      <DashboardHeader onAddMarketplace={() => setShowDialog(true)} />

      <StatsGrid
        connectedCount={marketplace.length}
        totalSales={0}
        totalListings={0}
        totalPending={0}
        total24hRevenue={0}
      />

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {marketplace.map((marketplace, index) => (
            <MarketplaceCard
              key={marketplace._id || marketplace.id || index}
              marketplace={marketplace}
              index={index}
              testingConnection={testingConnection}
              syncingMarketplace={syncingMarketplace}
              onTestConnection={testConnection}
              onSyncMarketplace={syncMarketplace}
              onEdit={handleEditMarketplace}
              onDelete={handleDeleteMarketplace}
            />
          ))}
        </AnimatePresence>
      </div>
      <AddEditDialog
        isOpen={showDialog}
        isEdit={false}
        formData={formData}
        onClose={() => setShowDialog(false)}
        onSubmit={saveMarketplace}
        onFormChange={setFormData}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        marketplace={selectedMarketplace}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedMarketplace(null);
        }}
        onConfirm={confirmDeleteMarketplace}
      />
    </div>
  );
}
