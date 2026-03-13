"use client";
import { getAll, createItem, updateItem, deleteItem } from "@/helper/apiHelper";
import { IWarehouse } from "../../../common/IWarehouses.interface";

const ENDPOINT = "/warehouses";

export interface WarehouseResponse {
  data: IWarehouse[];
  total: number;
  page: number;
  limit: number;
}

export const fetchWarehouses = async (
  page = 1,
  limit = 10,
  search = ""
): Promise<WarehouseResponse> => {
  const res = await getAll<IWarehouse>(ENDPOINT, { page, limit, search });
  return res;
};

export const createWarehouse = async (
  payload: IWarehouse
): Promise<IWarehouse> => {
  const res = await createItem<IWarehouse>(ENDPOINT, payload);
  return res;
};

export const updateWarehouse = async (
  id: string,
  payload: IWarehouse
): Promise<IWarehouse> => {
  const res = await updateItem<IWarehouse>(ENDPOINT, id, payload);
  return res;
};

export const deleteWarehouse = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  const res = await deleteItem(ENDPOINT, id);
  return res;
};
