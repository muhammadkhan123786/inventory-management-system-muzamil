import { useState, useEffect, useCallback } from "react";
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Supplier {
  _id: string;
  userId: string;
  supplierIdentification: {
    legalBusinessName: string;
    tradingName?: string;
    businessRegNumber: string;
    vat?: string;
  };
  contactInformation: {
    primaryContactName: string;
    phoneNumber: string;
    emailAddress?: string;
    website?: string;
  };
  businessAddress: {
    businessAddress: string;
    city?: any;
    state: string;
    country?: any;
    zipCode: string;
  };
  productServices: {
    leadTimes: string | number;
    minimumOrderQuantity: string | number;
  };
  commercialTerms: {
    contractStartDate?: string;
    contractEndDate?: string;
    discountTerms?: string;
  };
  operationalInformation?: {
    orderContactName?: string;
    orderContactEmail?: string;
    returnPolicy?: string;
    warrantyTerms?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export function useSupplier(id: string) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data?.data ?? response.data;
      setSupplier(data);
    } catch (err) {
      console.error("Failed to fetch supplier:", err);
      setError("Failed to load supplier");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchSupplier();
  }, [id, fetchSupplier]);

  return { supplier, loading, error, refetch: fetchSupplier };
}