"use client";

import axios from "axios";
import { IIcons } from "../../../common/master-interfaces/IIcons.interface";

// Backend route ke mutabiq API URL
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/icons`;

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

/**
 * Icons fetch karne ke liye (with Pagination & Search)
 */
export const fetchIcons = async (page = 1, limit = 10, search = "") => {
  try {
    const res = await axios.get(API_URL, {
      ...getAuthConfig(),
      params: {
        userId: getUserId(),
        page,
        limit,
        search, // Backend searchFields: ["iconName"] ko use karega
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching icons:", error);
    throw error;
  }
};

/**
 * Naya Icon create karne ke liye (Base64 string as icon)
 */
export const createIcon = async (payload: Partial<IIcons>) => {
  try {
    const res = await axios.post(API_URL, payload, getAuthConfig());
    return res.data;
  } catch (error) {
    console.error("Error creating icon:", error);
    throw error;
  }
};

/**
 * Icon update karne ke liye
 */
export const updateIcon = async (id: string, payload: Partial<IIcons>) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
    return res.data;
  } catch (error) {
    console.error("Error updating icon:", error);
    throw error;
  }
};

/**
 * Icon delete karne ke liye
 */
export const deleteIcon = async (id: string) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    return res.data;
  } catch (error) {
    console.error("Error deleting icon:", error);
    throw error;
  }
};