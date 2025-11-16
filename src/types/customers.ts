export interface Customer {
    id: number;
    shopId: number;
    name: string;
    phone: string;
    email?: string | null;
    note?: string | null;
    banned: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface ListCustomersParams {
    q?: string;
    page?: number;
    limit?: number;
    sort?: "name" | "createdAt";
    order?: "asc" | "desc";
  }
  
  export interface CustomerBookingsQuery {
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
  
  export interface UpdateCustomerPayload {
    name?: string;
    phone?: string;
    email?: string;
    note?: string;
    banned?: boolean;
  }