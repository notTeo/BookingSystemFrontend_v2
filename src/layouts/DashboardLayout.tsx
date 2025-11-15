import React from "react";
import { Outlet, Link } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "220px",
          borderRight: "1px solid #ddd",
          padding: "1rem",
        }}
      >
        <h2>Dashboard</h2>
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
          <li>
            <Link to="/shops/new">Create Shop</Link>
          </li>
          <li>
            <Link to="/settings/account">Account</Link>
          </li>
          <li>
            <Link to="/settings/billing">Billing</Link>
          </li>
        </ul>
      </aside>

      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
