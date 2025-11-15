export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  // later: login(), logout(), refresh(), etc.
};
