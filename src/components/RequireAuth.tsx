import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../i18n";

const RequireAuth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useI18n();

  if (isLoading) {
    return <p>{t("Loading...")}</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
