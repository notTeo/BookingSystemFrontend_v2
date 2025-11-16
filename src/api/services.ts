import { request } from "./http";
import type { Service, ServicePayload } from "../types/services";

export function listServices() {
  return request<Service[]>({ method: "GET", url: "/shop/service" });
}

export function createService(payload: ServicePayload) {
  return request<Service>({ method: "POST", url: "/shop/service", data: payload });
}

export function getService(id: number) {
  return request<Service>({ method: "GET", url: `/shop/service/${id}` });
}

export function updateService(id: number, payload: Partial<ServicePayload>) {
  return request<Service>({ method: "PATCH", url: `/shop/service/${id}`, data: payload });
}

export function deleteService(id: number) {
  return request<null>({ method: "DELETE", url: `/shop/service/${id}` });
}