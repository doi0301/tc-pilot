"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download } from "lucide-react";
import DashboardCards, { PERSPECTIVE_LABEL } from "./DashboardCards";
import IssuePanel from "./IssuePanel";
import { exportTcToXlsx } from "@/lib/xlsx-export";
import type { TestCase } from "@/types";

const STATUS_OPTIONS = [
  { value: "미확인", label: "미확인" },
  { value: "진행중", label: "진행중" },
  { value: "PASS", label: "PASS" },
  { value: "FAIL", label: "FAIL" },
] as const;

const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
  P1: { bg: "var(--priority-p1-bg)", text: "var(--priority-p1-text)" },
  P2: { bg: "var(--priority-p2-bg)", text: "var(--priority-p2-text)" },
  P3: { bg: "var(--priority-p3-bg)", text: "var(--priority-p3-text)" },
  P4: { bg: "var(--priority-p4-bg)", text: "var(--priority-p4-text)" },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  PASS: { bg: "var(--status-pass-badge)", text: "var(--status-pass-text)" },
  FAIL: { bg: "var(--status-fail-badge)", text: "var(--status-fail-text)" },
  진행중: { bg: "var(--status-progress-badge)", text: "var(--status-progress-text)" },
  미확인: { bg: "var(--status-pending-badge)", text: "var(--status-pending-text)" },
};

const PERSPECTIVE_STYLE: Record<string, { bg: string; text: string }> = {
  N: { bg: "var(--tag-normal-bg)", text: "var(--tag-normal-text)" },
  E: { bg: "var(--tag-exception-bg)", text: "var(--tag-exception-text)" },
  A: { bg: "var(--tag-authority-bg)", text: "var(--tag-authority-text)" },
  R: { bg: "var(--tag-error-bg)", text: "var(--tag-error-text)" },
  D: { bg: "var(--tag-data-bg)", text: "var(--tag-data-text)" },
};

/** 테스트 절차 텍스트를 1. 2. 3. 또는 1) 2) 3) 기준으로 줄바꿈 */
function formatSteps(text: string): string {
  if (!text?.trim()) return "-";
  return text.replace(/\s+(?=\d+[.)]\s)/g, "\n").trim();
}

export default function TCTab({ projectId }: { projectId?: string }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuePanelTc, setIssuePanelTc] = useState<TestCase | null>(null);

  const fetchTcs = useCallback(async () => {
    setLoading(true);
    try {
      const url = projectId
        ? `/api/tc?projectId=${projectId}`
        : "/api/tc";
      const res = await fetch(url);
      const data = await res.json();
      setTestCases(data.testCases ?? []);
    } catch {
      setTestCases([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTcs();
  }, [fetchTcs]);

  const handleStatusChange = async (tc: TestCase, newStatus: string) => {
    if (!tc.id) return;
    try {
      const res = await fetch(`/api/tc/${tc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("업데이트 실패");
      setTestCases((prev) =>
        prev.map((t) => (t.id === tc.id ? { ...t, status: newStatus as TestCase["status"] } : t))
      );
      if (newStatus === "FAIL") setIssuePanelTc({ ...tc, status: "FAIL" });
    } catch {
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12" style={{ color: "var(--text-secondary)" }}>
        <Loader2 className="animate-spin" size={24} />
        <span>TC 목록 불러오는 중...</span>
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <div
        className="py-16 text-center rounded-lg border"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          아직 생성된 TC가 없어요
        </p>
        <p className="text-base mb-4" style={{ color: "var(--text-secondary)" }}>
          스펙 변환 탭에서 기획서를 업로드하고 TC를 생성하세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <DashboardCards testCases={testCases} />
        <button
          type="button"
          onClick={() => exportTcToXlsx(testCases)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border shrink-0"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
          }}
        >
          <Download size={16} />
          xlsx 다운로드
        </button>
      </div>

      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "var(--border-default)" }}>
        <table className="w-full min-w-[1100px] table-fixed">
          <colgroup>
            <col style={{ width: 90 }} />
            <col style={{ width: 52 }} />
            <col style={{ width: 40 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 56 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: 68 }} />
          </colgroup>
          <thead style={{ background: "var(--bg-sidebar)" }}>
            <tr>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                TC ID
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                관점
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                우선순위
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                TC 제목
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                화면코드
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                사전조건
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                테스트 절차
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                기대결과
              </th>
              <th className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                P/F
              </th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc, i) => {
              const statusStyle = STATUS_STYLE[tc.status] ?? STATUS_STYLE["미확인"];
              const persStyle = PERSPECTIVE_STYLE[tc.test_perspective] ?? PERSPECTIVE_STYLE.N;
              const prioStyle = PRIORITY_STYLE[tc.priority] ?? PRIORITY_STYLE.P3;
              const isFail = tc.status === "FAIL";
              return (
                <tr
                  key={tc.id ?? i}
                  className="hover:bg-[var(--bg-hover)]"
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isFail ? "var(--status-fail-bg)" : undefined,
                    borderLeft: isFail ? "3px solid var(--point-default)" : undefined,
                  }}
                >
                  <td className="px-1.5 py-1.5 font-mono text-xs align-top whitespace-nowrap" style={{ color: "var(--text-link)" }}>
                    {tc.tc_id}
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <span
                      className="inline-block px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                      style={{ background: persStyle.bg, color: persStyle.text }}
                    >
                      {PERSPECTIVE_LABEL[tc.test_perspective] ?? tc.test_perspective}
                    </span>
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <span
                      className="inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: prioStyle.bg, color: prioStyle.text }}
                    >
                      {tc.priority}
                    </span>
                  </td>
                  <td className="px-1.5 py-1.5 text-sm align-top" style={{ color: "var(--text-primary)" }}>
                    {tc.title}
                  </td>
                  <td className="px-1.5 py-1.5 font-mono text-xs align-top whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                    {tc.screen_code || "-"}
                  </td>
                  <td className="px-1.5 py-1.5 text-xs align-top" style={{ color: "var(--text-secondary)" }}>
                    <span className="line-clamp-2" title={tc.preconditions}>
                      {tc.preconditions || "-"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-sm align-top" style={{ color: "var(--text-secondary)" }}>
                    <span className="whitespace-pre-line block" style={{ lineHeight: 1.6 }}>
                      {formatSteps(tc.steps ?? "")}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-sm align-top" style={{ color: "var(--text-secondary)" }}>
                    <span className="whitespace-pre-line block" style={{ lineHeight: 1.6 }}>
                      {formatSteps(tc.expected_result ?? "")}
                    </span>
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <select
                      value={tc.status}
                      onChange={(e) => handleStatusChange(tc, e.target.value)}
                      className="text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-1"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        minWidth: 72,
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <IssuePanel
        tc={issuePanelTc}
        projectId={projectId}
        onClose={() => setIssuePanelTc(null)}
        onRegistered={() => {
          setIssuePanelTc(null);
          fetchTcs();
        }}
      />
    </div>
  );
}
