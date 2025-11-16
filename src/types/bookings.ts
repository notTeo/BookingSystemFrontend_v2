import type { BookingStatus } from "./common";
import type { Customer } from "./customers";
import type { Service } from "./services";

export interface Booking {
  id: number;
  shopId: number;
  serviceId: number;
  providerId?: number | null;
  customerId: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  note?: string | null;
}

export interface BookingWithRelations extends Booking {
  service?: Service;
  provider?: {
    id: number;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email?: string | null;
    } | null;
  } | null;
  customer?: Customer;
}

export interface CreateBookingPayload {
  serviceId: number;
  startTime: string;
  endTime?: string;
  providerId?: number;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  note?: string;
}

export interface ListBookingParams {
  status?: BookingStatus;
  from?: string;
  to?: string;
  providerId?: number;
  serviceId?: number;
}