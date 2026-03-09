"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ExternalLink, Download } from "lucide-react";
import { exportIssuesToXlsx } from "@/lib/issue-xlsx-export";
import type { Issue } from "@/types";

const SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  Critical: { bg: "var(--status-fail-badge)", text: "var(--status-fail-text)" },
  Major: { bg: "var(--priority-p1-bg)", text: "var(--priority-p1-text)" },
  Minor: { bg: "var(--priority-p2-bg)", text: "var(--priority-p2-text)" },
  Low: { bg: "var(--status-pending-badge)", text: "var(--status-pending-text)" },
};

function getNotionUrl(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, "")}`;
}

export default function IssueLogTab({ projectId }: { projectId?: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const url = projectId
        ? `/api/issues?projectId=${projectId}`
        : "/api/issues";
      const res = await fetch(url);
      const data = await res.json();
      setIssues(data.issues ?? []);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const filtered = severityFilter === "all"
    ? issues
    : issues.filter((i) => i.severity === severityFilter);

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 py-12 rounded-lg border p-4"
        style={{
          color: "var(--text-secondary)",
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <Loader2 className="animate-spin" size={24} />
        <span>이슈 목록 불러오는 중...</span>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div
        className="py-16 text-center rounded-lg border p-4"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
          boxShadow: "0 1px 2px rgba(23,43,77,0.04)",
        }}
      >
        <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          등록된 이슈가 없어요
        </p>
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          TC 목록에서 FAIL 선택 후 이슈를 등록하면 여기에 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 p-4 rounded-lg border"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
        boxShadow: "0 1px 2px rgba(23,43,77,0.04)",
      }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            심각도:
          </span>
          <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-sm px-2 py-1 rounded border"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
          }}
        >
          <option value="all">전체</option>
          <option value="Critical">Critical</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
          <option value="Low">Low</option>
        </select>
        </div>
        <button
          type="button"
          onClick={() => exportIssuesToXlsx(filtered)}
          className="btn-secondary inline-flex items-center gap-1.5 shrink-0"
        >
          <Download size={16} />
          xlsx 다운로드
        </button>
      </div>

      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "var(--border-default)" }}>
        <table className="w-full min-w-[800px]">
          <thead style={{ background: "var(--bg-sidebar)" }}>
            <tr>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                TC ID
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                이슈 제목
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                심각도
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Notion
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                등록일
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue, i) => {
              const sevStyle = SEVERITY_STYLE[issue.severity] ?? SEVERITY_STYLE.Low;
              const notionUrl = issue.notion_page_id ? getNotionUrl(issue.notion_page_id) : null;
              return (
                <tr
                  key={issue.id ?? i}
                  className="hover:bg-[var(--bg-hover)]"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <td className="px-3 py-2 font-mono text-sm" style={{ color: "var(--text-link)" }}>
                    {issue.tc_id}
                  </td>
                  <td className="px-3 py-2 text-sm" style={{ color: "var(--text-primary)" }}>
                    {issue.title}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: sevStyle.bg, color: sevStyle.text }}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {notionUrl ? (
                      <a
                        href={notionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium"
                        style={{ color: "var(--text-link)" }}
                      >
                        <ExternalLink size={14} />
                        열기
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {issue.created_at
                      ? new Date(issue.created_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
