"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Download, FileText, ChevronRight, Pencil, Trash2, Upload, ExternalLink, ArrowLeft } from "lucide-react";
import DashboardCards, { PERSPECTIVE_LABEL } from "./DashboardCards";
import IssuePanel from "./IssuePanel";
import { LoginRequiredModal } from "./LoginRequiredModal";
import { AdminLoginModal } from "./AdminLoginModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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

const PRIORITY_TOOLTIP: Record<string, string> = {
  P1: "필수 — 반드시 검증해야 하는 핵심 기능",
  P2: "중요 — 핵심 기능, 검증 권장",
  P3: "일반 — 일반적인 검증 대상",
  P4: "낮음 — 선택적 검증",
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
  const [importing, setImporting] = useState(false);
  const [googleSheetsModal, setGoogleSheetsModal] = useState<{ formula: string; csvUrl: string; isLocalhost: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAdminAuth();
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchBatches = useCallback(async () => {
    try {
      const url = projectId ? `/api/tc/batches?projectId=${projectId}` : "/api/tc/batches";
      const res = await fetch(url);
      const data = await res.json();
      const list = data.batches ?? [];
      setBatches(list);
      setSelectedBatchId((prev) => (prev && list.some((b: TcBatch) => b.id === prev)) ? prev : null);
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
    if (!isAdmin) {
      setShowLoginRequired(true);
      return;
    }
    if (batch.id === "__unbatched__") return;
    setEditingBatchId(batch.id);
    setEditingTitle(batch.title);
  };

  const handleBatchSave = async () => {
    if (!isAdmin) {
      setShowLoginRequired(true);
      return;
    }
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
    if (!isAdmin) {
      setShowLoginRequired(true);
      return;
    }
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
    if (!isAdmin) {
      setShowLoginRequired(true);
      return;
    }
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
      if (newStatus === "FAIL") {
        if (!isAdmin) {
          setIssuePanelTc(null);
          setShowLoginRequired(true);
        } else {
          setIssuePanelTc({ ...tc, status: "FAIL" });
        }
      }
    } catch {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleViewInGoogleSheets = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const csvUrl = `${origin}/api/tc/export-csv?projectId=${projectId ?? ""}&batchId=${encodeURIComponent(selectedBatchId ?? "")}`;
    const formula = `=IMPORTDATA("${csvUrl}")`;
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

    window.open("https://docs.google.com/spreadsheets/create", "_blank", "noopener,noreferrer");
    setGoogleSheetsModal({ formula, csvUrl, isLocalhost });
  };

  const copyFormulaToClipboard = () => {
    if (googleSheetsModal) {
      navigator.clipboard.writeText(googleSheetsModal.formula);
      alert("수식이 복사되었습니다. 구글 시트 A1 셀에 붙여넣으세요.");
    }
  };

  const handleXlsxImportClick = () => {
    if (!isAdmin) {
      setShowLoginRequired(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleXlsxImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const targetBatchId = selectedBatchId && selectedBatchId !== "__unbatched__" ? selectedBatchId : null;
    const batchTitle = targetBatchId ? undefined : `xlsx 가져오기_${new Date().toISOString().slice(0, 10)}`;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);
      if (targetBatchId) formData.append("batchId", targetBatchId);
      else if (batchTitle) formData.append("batchTitle", batchTitle);

      const res = await fetch("/api/tc/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "가져오기 실패");

      fetchBatches();
      if (targetBatchId) {
        fetchTcs();
      } else if (data.batchId) {
        setSelectedBatchId(data.batchId);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "가져오기 실패");
    } finally {
      setImporting(false);
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
        <span>테스트 목록을 불러오는 중입니다...</span>
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
        <p className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          아직 만들어진 테스트케이스가 없어요.
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          위쪽의 업로드 탭에서 문서를 올려 테스트케이스를 만들거나, 엑셀 파일을 가져와 주세요.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleXlsxImportFile}
        />
        <button
          type="button"
          onClick={handleXlsxImportClick}
          disabled={importing}
          className="btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          xlsx 가져오기
        </button>
      </div>
    );
  }

  // 리스트 뷰 (1depth만)
  if (selectedBatchId === null) {
    return (
      <div className="min-w-0 min-h-0">
        <div
          className="rounded-lg border p-6 max-w-xl"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            boxShadow: "0 1px 2px rgba(23,43,77,0.04)",
          }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            테스트 작업 목록
          </p>
          <div className="space-y-1 mb-6">
            {batches.map((batch) => {
              const isUnbatched = batch.id === "__unbatched__";
              const isEditing = editingBatchId === batch.id;

              if (isEditing) {
                return (
                  <div key={batch.id} className="p-3 rounded-lg border mb-2" style={{ background: "var(--bg-sidebar)", borderColor: "var(--border-default)" }}>
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
                      className="w-full px-3 py-2 text-sm rounded border mb-2"
                      style={{
                        background: "var(--bg-surface)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <div className="flex gap-2">
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
                  className="group flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBatchId(batch.id)}
                    className="flex-1 min-w-0 text-left flex items-center gap-3"
                  >
                    <ChevronRight size={18} style={{ color: "var(--text-secondary)" }} />
                    <span className="flex-1 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }} title={batch.title}>
                      {batch.title}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "var(--text-subtle)" }}>
                      {batch.tc_count ?? 0}개
                    </span>
                  </button>
                  {!isUnbatched && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBatchEdit(batch);
                        }}
                        className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
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
                        className="p-1.5 rounded hover:bg-[var(--status-fail-bg)]"
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
          <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleXlsxImportFile}
            />
            <button
              type="button"
              onClick={handleXlsxImportClick}
              disabled={importing}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              xlsx 가져오기
            </button>
          </div>
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

  // 상세 뷰 (2depth)
  return (
    <div className="min-w-0 min-h-0 flex flex-col">
      <div
        className="flex-1 min-w-0 overflow-x-hidden space-y-4 p-4 rounded-lg border"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
          boxShadow: "0 1px 2px rgba(23,43,77,0.04)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => setSelectedBatchId(null)}
            className="btn-ghost inline-flex items-center gap-1.5 py-1.5 px-2 rounded text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={18} />
            뒤로가기
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {selectedBatch?.title}
          </span>
        </div>
        {tcLoading ? (
          <div className="flex items-center gap-2 py-12" style={{ color: "var(--text-secondary)" }}>
            <Loader2 className="animate-spin" size={24} />
            <span>테스트를 불러오는 중입니다...</span>
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
              {selectedBatch ? `"${selectedBatch.title}"에 등록된 테스트가 없습니다.` : "왼쪽에서 작업을 선택해 주세요."}
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-subtle)" }}>
              뒤로가기 후 리스트에서 xlsx 가져오기로 추가할 수 있습니다.
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
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleViewInGoogleSheets}
                  className="btn-secondary inline-flex items-center gap-1.5"
                  title="xlsx 다운로드 후 구글 시트에서 파일 → 가져오기로 불러오세요"
                >
                  <ExternalLink size={16} />
                  구글시트에서 보기
                </button>
                <button
                  type="button"
                  onClick={() => exportTcToXlsx(filteredTestCases)}
                  className="btn-secondary inline-flex items-center gap-1.5"
                >
                  <Download size={16} />
                  xlsx 다운로드
                </button>
              </div>
            </div>

            <div
              className="rounded-lg border overflow-x-hidden min-w-0"
              style={{ borderColor: "var(--border-default)" }}
            >
              <table className="w-full table-fixed border-collapse" style={{ minWidth: 0 }}>
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead style={{ background: "var(--bg-sidebar)" }}>
                  <tr>
                    <th
                      className="text-left py-1 px-1 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      TC ID
                    </th>
                    <th
                      className="text-left py-1 px-1 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      화면코드
                    </th>
                    <th
                      className="text-left py-1 px-1 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      관점
                    </th>
                    <th
                      className="text-left py-1 px-1 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      우선순위
                    </th>
                    <th
                      className="text-left py-1.5 px-2 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      TC 제목
                    </th>
                    <th
                      className="text-left py-1.5 px-2 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      사전조건
                    </th>
                    <th
                      className="text-left py-1.5 px-2 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      테스트 절차
                    </th>
                    <th
                      className="text-left py-1.5 px-2 text-xs font-medium whitespace-nowrap overflow-hidden"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      기대결과
                    </th>
                    <th
                      className="text-left py-1 px-1 text-xs font-medium whitespace-nowrap overflow-hidden"
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
                          className="px-1 py-1 font-mono text-xs align-top whitespace-nowrap overflow-hidden"
                          style={{ color: "var(--text-link)" }}
                        >
                          {tc.tc_id}
                        </td>
                        <td
                          className="px-1 py-1 font-mono text-xs align-top whitespace-nowrap overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {tc.screen_code || "-"}
                        </td>
                        <td className="px-1 py-1 align-top overflow-hidden">
                          <span
                            className="inline-block px-1 py-0.5 rounded text-xs font-medium whitespace-nowrap max-w-full truncate"
                            style={{
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-default)",
                            }}
                          >
                            {PERSPECTIVE_LABEL[tc.test_perspective] ?? tc.test_perspective}
                          </span>
                        </td>
                        <td className="px-1 py-1 align-top overflow-hidden">
                          <span
                            className="inline-block px-1 py-0.5 rounded text-xs font-medium cursor-help"
                            style={{
                              background: "var(--bg-hover)",
                              color: "var(--text-secondary)",
                            }}
                            title={PRIORITY_TOOLTIP[tc.priority] ?? tc.priority}
                          >
                            {tc.priority}
                          </span>
                        </td>
                        <td
                          className="px-2 py-1.5 text-xs align-top overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span className="block break-words" style={{ wordBreak: "break-word" }}>
                            {tc.title}
                          </span>
                        </td>
                        <td
                          className="px-2 py-1.5 text-xs align-top overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span className="line-clamp-2 block break-words" title={tc.preconditions} style={{ wordBreak: "break-word" }}>
                            {tc.preconditions || "-"}
                          </span>
                        </td>
                        <td
                          className="px-2 py-1.5 text-xs font-medium align-top overflow-hidden"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <span className="whitespace-pre-line block break-words" style={{ lineHeight: 1.4, wordBreak: "break-word" }}>
                            {formatSteps(tc.steps ?? "")}
                          </span>
                        </td>
                        <td
                          className="px-2 py-1.5 text-xs align-top overflow-hidden"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span className="whitespace-pre-line block break-words" style={{ lineHeight: 1.4, wordBreak: "break-word" }}>
                            {formatSteps(tc.expected_result ?? "")}
                          </span>
                        </td>
                        <td className="px-1 py-1 align-top overflow-hidden min-w-0">
                          <div className="flex items-center gap-1 flex-nowrap">
                            <select
                              value={tc.status}
                              onChange={(e) => handleStatusChange(tc, e.target.value)}
                              className="text-xs font-medium rounded-[4px] px-1.5 py-0.5 border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 shrink-0"
                              style={{
                                background: statusStyle.bg,
                                color: statusStyle.text,
                                minWidth: 52,
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
                                onClick={() => {
                                  if (!isAdmin) {
                                    setShowLoginRequired(true);
                                    return;
                                  }
                                  setIssuePanelTc({ ...tc, status: "FAIL" });
                                }}
                                className={`p-0.5 rounded text-xs inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap ${
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
                                <FileText size={12} />
                                <span className="text-xs">
                                  {registeredTcIds.has(tc.tc_id) ? "이슈 ✓" : "이슈"}
                                </span>
                              </button>
                            )}
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

      {googleSheetsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--bg-overlay)" }}
          onClick={() => setGoogleSheetsModal(null)}
        >
          <div
            className="rounded-lg border p-6 max-w-md w-full shadow-lg"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              구글 시트에 데이터 불러오기
            </h3>
            {googleSheetsModal.isLocalhost ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  IMPORTDATA는 배포된 환경에서만 동작합니다. xlsx를 다운로드한 뒤 구글 시트에서{" "}
                  <strong>파일 → 가져오기 → 업로드</strong>로 불러오세요.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    exportTcToXlsx(filteredTestCases);
                    setGoogleSheetsModal(null);
                  }}
                  className="btn-primary w-full py-2 text-sm inline-flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  xlsx 다운로드
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                  새 탭에서 열린 구글 시트의 <strong>A1 셀</strong>에 아래 수식을 붙여넣으세요.
                </p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={googleSheetsModal.formula}
                    className="flex-1 text-xs px-3 py-2 rounded border font-mono"
                    style={{
                      background: "var(--bg-sidebar)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={copyFormulaToClipboard}
                    className="btn-primary shrink-0 px-3 py-2 text-sm"
                  >
                    복사
                  </button>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setGoogleSheetsModal(null)}
              className="btn-secondary w-full py-2 text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <IssuePanel
        tc={issuePanelTc}
        projectId={projectId}
        onClose={() => setIssuePanelTc(null)}
        onRegistered={() => {
          setIssuePanelTc(null);
          fetchTcs();
        }}
      />

      <LoginRequiredModal
        open={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        onLoginClick={() => {
          setShowLoginRequired(false);
          setShowLoginModal(true);
        }}
      />
      <AdminLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
