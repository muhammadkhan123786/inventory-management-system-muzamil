import { useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useSupplierOrders(supplierId: string, userId: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId || !userId) return;
     const token = localStorage.getItem("token");
     
    axios.get(`${BASE_URL}/purchase-orders`, { 
      params: { supplierId, userId, limit: 50 } ,
       headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => setOrders(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [supplierId, userId]);

  return { orders, loading };
}