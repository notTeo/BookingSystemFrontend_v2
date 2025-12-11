// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import { clearAuthCookies, getAccessToken } from "../api/http";
import { getCurrentUser } from "../api/user";
import type { AuthContextValue, UserProfile } from "../types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const latestToken = getAccessToken();
    setToken((prev) => (prev === latestToken ? prev : latestToken));
    if (!latestToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      console.log(currentUser);
      setUser(currentUser ?? null);
    } catch (error) {
      console.error("getCurrentUser failed", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    setUser(null);
    clearAuthCookies();
  };

  useEffect(() => {
    void refreshUser();
  }, [token, refreshUser]);

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
