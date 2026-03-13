import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import toast from 'react-hot-toast';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

const getAuthConfig = (): AxiosRequestConfig => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};




export const getAll = async <T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<PaginatedResponse<T>> => {
  try {
    console.log("param", params)
    const response = await api.get<PaginatedResponse<T>>(endpoint, {
      ...getAuthConfig(),
      params,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

export const getAlls = async <T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<PaginatedResponse<T>> => {
  try {
    const rawToken = localStorage.getItem("token");

    const cleanToken = rawToken ? rawToken.replace(/"/g, "").trim() : "";

    const response = await api.get<PaginatedResponse<T>>(endpoint, {
      params,
      headers: {
        ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
      },
    });
    console.log(response);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.warn("Session expired. Redirecting to login...");
      }
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

// CREATE
export const createItem = async <T>(
  endpoint: string,
  payload: T,
): Promise<T> => {
  try {
    const rawToken = localStorage.getItem("token");

    const isFormData = payload instanceof FormData;
    const headers: Record<string, string> = {
      Authorization: rawToken ? `Bearer ${rawToken}` : "",
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    console.log(
      "[API] createItem - isFormData:",
      isFormData,
      "headers:",
      headers,
    );
    const response = await api.post<T>(endpoint, payload, { headers });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

export const getById = async <T>(
  endpoint: string,
  id: string,
): Promise<{ success: boolean; data: T }> => {
  try {
    const rawToken = localStorage.getItem("token");
    const cleanToken = rawToken ? rawToken.replace(/"/g, "").trim() : "";

    const response = await api.get<{ success: boolean; data: T }>(
      `${endpoint}/${id}`,
      {
        headers: {
          ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
        },
      },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};
// UPDATE
export const updateItem = async <T>(
  endpoint: string,
  id: string,
  payload: T,
): Promise<T> => {
  try {
    const rawToken = localStorage.getItem("token");

    // If payload is FormData, don't set Content-Type - let axios handle it
    const isFormData = payload instanceof FormData;
    const headers: Record<string, string> = {
      Authorization: rawToken ? `Bearer ${rawToken}` : "",
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await api.put<T>(`${endpoint}/${id}`, payload, {
      headers,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

// DELETE
export const deleteItem = async (
  endpoint: string,
  id: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(
      `${endpoint}/${id}`,
      getAuthConfig(),
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

// Test Connection Api

// Inside your useFormActions hook or marketplace helper

const getUserId = () => {
  if (typeof window === "undefined") return "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id || "";
};


export const marketplaceAPIHelper = async (
  endpoint: string,
  id: string,
  lastEndPoint: string,

): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.post<{ success: boolean; message?: string }>(
      `${endpoint}/${id}/${getUserId()}/${lastEndPoint}`,
      {},
      getAuthConfig(),

    );
    console.log("respse", response)
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      toast.error(error.response?.data?.message || "Server Error");
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

