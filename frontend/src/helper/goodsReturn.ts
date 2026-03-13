"use client";
import axios from "axios";
import { IGoodsReturnNote, GRNForReturn } from "../../../common/IGoodsReturn.interface";
import { CreateGoodsReturnDto } from "../app/dashboard/(inventory-dashboard)/product-goods-return/types/goodsReturn";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/goods-return-notice`;

interface GoodsReturnResponse {
  data: IGoodsReturnNote[];
  total: number;
  page: number;
  limit: number;
}

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

// ------------------- CRUD API -------------------

// Fetch all return notes with pagination & search & status filter
export const fetchGoodsReturns = async (
  page = 1,
  limit = 10,
  search = "",
  
): Promise<GoodsReturnResponse> => {
   const res = await axios.get(API_URL, {
    ...getAuthConfig(),
    params: {
      userId: getUserId(),
      page,
      limit,
      search,
      
    },
    
  });
 
  return res.data;
};

// Fetch by ID
// export const fetchGoodsReturnById = async (id: string): Promise<IGoodsReturnNote> => {
//   const res = await axios.get(`${API_URL}/${id}`, getAuthConfig());
//   return res.data;
// };

// Create a new return note
export const createGoodsReturn = async (
  payload: Partial<CreateGoodsReturnDto>
): Promise<CreateGoodsReturnDto> => {

  const userId = getUserId();
  console.log("user", userId);
  const createGoods = {
    ... payload,
    userId
  }
  const res = await axios.post(API_URL, createGoods, getAuthConfig());
  console.log("Created Goods Return Note:", res.data);
  return res.data;
};

// Update a return note
export const updateGoodsReturn = async (
  id: string,
  payload: Partial<IGoodsReturnNote>
): Promise<IGoodsReturnNote> => {
  const res = await axios.patch(`${API_URL}/${id}/status`, payload, getAuthConfig());
  return res.data;
};

// Delete a return note
export const deleteGoodsReturn = async (id: string): Promise<{ success: boolean }> => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};

// Fetch available GRNs for return
export const fetchAvailableGRNs = async (): Promise<GRNForReturn[]> => {
  const res = await axios.get(`${API_URL}/grn`, {
   ... getAuthConfig(),
    params: {
      userId: getUserId(),
    }
  });
  return res.data;
};


export const exportSingleGRNToPDF = async (id: string): Promise<Blob> => {
  const res = await axios.get(`${API_URL}/export/${id}`, {
    ...getAuthConfig(),
    responseType: "blob", 
  });

  if (res.data.size === 0) {
    throw new Error("Exported file is empty");
  }

  return res.data;
};
