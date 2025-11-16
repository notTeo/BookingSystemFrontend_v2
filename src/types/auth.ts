import type { SubscriptionTier } from "./common";
import type { UserProfile } from "./user";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  // later: login(), logout(), refresh(), etc.
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