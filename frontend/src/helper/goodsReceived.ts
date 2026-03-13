import axios from "axios";
import { GoodsReceivedNote } from "@/app/dashboard/(inventory-dashboard)/product-goods-received/types/goodsReceived";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/grn`;

const getAuthConfig = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } 
  };
};

const getUserId = () => {
  if (typeof window === "undefined") return "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id || "";
};

export interface GRNResponse {
  data: GoodsReceivedNote[];
  total: number;
  page: number;
  limit: number;
}

/* ---------------- FETCH ---------------- */
export const fetchGRNs = async (
  page = 1,
  limit = 10,
  search = "",
  status = "all" // Added status parameter
): Promise<GRNResponse> => {
  const userId = getUserId();
  const res = await axios.get(API_URL, {
    ...getAuthConfig(),
    params: {
      userId,
      page,
      limit,
      search,
      status: status === "all" ? undefined : status, 
    },
  });
  return res.data;
};

/* ---------------- CREATE ---------------- */
export const createGRN = async (
  payload: Partial<GoodsReceivedNote>
): Promise<GoodsReceivedNote> => {
  const userId = getUserId();
  
   const completePayload = {
    ...payload,
    userId,
    receivedDate: new Date().toISOString(),
  };
  
  
  const res = await axios.post(API_URL, completePayload, getAuthConfig());
  return res.data;
};

/* ---------------- DELETE ---------------- */
export const deleteGRN = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, getAuthConfig());
};


/* ---------------- fetchGRNById ---------------- */

export const fetchGRNById = async (id: string): Promise<GoodsReceivedNote> => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
}

/* ---------------- GENERATE NEXT NUMBER ---------------- */
export const fetchNextDocumentNumber = async (
  type: "GRN" | "GRN_REFERENCE" | "GOODS_RETURN"
): Promise<{ nextNumber: string }> => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/document-numbers/next`,
    {
      ...getAuthConfig(),
      params: { 
        type,
        userId: getUserId(),
      },
    }
  );
  return res.data;
};

/* ---------------- EXPORT SINGLE GRN TO PDF ---------------- */
export const exportSingleGRNToPDF = async (id: string): Promise<Blob> => {
  const res = await axios.get(`${API_URL}/export/${id}`, {
    ...getAuthConfig(),
    responseType: "blob", // Vital for binary data
  });

  if (res.data.size === 0) {
    throw new Error("Exported file is empty");
  }

  return res.data;
};