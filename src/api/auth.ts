import { request } from "./http";
import type { AuthTokens, ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordPayload } from "../types/auth";

export async function registerUser(payload: RegisterPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/register", data: payload });
  return data;
}

export async function preRegisterUser(payload: RegisterPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/pre-register", data: payload });
  return data;
}

export async function verifyEmail() {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/verify-email" });
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const data = await request<AuthTokens>({ method: "POST", url: "/auth/login", data: payload });
  return data;
}

export async function logout() {
  return request<{ ok: true }>({ method: "POST", url: "/auth/logout" });
}


export async function refreshAccessToken() {
  const data = await request<{ accessToken: string }>({
    method: "POST",
    url: "/auth/refresh",
  });
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