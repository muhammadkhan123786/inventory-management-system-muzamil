"use client";
import axios from "axios";
import { IUnit } from "../../../common/IUnit.interface";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/units`;

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

export const fetchUnits = async (page = 1, limit = 10, search = "") => {
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

export const createUnit = async (payload: Partial<IUnit>) => {
  const res = await axios.post(API_URL, payload, getAuthConfig());
  return res.data;
};

export const updateUnit = async (id: string, payload: Partial<IUnit>) => {
  const res = await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
  return res.data;
};

export const deleteUnit = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};
