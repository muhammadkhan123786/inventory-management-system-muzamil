import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ================= TYPES =================

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

// ================= TOKEN =================

const getToken = () => {
  const rawToken = localStorage.getItem("token");
  return rawToken ? rawToken.replace(/"/g, "").trim() : "";
};

// ================= UNIVERSAL FORMDATA BUILDER =================

const toFormData = (
  obj: any,
  formData: FormData = new FormData(),
  parentKey: string = "",
): FormData => {
  if (obj === null || obj === undefined) return formData;

  if (obj instanceof Date) {
    formData.append(parentKey, obj.toISOString());
  } else if (obj instanceof File) {
    formData.append(parentKey, obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      const key = `${parentKey}[${index}]`;
      toFormData(value, formData, key);
    });
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = parentKey ? `${parentKey}[${key}]` : key;
      toFormData(value, formData, newKey);
    });
  } else {
    formData.append(parentKey, String(obj));
  }

  return formData;
};

// ================= AUTO DETECT FILE =================

const hasFile = (obj: any): boolean => {
  if (!obj) return false;

  if (obj instanceof File) return true;

  if (Array.isArray(obj)) {
    return obj.some((item) => hasFile(item));
  }

  if (typeof obj === "object") {
    return Object.values(obj).some((value) => hasFile(value));
  }

  return false;
};

// ================= COMMON REQUEST HANDLER =================

const request = async <T>(
  method: "get" | "post" | "put" | "delete",
  endpoint: string,
  payload?: any,
  params?: any,
): Promise<T> => {
  try {
    const token = getToken();

    let finalPayload = payload;
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (payload && hasFile(payload)) {
      finalPayload = toFormData(payload);
    } else if (payload) {
      headers["Content-Type"] = "application/json";
    }

    const config: AxiosRequestConfig = {
      headers,
      params,
    };

    const response = await api.request<T>({
      url: endpoint,
      method,
      data: finalPayload,
      ...config,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data || { message: error.message };
    }
    throw { message: "Unknown error occurred" };
  }
};

// ================= CRUD METHODS =================

export const getAll = async <T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<PaginatedResponse<T>> => {
  return request<PaginatedResponse<T>>("get", endpoint, undefined, params);
};

export const getById = async <T>(
  endpoint: string,
  id: string,
): Promise<{ success: boolean; data: T }> => {
  return request<{ success: boolean; data: T }>("get", `${endpoint}/${id}`);
};

export const createItem = async <T>(
  endpoint: string,
  payload: any,
): Promise<T> => {
  return request<T>("post", endpoint, payload);
};

export const updateItem = async <T>(
  endpoint: string,
  id: string,
  payload: any,
): Promise<T> => {
  return request<T>("put", `${endpoint}/${id}`, payload);
};

export const deleteItem = async (
  endpoint: string,
  id: string,
): Promise<{ success: boolean; message?: string }> => {
  return request<{ success: boolean; message?: string }>(
    "delete",
    `${endpoint}/${id}`,
  );
};
