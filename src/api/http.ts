import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import type { ApiResponse } from "../types/common";

const DEFAULT_BASE_URL = "http://localhost:5000/api/v1";

let accessToken: string | null = null;
let activeShopId: number | null = null;

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
  if (activeShopId && config.headers && !config.headers["x-shop-id"]) {
    config.headers["x-shop-id"] = String(activeShopId);
  }
  return config;
});

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setActiveShopId(shopId: number | null): void {
  activeShopId = shopId;
}

export function getActiveShopId(): number | null {
  return activeShopId;
}

export function setApiBaseUrl(baseURL: string): void {
  apiClient.defaults.baseURL = baseURL || DEFAULT_BASE_URL;
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data.data;
}

export { apiClient };