export interface InventoryItem {
    id: number;
    shopId: number;
    name: string;
    quantity: number;
    category?: string | null;
    unit?: string | null;
    photoUrl?: string | null;
    active: boolean;
    lowStock?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface InventoryPayload {
    name: string;
    quantity: number;
    unit?: string;
    category?: string;
    photoUrl?: string;
    active?: boolean;
    lowStock?: boolean;
  }