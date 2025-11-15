import React, { createContext, useContext, useState, useEffect } from "react";
import type {AuthContextValue, AuthUser} from "../types/auth"



const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TEMP for now: fake user so you can see protected pages
  useEffect(() => {
    // TODO: replace with real /me call
    // setUser(null); // when you want it locked
    setUser({
      id: "demo",
      email: "demo@example.com",
      name: "Demo User",
    });
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
