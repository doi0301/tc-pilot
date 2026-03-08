"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { TestCase, Issue } from "@/types";

const SEVERITY_OPTIONS: Issue["severity"][] = ["Critical", "Major", "Minor", "Low"];

interface IssuePanelProps {
  tc: TestCase | null;
  projectId?: string;
  onClose: () => void;
  onRegistered: () => void;
}

export default function IssuePanel({
  tc,
  projectId,
  onClose,
  onRegistered,
}: IssuePanelProps) {
  const [title, setTitle] = useState("");
  const [reproductionSteps, setReproductionSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [severity, setSeverity] = useState<Issue["severity"]>("Major");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = !!tc;

  useEffect(() => {
    if (tc) {
      setTitle(`${tc.screen_code} — ${tc.title}`);
      setReproductionSteps(tc.steps ?? "");
      setExpected(tc.expected_result ?? "");
      setActual("");
      setSeverity("Major");
      setError(null);
    }
  }, [tc]);

  const handleSubmit = async () => {
    const pid = projectId ?? tc?.project_id;
    if (!tc || !pid) return;
    if (!actual.trim()) {
      setError("실제결과를 입력해주세요.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: {
            project_id: pid,
            tc_id: tc.tc_id,
            title,
            severity,
            reproduction_steps: reproductionSteps,
            expected,
            actual,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Notion 등록 실패");
      onRegistered();
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        style={{ background: "var(--bg-overlay)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px] flex flex-col bg-white shadow-xl"
        style={{
          width: "var(--slide-panel-width)",
          background: "var(--bg-elevated)",
          boxShadow: "var(--shadow-panel)",
          borderLeft: "1px solid var(--border-default)",
        }}
      >
        <header
          className="flex items-center justify-between p-5 border-b shrink-0"
          style={{ borderColor: "var(--border-default)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            이슈 등록
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-[var(--bg-hover)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              재현순서
            </label>
            <textarea
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              기대결과
            </label>
            <textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              실제결과 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="실제로 발생한 결과를 입력하세요"
              rows={4}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              심각도
            </label>
            <div className="flex gap-3">
              {SEVERITY_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={s}
                    checked={severity === s}
                    onChange={() => setSeverity(s)}
                  />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-md text-sm"
              style={{ background: "var(--status-fail-bg)", color: "var(--status-fail-text)" }}
            >
              {error}
            </div>
          )}
        </div>

        <footer
          className="p-4 border-t shrink-0 flex justify-end"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border-default)",
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md font-semibold text-white flex items-center gap-2 disabled:opacity-60"
            style={{ background: "var(--point-default)" }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                등록 중...
              </>
            ) : (
              "Notion 등록"
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}
