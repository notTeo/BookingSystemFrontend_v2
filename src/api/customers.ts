import { request } from "./http";
import type { BookingWithRelations } from "../types/bookings";
import type { PaginatedResult } from "../types/common";
import type {
  Customer,
  CustomerBookingsQuery,
  ListCustomersParams,
  UpdateCustomerPayload,
} from "../types/customers";

export function listCustomers(params?: ListCustomersParams) {
  return request<PaginatedResult<Customer>>({ method: "GET", url: "/shop/customers", params });
}

export function getCustomer(id: number) {
  return request<Customer>({ method: "GET", url: `/shop/customers/${id}` });
}

export function listCustomerBookings(id: number, params?: CustomerBookingsQuery) {
  return request<PaginatedResult<BookingWithRelations>>({
    method: "GET",
    url: `/shop/customers/${id}/bookings`,
    params,
  });
}

export function updateCustomer(id: number, payload: UpdateCustomerPayload) {
  return request<Customer>({ method: "PATCH", url: `/shop/customers/${id}`, data: payload });
}

export function deleteCustomer(id: number) {
  return request<null>({ method: "DELETE", url: `/shop/customers/${id}` });
}
