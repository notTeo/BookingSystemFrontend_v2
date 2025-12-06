import React from "react";

import "./TopBar.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const TopBar: React.FC = () => {

  const { user, logout } = useAuth();
  return (
    <>
      <header className="public__topbar">
        <div className="public__topbarInner">
          <Link to="/" className="public__brand">
            BookingSystem
          </Link>

          <nav className="public__nav">
            {user ? (
              <>
                <Link className="btn btn--ghost" to="/overview">
                  Overview
                </Link>
                <button className="btn btn--primary app-topbar__logout" type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn--ghost" to="/login">
                  Log in
                </Link>
                <Link className="btn btn--primary" to="/register">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default TopBar;
