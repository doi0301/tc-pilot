"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download, FileText, ChevronRight, Pencil, Trash2 } from "lucide-react";
import DashboardCards, { PERSPECTIVE_LABEL } from "./DashboardCards";
import IssuePanel from "./IssuePanel";
import { exportTcToXlsx } from "@/lib/xlsx-export";
import type { TestCase, TcBatch } from "@/types";

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

/** 생성일 포맷 (MM/DD HH:mm) */
function formatCreatedAt(iso?: string | null): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch {
    return "-";
  }
}

export default function TCTab({ projectId }: { projectId?: string }) {
  const [batches, setBatches] = useState<TcBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [registeredTcIds, setRegisteredTcIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tcLoading, setTcLoading] = useState(false);
  const [issuePanelTc, setIssuePanelTc] = useState<TestCase | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [perspectiveFilter, setPerspectiveFilter] = useState<string>("all");
  const [featureGroupFilter, setFeatureGroupFilter] = useState<string>("all");

  const fetchBatches = useCallback(async () => {
    try {
      const url = projectId ? `/api/tc/batches?projectId=${projectId}` : "/api/tc/batches";
      const res = await fetch(url);
      const data = await res.json();
      const list = data.batches ?? [];
      setBatches(list);
      setSelectedBatchId((prev) => (prev && list.some((b: TcBatch) => b.id === prev)) ? prev : list[0]?.id ?? null);
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchTcs = useCallback(async () => {
    if (!selectedBatchId) {
      setTestCases([]);
      return;
    }
    setTcLoading(true);
    try {
      const tcUrl = projectId
        ? `/api/tc?projectId=${projectId}&batchId=${encodeURIComponent(selectedBatchId)}`
        : `/api/tc?batchId=${encodeURIComponent(selectedBatchId)}`;
      const issueUrl = projectId ? `/api/issues?projectId=${projectId}` : "/api/issues";
      const [tcRes, issueRes] = await Promise.all([fetch(tcUrl), fetch(issueUrl)]);
      const tcData = await tcRes.json();
      const issueData = await issueRes.json();
      setTestCases(tcData.testCases ?? []);
      const ids = new Set<string>((issueData.issues ?? []).map((i: { tc_id: string }) => i.tc_id));
      setRegisteredTcIds(ids);
    } catch {
      setTestCases([]);
      setRegisteredTcIds(new Set());
    } finally {
      setTcLoading(false);
    }
  }, [projectId, selectedBatchId]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    if (selectedBatchId) fetchTcs();
    else setTestCases([]);
  }, [selectedBatchId, fetchTcs]);

  const handleBatchEdit = (batch: TcBatch) => {
    if (batch.id === "__unbatched__") return;
    setEditingBatchId(batch.id);
    setEditingTitle(batch.title);
  };

  const handleBatchSave = async () => {
    if (!editingBatchId) return;
    const title = editingTitle.trim();
    if (!title) {
      alert("제목을 입력해주세요.");
      return;
    }
    try {
      const res = await fetch(`/api/tc/batches/${editingBatchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "수정 실패");
      }
      setEditingBatchId(null);
      setEditingTitle("");
      fetchBatches();
    } catch (e) {
      alert(e instanceof Error ? e.message : "수정 실패");
    }
  };

  const handleBatchDelete = async (batch: TcBatch) => {
    if (batch.id === "__unbatched__") return;
    if (!confirm(`"${batch.title}" 배치를 삭제할까요? (TC는 미분류로 이동됩니다)`)) return;
    try {
      const res = await fetch(`/api/tc/batches/${batch.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "삭제 실패");
      }
      if (selectedBatchId === batch.id) {
        const remaining = batches.filter((b) => b.id !== batch.id);
        setSelectedBatchId(remaining[0]?.id ?? null);
      }
      fetchBatches();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

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

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  const uniqueFeatureGroups = Array.from(
    new Set(testCases.map((tc) => tc.feature_group).filter(Boolean))
  ).sort();

  const filteredTestCases =
    perspectiveFilter === "all" && featureGroupFilter === "all"
      ? testCases
      : testCases.filter((tc) => {
          const matchPerspective =
            perspectiveFilter === "all" || tc.test_perspective === perspectiveFilter;
          const matchFeatureGroup =
            featureGroupFilter === "all" || tc.feature_group === featureGroupFilter;
          return matchPerspective && matchFeatureGroup;
        });

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12" style={{ color: "var(--text-secondary)" }}>
        <Loader2 className="animate-spin" size={24} />
        <span>TC 목록 불러오는 중...</span>
      </div>
    );
  }

  if (batches.length === 0) {
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
    <div className="flex gap-6 min-w-0 min-h-0">
      {/* 1depth: 배치 리스트 */}
      <aside
        className="w-56 shrink-0 rounded-lg border overflow-y-auto"
        style={{
          borderColor: "var(--border-default)",
          background: "var(--bg-surface)",
          maxHeight: "calc(100vh - 280px)",
        }}
      >
        <div className="p-2">
          <p className="text-xs font-medium px-2 py-1 mb-2" style={{ color: "var(--text-subtle)" }}>
            TC 생성 배치
          </p>
          {batches.map((batch) => {
            const isSelected = selectedBatchId === batch.id;
            const isUnbatched = batch.id === "__unbatched__";
            const isEditing = editingBatchId === batch.id;

            if (isEditing) {
              return (
                <div key={batch.id} className="px-2 py-1.5 mb-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleBatchSave();
                      if (e.key === "Escape") {
                        setEditingBatchId(null);
                        setEditingTitle("");
                      }
                    }}
                    autoFocus
                    className="w-full px-2 py-1 text-sm rounded border"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={handleBatchSave}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: "var(--point-default)",
                        color: "var(--text-inverse)",
                      }}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBatchId(null);
                        setEditingTitle("");
                      }}
                      className="text-xs px-2 py-1 rounded btn-ghost"
                    >
                      취소
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={batch.id}
                className="group flex items-center gap-1 mb-1 rounded-md"
                style={{
                  background: isSelected ? "var(--bg-selected)" : "transparent",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedBatchId(batch.id)}
                  className="flex-1 min-w-0 text-left px-3 py-2 flex items-center gap-2"
                  style={{
                    color: isSelected ? "var(--point-default)" : "var(--text-primary)",
                  }}
                >
                  <ChevronRight
                    size={14}
                    className={`shrink-0 ${isSelected ? "opacity-100" : "opacity-40"}`}
                  />
                  <span className="flex-1 truncate text-sm font-medium">{batch.title}</span>
                  <span className="text-xs shrink-0" style={{ color: "var(--text-subtle)" }}>
                    {batch.tc_count ?? 0}개
                  </span>
                </button>
                {!isUnbatched && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pr-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBatchEdit(batch);
                      }}
                      className="p-1 rounded hover:bg-[var(--bg-hover)]"
                      title="제목 수정"
                    >
                      <Pencil size={14} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBatchDelete(batch);
                      }}
                      className="p-1 rounded hover:bg-[var(--status-fail-bg)]"
                      title="삭제"
                    >
                      <Trash2 size={14} style={{ color: "var(--status-fail-text)" }} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* 2depth: 상세 테이블 */}
      <div className="flex-1 min-w-0 space-y-6">
        {tcLoading ? (
          <div className="flex items-center gap-2 py-12" style={{ color: "var(--text-secondary)" }}>
            <Loader2 className="animate-spin" size={24} />
            <span>TC 불러오는 중...</span>
          </div>
        ) : testCases.length === 0 ? (
          <div
            className="py-12 text-center rounded-lg border"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              {selectedBatch ? `"${selectedBatch.title}"에 TC가 없습니다.` : "배치를 선택하세요."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-wrap">
                <DashboardCards testCases={filteredTestCases} />
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  {selectedBatch?.title} · {filteredTestCases.length}개
                  {filteredTestCases.length !== testCases.length && (
                    <span> (전체 {testCases.length}개)</span>
                  )}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    관점:
                  </span>
                  <select
                    value={perspectiveFilter}
                    onChange={(e) => setPerspectiveFilter(e.target.value)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="all">전체</option>
                    {Object.entries(PERSPECTIVE_LABEL).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>
                    기능그룹:
                  </span>
                  <select
                    value={featureGroupFilter}
                    onChange={(e) => setFeatureGroupFilter(e.target.value)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="all">전체</option>
                    {uniqueFeatureGroups.map((fg) => (
                      <option key={fg} value={fg}>
                        {fg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => exportTcToXlsx(filteredTestCases)}
                className="btn-secondary inline-flex items-center gap-1.5 shrink-0"
              >
                <Download size={16} />
                xlsx 다운로드
              </button>
            </div>

            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--border-default)" }}
            >
              <table className="w-full min-w-[1240px] table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: 90 }} />
                  <col style={{ width: 56 }} />
                  <col style={{ width: 64 }} />
                  <col style={{ width: 56 }} />
                  <col style={{ width: 64 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: 120 }} />
                </colgroup>
                <thead style={{ background: "var(--bg-sidebar)" }}>
                  <tr>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      TC ID
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      화면코드
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      생성일
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      관점
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      우선순위
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      TC 제목
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      사전조건
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      테스트 절차
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      기대결과
                    </th>
                    <th
                      className="text-left py-1.5 px-1.5 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      P/F
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTestCases.map((tc, i) => {
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
                        <td
                          className="px-1.5 py-1.5 font-mono text-xs align-top whitespace-nowrap overflow-hidden"
                          style={{ color: "var(--text-link)" }}
                        >
                          {tc.tc_id}
                        </td>
                        <td
                          className="px-1.5 py-1.5 font-mono text-xs align-top whitespace-nowrap overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {tc.screen_code || "-"}
                        </td>
                        <td
                          className="px-1.5 py-1.5 text-xs align-top whitespace-nowrap overflow-hidden"
                          style={{ color: "var(--text-subtle)" }}
                          title={tc.created_at}
                        >
                          {formatCreatedAt(tc.created_at)}
                        </td>
                        <td className="px-1.5 py-1.5 align-top overflow-hidden">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap max-w-full truncate"
                            style={{ background: persStyle.bg, color: persStyle.text }}
                          >
                            {PERSPECTIVE_LABEL[tc.test_perspective] ?? tc.test_perspective}
                          </span>
                        </td>
                        <td className="px-1.5 py-1.5 align-top overflow-hidden">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: prioStyle.bg, color: prioStyle.text }}
                          >
                            {tc.priority}
                          </span>
                        </td>
                        <td
                          className="px-1.5 py-1.5 text-sm align-top overflow-hidden"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <span className="block break-words" style={{ wordBreak: "break-word" }}>
                            {tc.title}
                          </span>
                        </td>
                        <td
                          className="px-1.5 py-1.5 text-xs align-top overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span className="line-clamp-2 block break-words" title={tc.preconditions} style={{ wordBreak: "break-word" }}>
                            {tc.preconditions || "-"}
                          </span>
                        </td>
                        <td
                          className="px-2 py-1.5 text-sm align-top overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span className="whitespace-pre-line block break-words" style={{ lineHeight: 1.6, wordBreak: "break-word" }}>
                            {formatSteps(tc.steps ?? "")}
                          </span>
                        </td>
                        <td
                          className="px-2 py-1.5 text-sm align-top overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span className="whitespace-pre-line block break-words" style={{ lineHeight: 1.6, wordBreak: "break-word" }}>
                            {formatSteps(tc.expected_result ?? "")}
                          </span>
                        </td>
                        <td className="px-1.5 py-1.5 align-top overflow-hidden min-w-0">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                              <select
                                value={tc.status}
                                onChange={(e) => handleStatusChange(tc, e.target.value)}
                                className="text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 shrink-0"
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
                              {isFail && (
                                <button
                                  type="button"
                                  onClick={() => setIssuePanelTc({ ...tc, status: "FAIL" })}
                                  className={`p-1 rounded text-xs inline-flex items-center gap-0.5 shrink-0 ${
                                    !registeredTcIds.has(tc.tc_id) ? "btn-ghost" : ""
                                  }`}
                                  title={registeredTcIds.has(tc.tc_id) ? "이슈 등록됨 (클릭하여 수정)" : "이슈 등록"}
                                  style={
                                    registeredTcIds.has(tc.tc_id)
                                      ? {
                                          background: "var(--status-pass-badge)",
                                          color: "var(--status-pass-text)",
                                        }
                                      : undefined
                                  }
                                >
                                  <FileText size={14} />
                                  <span className="text-xs">
                                    {registeredTcIds.has(tc.tc_id) ? "이슈 ✓" : "이슈"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
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
