"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Download, ImagePlus, Trash2 } from "lucide-react";
import { exportIssuesToXlsx } from "@/lib/issue-xlsx-export";
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
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notionFailed, setNotionFailed] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = !!tc;

  useEffect(() => {
    if (tc) {
      setTitle(`${tc.screen_code} — ${tc.title}`);
      setReproductionSteps(tc.steps ?? "");
      setExpected(tc.expected_result ?? "");
      setActual("");
      setSeverity("Major");
      setError(null);
      setNotionFailed(false);
      setScreenshotUrl(null);
    }
  }, [tc]);

  const handleEnhance = async () => {
    if (!tc || !actual.trim()) {
      setError("실제결과를 먼저 입력해주세요.");
      return;
    }

    setError(null);
    setEnhanceLoading(true);

    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tcContext: tc,
          actualResult: actual,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI 보강 실패");

      setReproductionSteps(data.reproductionSteps ?? reproductionSteps);
      setActual(data.actual ?? actual);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 보강 실패");
    } finally {
      setEnhanceLoading(false);
    }
  };

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
            screenshot_url: screenshotUrl ?? undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Notion 등록 실패");
      onRegistered();
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록 실패");
      setNotionFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleXlsxBackup = () => {
    if (!tc) return;
    const backupIssue: Issue = {
      tc_id: tc.tc_id,
      title,
      severity,
      reproduction_steps: reproductionSteps,
      expected,
      actual,
      ...(screenshotUrl && { screenshot_url: screenshotUrl }),
    };
    exportIssuesToXlsx([backupIssue], `이슈_${tc.tc_id}_백업.xlsx`);
  };

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 첨부 가능합니다 (JPEG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/screenshot", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      setScreenshotUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "스크린샷 업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveScreenshot = () => setScreenshotUrl(null);

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
            className="btn-ghost p-2"
            aria-label="닫기"
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
              스크린샷
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleScreenshotChange}
              className="hidden"
            />
            {screenshotUrl ? (
              <div className="space-y-2">
                <div className="relative inline-block">
                  <img
                    src={screenshotUrl}
                    alt="스크린샷"
                    className="max-h-40 rounded border object-contain"
                    style={{ borderColor: "var(--border-default)" }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="absolute -top-1 -right-1 p-1 rounded-full"
                    style={{
                      background: "var(--status-fail-bg)",
                      color: "var(--status-fail-text)",
                    }}
                    aria-label="스크린샷 제거"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  첨부됨 (5MB 이하, JPEG/PNG/GIF/WebP)
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-4 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-sm"
                style={{
                  borderColor: "var(--border-bold)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <ImagePlus size={18} />
                    이미지 첨부 (선택)
                  </>
                )}
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              심각도
            </label>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_OPTIONS.map((s) => {
                const isSelected = severity === s;
                const style = {
                  Critical: { bg: "var(--severity-critical-bg)", text: "var(--severity-critical-text)" },
                  Major: { bg: "var(--severity-major-bg)", text: "var(--severity-major-text)" },
                  Minor: { bg: "var(--severity-minor-bg)", text: "var(--severity-minor-text)" },
                  Low: { bg: "var(--severity-low-bg)", text: "var(--severity-low-text)" },
                }[s];
                return (
                  <label
                    key={s}
                    className={`flex items-center cursor-pointer px-2.5 py-1 rounded text-sm font-medium border-2 transition-all ${
                      isSelected ? "" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      background: style.bg,
                      color: style.text,
                      borderColor: isSelected ? "var(--border-focused)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={s}
                      checked={isSelected}
                      onChange={() => setSeverity(s)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-md text-sm space-y-2"
              style={{ background: "var(--status-fail-bg)", color: "var(--status-fail-text)" }}
            >
              <p>{error}</p>
              {notionFailed && (
                <>
                  <p className="font-medium">xlsx로 다운로드하여 수동 등록하세요.</p>
                  <button
                    type="button"
                    onClick={handleXlsxBackup}
                    className="btn-secondary inline-flex items-center gap-1.5 text-xs"
                  >
                    <Download size={14} />
                    이슈 xlsx 다운로드
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <footer
          className="p-4 border-t shrink-0 flex justify-end gap-2"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border-default)",
          }}
        >
          <button
            onClick={handleEnhance}
            disabled={enhanceLoading || loading || !actual.trim()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            {enhanceLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                AI가 이슈 내용을 정리하고 있어요...
              </>
            ) : (
              "AI 보강"
            )}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
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
