import { request } from "./http";
import type { HealthPayload, StatusPayload } from "../types/system";

export function fetchSystemWelcome() {
  return request<null>({ method: "GET", url: "/system" });
}

export function fetchSystemHealth() {
  return request<HealthPayload>({ method: "GET", url: "/system/health" });
}

export function fetchSystemStatus() {
  return request<StatusPayload>({ method: "GET", url: "/system/status" });
}