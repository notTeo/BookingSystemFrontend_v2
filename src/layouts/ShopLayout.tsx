import React from "react";
import { Outlet } from "react-router-dom";

const ShopLayout: React.FC = () => {

  return (
    <div>

      <main style={{ padding: "0 1rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ShopLayout;
