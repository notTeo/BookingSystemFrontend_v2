import { request, setAccessToken } from "./http";
import type { AuthTokens, LoginPayload, RefreshPayload, RegisterPayload } from "../types/auth";

export async function registerUser(payload: RegisterPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/register", data: payload });
  setAccessToken(data.accessToken);
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/login", data: payload });
  setAccessToken(data.accessToken);
  return data;
}

export async function refreshAccessToken(payload: RefreshPayload) {
  const data = await request<{ accessToken: string }>({ method: "POST", url: "/auth/refresh", data: payload });
  setAccessToken(data.accessToken);
  return data;
}