
export type Shop = {
    id: string;
    name: string;
    slug?: string; // optional, use later if you want
  };
  
  export type ShopContextValue = {
    currentShop: Shop | null;
    setCurrentShop: (shop: Shop | null) => void;
  };
  