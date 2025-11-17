import React, { useEffect } from "react";

import { useShop } from "../../../../providers/ShopProvider";
import { getActiveShopId } from "../../../../api/http";

const ShopOverviewPage: React.FC = () => {
  const shopId = getActiveShopId();
  const { currentShop, isLoading, refreshShop } = useShop();

  useEffect(() => {
    if (!shopId) return;
    refreshShop();
  }, [shopId, refreshShop]);

  if (!shopId) return <p>No shop selected.</p>;
  if (isLoading) return <p>Loading shop...</p>;
  if (!currentShop) return <p>Shop not found or not loaded.</p>;

  return (
    <div>
      <h1>{currentShop.shop.name}</h1>
      {/* render overview details from currentShop */}
    </div>
  );
};

export default ShopOverviewPage;
