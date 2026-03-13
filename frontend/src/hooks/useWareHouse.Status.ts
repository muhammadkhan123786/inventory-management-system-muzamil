"use client";

import axios from "axios";
import { IWarehouseStatus } from "../../../common/IWarehouse.status.interface";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/warehouse-status`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id;
};

export const fetchWarehouseStatuses = async (
  page = 1,
  limit = 10,
  search = ""
) => {
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

export const createWarehouseStatus = async (
  payload: Partial<IWarehouseStatus>
) => {
  const res = await axios.post(API_URL, payload, getAuthConfig());
  return res.data;
};

export const updateWarehouseStatus = async (
  id: string,
  payload: Partial<IWarehouseStatus>
) => {
  const res = await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
  return res.data;
};

export const deleteWarehouseStatus = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};
