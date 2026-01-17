import React from "react";
import { Outlet } from "react-router-dom";

import SideBar from "../components/Sidebar/Sidebar";

const DashboardLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SideBar />

      <main className="app-main">
        <div className="app-main__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
