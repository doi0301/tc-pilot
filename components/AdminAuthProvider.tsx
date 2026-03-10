"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

interface AdminAuthContextValue {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/admin/session", { credentials: "include" });
        if (!res.ok) throw new Error("세션 확인 실패");
        const data = await res.json();
        if (!cancelled) {
          setIsAdmin(Boolean(data.isAdmin));
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setIsAdmin(false);
      throw new Error(data.error || "로그인에 실패했습니다.");
    }
    setIsAdmin(true);
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setIsAdmin(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      loading,
      error,
      login,
      logout,
    }),
    [isAdmin, loading, error, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

