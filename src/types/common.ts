export type SubscriptionTier = "MEMBER" | "STARTER" | "PRO";
export type ShopRole = "OWNER" | "MANAGER" | "STAFF";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELED" | "NO_SHOW" | "COMPLETED";
export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}