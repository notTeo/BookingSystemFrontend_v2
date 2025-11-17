// AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { getAccessToken } from "../api/http";
import { getCurrentUser } from "../api/user";
import type { AuthContextValue, UserProfile } from "../types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const accessToken = getAccessToken();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // no token → definitely logged out
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      console.log(currentUser)
      setUser(currentUser ?? null);
    } catch (error) {
      console.error("getCurrentUser failed", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refreshUser();
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    setUser,    
    refreshUser 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
