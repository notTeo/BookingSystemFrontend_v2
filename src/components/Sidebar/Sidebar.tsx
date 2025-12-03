import React from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../../providers/AuthProvider";
import { useShop } from "../../providers/ShopProvider";
import { setActiveShopId } from "../../api/http";

const SideBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentShop, setCurrentShop } = useShop();
  const location = useLocation();

  if (!user) return null;

  const isShopRoute = location.pathname.startsWith("/shops/") && location.pathname !== "/shops";

  return (
    <aside
      style={{
        width: "220px",
        height: "100%",
        borderRight: "1px solid #ddd",
        padding: "1rem",
      }}
    >
      <h2>Dashboard</h2>

      {isShopRoute ? (
        <>
          <Link
            to="/overview"
            onClick={() => {
              setActiveShopId(null);
              setCurrentShop(null);
            }}
          >
            Back
          </Link>

          <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem" }}>
            <li>
              <Link to={`/shops/${currentShop?.shop.name}`}>Shop Overview</Link>
            </li>
            {/* shop-specific links */}
            <li>
              <Link to={`/shops/${currentShop?.shop.name}/calendar`}>Calendar</Link>
            </li>
            <li>
              <Link to={`/shops/${currentShop?.shop.name}/team`}>Team</Link>
            </li>
            <li>
              <Link to={`/shops/${currentShop?.shop.name}/services`}>Services</Link>
            </li>
          </ul>
        </>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <Link to="/overview">Overview</Link>
            </li>
            <li>
              <Link to="/inbox">Inbox</Link>
            </li>
            <li>
              <Link to="/shops">All Shops</Link>
            </li>

            {user.shops.map((shop) => (
              <li key={shop.id}>
                <Link
                  to={`/shops/${shop.name}`} // route param is just visual here
                  onClick={() => {
                    setActiveShopId(shop.id); // real source of truth
                  }}
                >
                  {shop.name}
                </Link>
              </li>
            ))}

            <li>
              <Link to="/new-shop">Create Shop</Link>
            </li>
            <li>
              <Link to="/settings/account">Account</Link>
            </li>
            <li>
              <Link to="/settings/billing">Billing</Link>
            </li>
          </ul>
        </>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <p>
          {user.firstName} {user.lastName}
        </p>
      </div>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </aside>
  );
};

export default SideBar;
