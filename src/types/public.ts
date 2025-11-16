import type { DayOfWeek, ShopRole } from "./common";

export interface PublicShopHour {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface PublicProvider {
  id: number;
  role: ShopRole;
  bookable: boolean;
  user: {
    firstName: string;
    lastName: string;
  };
}

export interface PublicService {
  id: number;
  name: string;
  duration: number;
  price: number;
  description?: string | null;
  active: boolean;
}

export interface PublicBookingPayload {
  serviceId: number;
  providerId?: number | null;
  startTime: string; // ISO string
  customerName?: string | null;
  customerPhone: string;
  note?: string | null;
}

export interface PublicSlotsResponse {
  date: string;
  serviceId: number;
  slots: Array<{
    startTime: string;
    providerIds: number[];
  }>;
}

export interface SlotSearchParams {
  shopId: number;
  serviceId: number;
  date: string; // YYYY-MM-DD
  providerId?: number;
}
