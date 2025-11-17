import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/common";

const DEFAULT_BASE_URL = "http://localhost:4000/api/v1";
const ACCESS_TOKEN_COOKIE = "booking_access_token";
const ACTIVE_SHOP_COOKIE = "booking_active_shop";

const isBrowser = typeof document !== "undefined";

function readCookie(name: string): string | null {
  if (!isBrowser) return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(name.length + 1));
}

function writeCookie(name: string, value: string | null): void {
  if (!isBrowser) return;
  const base = `${name}=${value ? encodeURIComponent(value) : ""}; path=/; SameSite=Lax`;
  document.cookie = value ? base : `${base}; expires=${new Date(0).toUTCString()}`;
}

// ---- initial in-memory state hydrated from cookies ----
let accessToken: string | null = readCookie(ACCESS_TOKEN_COOKIE);

function readActiveShopId(): number | null {
  const raw = readCookie(ACTIVE_SHOP_COOKIE);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
}

let activeShopId: number | null = readActiveShopId();

// ---- axios client ----
const apiClient: AxiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (activeShopId !== null && config.headers && !config.headers["x-shop-id"]) {
    config.headers["x-shop-id"] = String(activeShopId);
  }
  return config;
});

// ---- token helpers ----
export function setAccessToken(token: string | null): void {
  accessToken = token;
  writeCookie(ACCESS_TOKEN_COOKIE, token);
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ---- active shop helpers ----
export function setActiveShopId(shopId: number | null): void {
  activeShopId = shopId;
  writeCookie(
    ACTIVE_SHOP_COOKIE,
    shopId !== null ? String(shopId) : null,
  );
}

export function getActiveShopId(): number | null {
  return activeShopId;
}

// ---- generic request helper ----
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data.data;
}

export { apiClient };
