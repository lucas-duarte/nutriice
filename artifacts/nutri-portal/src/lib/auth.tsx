import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";
import type { UserInfo } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [cachedUser, setCachedUser] = useState<UserInfo | null>(null);
  const [, setLocation] = useLocation();

  const { data: fetchedUser, isLoading: isUserLoading, isError } = useGetCurrentUser({
    query: {
      enabled: !!token && !cachedUser,
      retry: false,
    },
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("auth_token");
      setToken(null);
      setCachedUser(null);
      setLocation("/login");
    }
  }, [isError, setLocation]);

  const login = (newToken: string, user: UserInfo) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setCachedUser(user);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setCachedUser(null);
    setLocation("/login");
  };

  const user = cachedUser ?? fetchedUser ?? null;
  const isLoading = !!token && !user && isUserLoading;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
