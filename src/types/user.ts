import type { SubscriptionTier } from "./common";

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subscription: SubscriptionTier;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface DeleteUserPayload {
  password: string;
}
