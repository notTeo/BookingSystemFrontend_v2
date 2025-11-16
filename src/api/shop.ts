import { request, setActiveShopId } from "./http";
import type {
  CreateShopPayload,
  Invite,
  InvitePayload,
  ShopOverviewStats,
  ShopSummary,
  ShopWithHours,
  UpdateShopPayload,
} from "../types/shop";

export function listUserShops() {
  return request<ShopSummary[]>({ method: "GET", url: "/shop/all" });
}

export function createShop(payload: CreateShopPayload) {
  return request<ShopWithHours>({ method: "POST", url: "/shop", data: payload });
}

export function updateShop(payload: UpdateShopPayload) {
  return request<ShopWithHours>({ method: "PATCH", url: "/shop", data: payload });
}

export function deleteShop() {
  return request<null>({ method: "DELETE", url: "/shop" });
}

export function sendInvite(payload: InvitePayload) {
  return request<Invite>({ method: "POST", url: "/shop/invite", data: payload });
}

export function getShopOverview() {
  return request<ShopOverviewStats>({ method: "GET", url: "/shop" });
}

export function selectActiveShop(shopId: number) {
  setActiveShopId(shopId);
}
