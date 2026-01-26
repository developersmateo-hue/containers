"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: any | null;
  login: (userData: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user_session");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData: any) => {
    localStorage.setItem("user_session", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
  document.cookie = "auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  localStorage.removeItem("user_session");
  window.location.href = "/login";
};

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
