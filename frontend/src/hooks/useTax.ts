"use client";

import axios from "axios";
import { ITax } from "../../../common/ITax.interface";
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tax`;
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id;
};
export const fetchTaxes = async (page = 1, limit = 10, search = "") => {
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
export const createTax = async (payload: Partial<ITax>) => {
  const res = await axios.post(API_URL, payload, getAuthConfig());
  return res.data;
};
export const updateTax = async (id: string, payload: Partial<ITax>) => {
  const res = await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
  return res.data;
};
export const deleteTax = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};
