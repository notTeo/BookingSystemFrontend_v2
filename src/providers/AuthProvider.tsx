import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { AuthContextValue, UserProfile } from "../types";
import { getCurrentUser } from "../api/user";
import { getAccessToken } from "../api/http";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;

    const token = getAccessToken();
    console.log(token)
    if (!token) {
      setIsLoading(false);
      return;
    }
    const fetchUser = async () => {

      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) return;

        setUser(currentUser ?? null);
      } catch (error) {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextValue = { user, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
