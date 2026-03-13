import { useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useSupplierReturns(supplierId: string, userId: string) {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId || !userId) return;
     const token = localStorage.getItem("token");
    axios.get(`${BASE_URL}/goods-return-notice/by-supplier/${supplierId}`, { 
      params: {  userId, limit: 50 },
       headers: { Authorization: `Bearer ${token}` }, 
    })
      .then(r => setReturns(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  }, [supplierId, userId]);

  return { returns, loading };
}