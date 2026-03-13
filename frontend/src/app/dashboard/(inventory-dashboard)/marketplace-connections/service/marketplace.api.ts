import axios, { AxiosRequestConfig } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/marketplace`;

// Get logged-in user's ID from localStorage
const getUserId = (): string => {
  if (typeof window === "undefined") return "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id || "";
};

// Get Axios config with token
const getAuthConfig = (): AxiosRequestConfig => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Fetch all marketplaces
export const getMarketplaces = async () => {
  const res = await axios.get(API_URL, getAuthConfig());
  return res.data.data;
};

// Create a new marketplace
export const createMarketplace = async (payload: {
  name: string;
  description?: string;
  credentials: string;
  type: string; 
  isActive?: boolean;
  isDefault?: boolean;
}) => {
  // Inject userId automatically
  const userId = getUserId();
  const finalPayload = {
    userId,
    ...payload,
    credentials: JSON.stringify(payload.credentials), // backend expects string
  };

  const res = await axios.post(API_URL, finalPayload, getAuthConfig());
  return res.data;
};
