import type { BookingStatus, DayOfWeek, InviteStatus, ShopRole } from "./common";
import type { Service } from "./services";

export interface ShopContextValue {
  currentShop: ShopOverviewStats | null;
  isLoading: boolean;
  refreshShop: () => Promise<void>;
  setCurrentShop: (shop: ShopOverviewStats | null) => void;
}



export interface Invite {
  id: number;
  shopId: number;
  email: string;
  role: ShopRole;
  status: InviteStatus;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHour {
  id?: number;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ShopSummary {
  id: number;
  name: string;
  address?: string | null;
  active: boolean;
  role?: ShopRole;
  bookable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopOverviewStats {
  shop: ShopSummary;
  totalBookings: number;
  activeServices: number;
  teamMembers: number;
  monthlyRevenue: number;
  recentBookings: Array<{
    id: number;
    name: string;
    serviceName: string;
    staffFirstName: string;
    staffLastName: string;
    date: string;
    status: BookingStatus;
  }>;
}

export interface CreateShopPayload {
  name: string;
  openingHours: Array<{
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }>;
}

export interface UpdateShopPayload {
  name?: string;
  address?: string | null;
  active?: boolean;
  openingHours?: Array<{
    dayOfWeek: string;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
  }> | null;
}

export interface InvitePayload {
  email: string;
  role: Exclude<ShopRole, "OWNER">;
  message?: string;
}

export type ShopWithHours = ShopSummary & { workingHours?: OpeningHour[] };

export interface ProviderProfile {
  id: number;
  userId: number;
  shopId: number;
  role: ShopRole;
  active: boolean;
  bookable: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  services?: Service[];
  workingHours?: OpeningHour[];
}

export interface ShopUserRecord {
  id: number;
  shopId: number;
  userId: number;
  role: ShopRole;
  active: boolean;
  bookable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopUserToggleResult {
  updated: ShopUserRecord;
}

export interface ShopUserRoleSummary {
  userId: number;
  role: ShopRole;
  active: boolean;
  bookable: boolean;
}
