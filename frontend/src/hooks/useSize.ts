"use client";

import axios from "axios";
import { ISize } from "../../../common/ISize.interface";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sizes`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const fetchSizes = async (page = 1, limit = 10, search = "") => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await axios.get(API_URL, {
    ...getAuthConfig(),
    params: {
      userId: user.id || user._id,
      page,
      limit,
      search,
    },
  });
  return res.data;
};

export const createSize = async (payload: Partial<ISize>) => {
  const res = await axios.post(API_URL, payload, getAuthConfig());
  return res.data;
};

export const updateSize = async (id: string, payload: Partial<ISize>) => {
  const res = await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
  return res.data;
};

export const deleteSize = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};
