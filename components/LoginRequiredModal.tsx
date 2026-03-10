"use client";

import { Modal } from "./Modal";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export function LoginRequiredModal({ open, onClose, onLoginClick }: LoginRequiredModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="관리자 로그인 필요">
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        스펙 변환과 TC 자동 생성, 이슈 등록 기능은 관리자 전용입니다. TC Pilot 관리자 계정으로 로그인한 뒤 다시 시도해주세요.
      </p>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className="btn-ghost text-sm" onClick={onClose}>
          취소
        </button>
        <button
          type="button"
          className="btn-primary text-sm"
          onClick={onLoginClick}
        >
          로그인
        </button>
      </div>
    </Modal>
  );
}

