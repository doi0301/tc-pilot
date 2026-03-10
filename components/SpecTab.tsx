"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Wand2 } from "lucide-react";
import { EditableTable } from "./EditableTable";
import { LoginRequiredModal } from "./LoginRequiredModal";
import { AdminLoginModal } from "./AdminLoginModal";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { Spec } from "@/types";

export interface SpecTabProps {
  projectId?: string;
  onTcCreated?: () => void;
  onProjectId?: (id: string, projectName?: string) => void;
}

const ACCEPT = {
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "text/markdown": [".md", ".mdx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
};

export default function SpecTab({ projectId: initialProjectId, onTcCreated, onProjectId }: SpecTabProps) {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [parseOnly, setParseOnly] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tcLoading, setTcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
  const [batchTitle, setBatchTitle] = useState("");
  const { isAdmin } = useAdminAuth();
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isAdmin) {
      setShowLoginRequired(true);
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    setLastFile(file);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/projects/ensure-default");
      const { project } = await res.json();
      if (project?.id) {
        formData.append("projectId", project.id);
        setProjectId(project.id);
        onProjectId?.(project.id, project.project_name);
      }
      if (parseOnly) formData.append("parseOnly", "true");

      const apiRes = await fetch("/api/spec", {
        method: "POST",
        body: formData,
      });

      const data = await apiRes.json();
      if (!apiRes.ok) throw new Error(data.error || "스펙 변환 실패");
      if (data.parseOnly) {
        setParsedText(data.parsedText ?? "");
        setSpecs([]);
      } else {
        setParsedText(null);
        setSpecs(data.specs ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setSpecs([]);
      setParsedText(null);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, parseOnly, onProjectId]);

  const handleCreateTc = useCallback(async () => {
    const pid = projectId ?? initialProjectId;
    if (!pid) {
      setError("프로젝트를 찾을 수 없습니다.");
      return;
    }
    if (!batchTitle.trim()) {
      setError("이번 TC 생성 배치 제목을 입력해주세요.");
      return;
    }
    setError(null);
    setTcLoading(true);
    try {
      const specIds = specs.map((s) => s.id).filter((id): id is string => !!id);
      const res = await fetch("/api/tc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pid,
          specs: specs,
          specIds: specIds.length > 0 ? specIds : undefined,
          batchTitle: batchTitle.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "TC 생성 실패");
      onTcCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "TC 생성 실패");
    } finally {
      setTcLoading(false);
    }
  }, [projectId, initialProjectId, specs, batchTitle, onTcCreated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    // 관리자만 실제 업로드 동작 허용
    disabled: loading || !isAdmin,
  });

  return (
    <div
      className="space-y-6 p-4 rounded-lg border"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
        boxShadow: "0 1px 2px rgba(23,43,77,0.04)",
      }}
    >
      {/* 파일만 먼저 확인하기 옵션 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={parseOnly}
          onChange={(e) => setParseOnly(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          파일 내용만 먼저 보기 (AI 사용 안 함)
        </span>
      </label>

      {/* T-005: File Upload Area — Design System §5-10 */}
      <div
        {...(isAdmin ? getRootProps() : {})}
        className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-[border-color,background-color] duration-150"
        style={{
          borderColor: isAdmin && isDragActive ? "var(--point-default)" : "var(--border-bold)",
          background: isAdmin && isDragActive ? "var(--point-subtle)" : "var(--bg-page)",
          color: isAdmin && isDragActive ? "var(--point-default)" : "var(--text-secondary)",
        }}
        onClick={(e) => {
          if (!isAdmin) {
            e.preventDefault();
            e.stopPropagation();
            setShowLoginRequired(true);
          }
        }}
      >
        {isAdmin && <input {...getInputProps()} />}
        <Upload
          className="mx-auto mb-3"
          size={32}
          strokeWidth={1.5}
          style={{ color: isDragActive ? "var(--point-default)" : "var(--text-subtle)" }}
        />
        <p className="text-sm font-medium">
          PPT, MD, XLSX 파일을 드래그앤드롭 하세요
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
          또는 클릭하여 파일 선택
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Loader2 className="animate-spin" size={20} />
          <span>문서를 정리하는 중입니다...</span>
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-lg text-[var(--status-fail-text)]"
          style={{ background: "var(--status-fail-bg)" }}
        >
          {error}
        </div>
      )}

      {/* 파일 내용 미리보기 + AI 정리 버튼 */}
      {parsedText !== null && parsedText !== "" && !loading && (
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "var(--border-default)",
            background: "var(--bg-surface)",
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            파일에서 추출한 원본 내용 (AI 정리 전)
          </p>
          <pre
            className="text-sm overflow-auto max-h-60 p-3 rounded mb-4"
            style={{
              background: "var(--bg-sidebar)",
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {parsedText}
          </pre>
          {lastFile && (
            <button
              onClick={async () => {
                if (!isAdmin) {
                  setShowLoginRequired(true);
                  return;
                }
                setError(null);
                setLoading(true);
                try {
                  const formData = new FormData();
                  formData.append("file", lastFile);
                  const pid = projectId ?? initialProjectId;
                  if (pid) formData.append("projectId", pid);
                  const apiRes = await fetch("/api/spec", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await apiRes.json();
                  if (!apiRes.ok) throw new Error(data.error || "스펙 변환 실패");
                  setParsedText(null);
                  setSpecs(data.specs ?? []);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "스펙 변환 실패");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Wand2 size={18} />
              이 내용으로 테스트 케이스 만들기
            </button>
          )}
        </div>
      )}

      {/* T-010: 변환 결과 편집 테이블 (T-013 EditableTable) */}
      {specs.length > 0 && !loading && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
          <EditableTable<Spec>
            columns={[
              { id: "screen_code", header: "화면코드", accessorKey: "screen_code", editable: true, enableSorting: true, cellClassName: "font-mono text-sm" },
              { id: "screen_name", header: "화면명", accessorKey: "screen_name", editable: true, enableSorting: true },
              { id: "path", header: "경로", accessorKey: "path", editable: true },
              { id: "screen_type", header: "화면타입", accessorKey: "screen_type", editable: true },
              { id: "roles", header: "역할", accessorKey: "roles", editable: true },
              { id: "interactions", header: "상호작용", accessorKey: "interactions", editable: true },
            ]}
            data={specs}
            getRowId={(s) => s.id ?? String(specs.indexOf(s))}
            onDataChange={(rowIndex, field, value) => {
              setSpecs((prev) =>
                prev.map((s, i) =>
                  i === rowIndex ? { ...s, [field]: value } : s
                )
              );
            }}
            minWidth={900}
            tableClassName="rounded-none border-0"
          />
          <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                이번 작업 이름
              </label>
              <input
                type="text"
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                placeholder="예: 1차 VOC 점검, 스케줄러 테스트"
                className="w-full max-w-md px-3 py-2 rounded-md border text-sm"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <button
              onClick={() => {
                if (!isAdmin) {
                  setShowLoginRequired(true);
                  return;
                }
                void handleCreateTc();
              }}
              disabled={tcLoading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {tcLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  AI가 TC를 생성하고 있어요...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  TC 생성하기
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
