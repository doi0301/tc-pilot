"use client";

interface ModalProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--bg-overlay)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg border p-6 max-w-md w-full shadow-lg"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

