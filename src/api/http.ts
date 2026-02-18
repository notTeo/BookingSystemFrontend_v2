import type { AxiosError } from "axios";
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import type { ApiResponse } from "../types/common";

const API_URL = import.meta.env.VITE_API_URL;
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

function readActiveShopId(): number | null {
  const raw = readCookie(ACTIVE_SHOP_COOKIE);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
}

let activeShopId: number | null = readActiveShopId();

export function setActiveShopId(shopId: number | null): void {
  activeShopId = shopId;
  writeCookie(ACTIVE_SHOP_COOKIE, shopId !== null ? String(shopId) : null);
}

export function getActiveShopId(): number | null {
  return activeShopId;
}

export function clearClientState(): void {
  // Only client-side state we own is active shop.
  // Auth cookies are HttpOnly, so we cannot clear them here.
  setActiveShopId(null);
  // Redirect to login if in a browser context
  if (isBrowser && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

// ---- axios client ----
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // REQUIRED for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach shop header on each request
apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (activeShopId !== null && !config.headers["x-shop-id"]) {
    config.headers["x-shop-id"] = String(activeShopId);
  }

  return config;
});

// ---- refresh-on-401 with request queue ----
let isRefreshing = false;
let refreshWaiters: Array<(ok: boolean) => void> = [];

function notifyWaiters(ok: boolean) {
  refreshWaiters.forEach((fn) => fn(ok));
  refreshWaiters = [];
}

async function runRefresh(): Promise<boolean> {
  try {
    // IMPORTANT: use a plain axios call to avoid interceptor recursion.
    await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true, headers: { "Content-Type": "application/json" } },
    );
    return true;
  } catch {
    return false;
  }
}

// Global response interceptor: handle 401 by refreshing once and retrying
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status !== 401 || !original) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the 401 came from refresh itself
    const url = (original.url ?? "").toString();
    if (url.includes("/auth/refresh")) {
      clearClientState();
      return Promise.reject(error);
    }

    if (original._retry) {
      // Already retried once; treat as logged out
      clearClientState();
      return Promise.reject(error);
    }

    original._retry = true;

    // If a refresh is already happening, wait for it
    if (isRefreshing) {
      const ok = await new Promise<boolean>((resolve) => refreshWaiters.push(resolve));
      if (!ok) {
        clearClientState();
        return Promise.reject(error);
      }
      return apiClient(original);
    }

    isRefreshing = true;
    const ok = await runRefresh();
    isRefreshing = false;
    notifyWaiters(ok);

    if (!ok) {
      clearClientState();
      return Promise.reject(error);
    }

    return apiClient(original);
  },
);

// ---- generic request helper ----
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiData = error.response?.data as ApiResponse<unknown> | undefined;
      const message = apiData?.message || error.message || "Something went wrong. Please try again.";
      throw new Error(message);
    }
    throw error;
  }
}

export { apiClient };
