import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import type { ShopContextValue, ShopOverviewStats } from "../types/shop";
import { getShopOverview } from "../api/shop";

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentShop, setCurrentShop] = useState<ShopOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshShop = useCallback(async () => {
    setIsLoading(true);
    try {
      const shop = await getShopOverview();
      setCurrentShop(shop ?? null);
    } catch (error) {
      console.error("getShopOverview failed", error);
      setCurrentShop(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: ShopContextValue = {
    currentShop,
    isLoading,
    refreshShop,
    setCurrentShop,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return ctx;
};
