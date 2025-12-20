import type { SubscriptionTier } from "./common";
import type { UserProfile } from "./user";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  subscription: SubscriptionTier;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface RefreshPayload {
  refreshToken: string;
}

export type ForgotPasswordPayload = {
  email: string;
}

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
}