import React from "react";
import { Outlet, Link } from "react-router-dom";

const PublicLayout: React.FC = () => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Main</Link> | <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
