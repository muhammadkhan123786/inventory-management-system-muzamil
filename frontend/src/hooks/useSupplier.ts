"use client";

import {
  getAlls,
  getById,
  createItem,
  updateItem,
  deleteItem,
} from "../helper/apiHelper";
import { SupplierDTO } from "../../../common/DTOs/supplier/supplier.dto";

const ENDPOINT = "/suppliers";

/**
 * Fetch All Suppliers
 * @param page Number
 * @param limit Number
 * @param search String
 */
export const fetchSuppliers = async (page = 1, limit = 10, search = "") => {
  const params = { page, limit, search };
  return await getAlls<SupplierDTO>(ENDPOINT, params);
};

export const fetchSupplierById = async (id: string) => {
  return await getById<SupplierDTO>(ENDPOINT, id);
};

export const createSupplier = async (payload: SupplierDTO | FormData) => {
  return await createItem<SupplierDTO | FormData>(ENDPOINT, payload);
};

export const updateSupplier = async (
  id: string,
  payload: SupplierDTO | FormData
) => {
  return await updateItem<SupplierDTO | FormData>(ENDPOINT, id, payload);
};

export const removeSupplier = async (id: string) => {
  return await deleteItem(ENDPOINT, id);
};
