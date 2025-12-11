import type { AxiosError } from "axios";
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import type { ApiResponse } from "../types/common";

const API_URL = import.meta.env.VITE_API_URL;
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
  // if value is null, write an expired cookie
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
  writeCookie(ACTIVE_SHOP_COOKIE, shopId !== null ? String(shopId) : null);
}

export function getActiveShopId(): number | null {
  return activeShopId;
}

// Clear both cookies AND in-memory state
export function clearAuthCookies(): void {
  setAccessToken(null);
  setActiveShopId(null);
}

// ---- axios client ----
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth + shop headers on each request
apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (activeShopId !== null && !config.headers["x-shop-id"]) {
    config.headers["x-shop-id"] = String(activeShopId);
  }
  return config;
});

// Global response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      clearAuthCookies();
      if (isBrowser && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
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
      const message =
        apiData?.message || error.message || "Something went wrong. Please try again.";

      throw new Error(message);
    }

    // Non-Axios error, just rethrow
    throw error;
  }
}

export { apiClient };
