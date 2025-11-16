export interface Service {
    id: number;
    shopId: number;
    name: string;
    duration: number; // minutes
    price: number;
    description?: string | null;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface ServicePayload {
    name: string;
    duration: number;
    price: number;
    description?: string;
    active?: boolean;
  }