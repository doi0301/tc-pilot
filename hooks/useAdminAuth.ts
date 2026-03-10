"use client";

import { useContext } from "react";
import { AdminAuthContext } from "@/components/AdminAuthProvider";

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth는 AdminAuthProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

