import { request } from "./http";
import type {
  BookingWithRelations,
  CreateBookingPayload,
  ListBookingParams,
} from "../types/bookings";
import type { BookingStatus } from "../types/common";

export function createBooking(payload: CreateBookingPayload) {
  return request<BookingWithRelations>({ method: "POST", url: "/shop/bookings", data: payload });
}

export function listBookings(params?: ListBookingParams) {
  return request<BookingWithRelations[]>({ method: "GET", url: "/shop/bookings", params });
}

export function getBooking(id: number) {
  return request<BookingWithRelations>({ method: "GET", url: `/shop/bookings/${id}` });
}

export function updateBookingStatus(id: number, status: BookingStatus, note?: string) {
  return request<BookingWithRelations>({
    method: "PATCH",
    url: `/shop/bookings/${id}/status`,
    data: { status, note },
  });
}

export function cancelBooking(id: number) {
  return request<{ cancelled: boolean }>({ method: "DELETE", url: `/shop/bookings/${id}` });
}
