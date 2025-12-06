import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar/TopBar";

const PublicLayout: React.FC = () => {
  return (
    <div>
      <TopBar/>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
