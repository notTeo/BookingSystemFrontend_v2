import { request } from "./http";
import type { InventoryItem, InventoryPayload } from "../types/inventory";

export function listInventory() {
  return request<InventoryItem[]>({ method: "GET", url: "/shop/inventory" });
}

export function createInventoryItem(payload: InventoryPayload) {
  return request<InventoryItem>({ method: "POST", url: "/shop/inventory", data: payload });
}

export function updateInventoryItem(id: number, payload: Partial<InventoryPayload>) {
  return request<InventoryItem>({ method: "PATCH", url: `/shop/inventory/${id}`, data: payload });
}

export function deleteInventoryItem(id: number) {
  return request<null>({ method: "DELETE", url: `/shop/inventory/${id}` });
}