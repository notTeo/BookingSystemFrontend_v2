import { request, setAccessToken } from "./http";
import type { AuthTokens, ForgotPasswordPayload, LoginPayload, RefreshPayload, RegisterPayload, ResetPasswordPayload } from "../types/auth";

export async function registerUser(payload: RegisterPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/register", data: payload });
  setAccessToken(data.accessToken);
  return data;
}

export async function preRegisterUser(payload: RegisterPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/pre-register", data: payload });
  setAccessToken(data.accessToken);
  return data;
}

export async function verifyEmail() {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/verify-email" });
  setAccessToken(data.accessToken);
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/login", data: payload });
  setAccessToken(data.accessToken);
  return data;
}

export async function refreshAccessToken(payload: RefreshPayload) {
  const data = await request<{ accessToken: string }>({
    method: "POST",
    url: "/auth/refresh",
    data: payload,
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const data = await request<void>({ method: "POST", url: "/auth/forgot-password", data: payload });
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const data = await request<void>({ method: "POST", url: "/auth/reset-password", data: payload });
  return data;
}