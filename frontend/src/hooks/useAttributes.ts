"use client";
import axios from "axios";
import { IAttribute } from "../../../common/IProductAttributes.interface";
import { Attribute } from "../app/dashboard/add-product/types/product";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product-attributes`;

interface AttributeResponse {
  data: Attribute[];
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

export const fetchAttributes = async (
  page = 1,
  limit = 10,
  search = "",
  categoryIds: string,
): Promise<AttributeResponse> => {
   const res = await axios.get(API_URL, {
    ...getAuthConfig(),
    params: {
      userId: getUserId(),
      page,
      limit,
      search,
      categoryIds,
    },
    paramsSerializer: params =>
      new URLSearchParams(params as any).toString(),
  });
  return res.data;
};

export const fetchAttributesss = async (
  
): Promise<AttributeResponse> => {
   const res = await axios.get(API_URL, {
    ...getAuthConfig(),
    params: {
      userId: getUserId(),
      
    },
   
  });
  return res.data;
};

export const createAttribute = async (
  payload: Partial<IAttribute>
): Promise<IAttribute> => {
  const res = await axios.post(API_URL, payload, getAuthConfig());
 
  return res.data;
};

export const updateAttribute = async (
  id: string,
  payload: Partial<IAttribute>
): Promise<IAttribute> => {
  const res = await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
  return res.data;
};

export const deleteAttribute = async (
  id: string
): Promise<{ success: boolean }> => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};

export const fetchAttributeById = async (id: string): Promise<IAttribute> => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};


export const fetchAttributesByCategoryIds = async (
  categoryIds: string[]
): Promise<IAttribute[]> => {
  if (!categoryIds.length) return [];

  const res = await axios.get(`${API_URL}/by-categories`, {
    ...getAuthConfig(),
    params: {
      categoryIds: categoryIds.join(","), // 👈 important
      userId: getUserId(),
    },
  });

  return res.data.data; // backend should return { data: IAttribute[] }
};
