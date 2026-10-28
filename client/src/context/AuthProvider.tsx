import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, clearToken, getToken, setToken } from "../lib/api";
import type { AuthResponse, User } from "../types";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null);

  useEffect(() => {
    if (!getToken()) return;

    api<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const startDemo = useCallback(async () => {
    const data = await api<AuthResponse>("/auth/demo", { method: "POST" });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, startDemo, logout }),
    [user, loading, login, register, startDemo, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}