import { request } from "./http";
import type { BookingWithRelations } from "../types/bookings";
import type { PublicBookingPayload, PublicProvider, PublicService, PublicShopHour, PublicSlotsResponse, SlotSearchParams } from "../types/public";
import type { ShopSummary } from "../types/shop";

export function getPublicShop(shopId: number) {
  return request<ShopSummary>({ method: "GET", url: `/public/shops/${shopId}` });
}

export function getPublicShopHours(shopId: number) {
  return request<PublicShopHour[]>({ method: "GET", url: `/public/shops/${shopId}/opening-hours` });
}

export function listPublicServices(shopId: number, query?: string) {
  return request<PublicService[]>({
    method: "GET",
    url: `/public/shops/${shopId}/services`,
    params: query ? { q: query } : undefined,
  });
}

export function getPublicService(shopId: number, serviceId: number) {
  return request<PublicService>({ method: "GET", url: `/public/shops/${shopId}/services/${serviceId}` });
}

export function listPublicProviders(shopId: number) {
  return request<PublicProvider[]>({ method: "GET", url: `/public/shops/${shopId}/providers` });
}

export function getPublicProvider(shopId: number, providerId: number) {
  return request<PublicProvider>({
    method: "GET",
    url: `/public/shops/${shopId}/providers/${providerId}`,
  });
}

export function getPublicSlots(params: SlotSearchParams) {
  return request<PublicSlotsResponse>({
    method: "GET",
    url: `/public/shops/${params.shopId}/slots`,
    params: {
      serviceId: params.serviceId,
      date: params.date,
      providerId: params.providerId,
    },
  });
}

export function createPublicBooking(shopId: number, payload: PublicBookingPayload) {
  return request<BookingWithRelations>({
    method: "POST",
    url: `/public/shops/${shopId}/bookings`,
    data: payload,
  });
}