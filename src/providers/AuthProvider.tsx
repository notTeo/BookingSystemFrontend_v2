// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import { clearClientState } from "../api/http";
import { getCurrentUser } from "../api/user";
import { logout as apiLogout } from "../api/auth";
import type { AuthContextValue, UserProfile } from "../types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  

  const logout = useCallback(async () => {
    setUser(null);
    clearClientState(); // clears active shop cookie only

    try {
      await apiLogout(); // clears HttpOnly cookies on backend
    } catch {
      // ignore (user is already logged out client-side)
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    isLoading,
    setUser,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
