"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      setSubmitting(false);
      onClose();
      onSuccess?.();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="관리자 로그인">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            placeholder="admin@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            required
          />
        </div>
        {error && (
          <div
            className="text-sm p-3 rounded"
            style={{ background: "var(--status-fail-bg)", color: "var(--status-fail-text)" }}
          >
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2 text-sm"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

