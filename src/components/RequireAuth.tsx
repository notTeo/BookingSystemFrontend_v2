import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Spinner } from "react-bootstrap";

const RequireAuth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // While you’re checking token / fetching / whatever
  if (isLoading) {
    return <Spinner/>; // or your spinner
  }

  // Not logged in → kick to login, remember where they came from
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
