"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Wand2 } from "lucide-react";
import type { Spec } from "@/types";

export interface SpecTabProps {
  projectId?: string;
  onTcCreated?: () => void;
  onProjectId?: (id: string) => void;
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
        onProjectId?.(project.id);
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
  }, [parseOnly, onProjectId]);

  const handleCreateTc = useCallback(async () => {
    const pid = projectId ?? initialProjectId;
    if (!pid) {
      setError("프로젝트를 찾을 수 없습니다.");
      return;
    }
    setError(null);
    setTcLoading(true);
    try {
      const specIds = specs.map((s) => s.id).filter((id): id is string => !!id);
      const res = await fetch("/api/tc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: pid, specIds: specIds.length > 0 ? specIds : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "TC 생성 실패");
      onTcCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "TC 생성 실패");
    } finally {
      setTcLoading(false);
    }
  }, [projectId, initialProjectId, specs, onTcCreated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div className="space-y-6">
      {/* 파싱만 테스트 체크박스 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={parseOnly}
          onChange={(e) => setParseOnly(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          파싱만 테스트 (AI 사용 안 함, 크레딧 소모 없음)
        </span>
      </label>

      {/* T-005: File Upload Area — Design System §5-10 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
          transition-[border-color,background-color] duration-150
          ${isDragActive
            ? "border-[var(--point-default)] bg-[var(--point-subtle)] text-[var(--point-default)]"
            : "border-[var(--border-bold)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload
          className="mx-auto mb-3"
          size={32}
          strokeWidth={1.5}
          style={{ color: isDragActive ? "var(--point-default)" : "var(--text-subtle)" }}
        />
        <p className="text-base font-medium">
          PPT, MD, XLSX 파일을 드래그앤드롭 하세요
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
          또는 클릭하여 파일 선택
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Loader2 className="animate-spin" size={20} />
          <span>스펙 변환 중...</span>
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

      {/* 파싱만 테스트 결과 미리보기 + 스펙 변환 버튼 */}
      {parsedText !== null && parsedText !== "" && !loading && (
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "var(--border-default)",
            background: "var(--bg-surface)",
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            파싱된 텍스트 (AI 변환 없음)
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
              className="px-4 py-2 rounded-md font-semibold text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: "var(--point-default)" }}
            >
              <Wand2 size={18} />
              스펙 변환 후 TC 생성하기
            </button>
          )}
        </div>
      )}

      {/* T-010: 변환 결과 편집 테이블 */}
      {specs.length > 0 && !loading && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
          <table className="w-full">
            <thead style={{ background: "var(--bg-sidebar)" }}>
              <tr>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  화면코드
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  화면명
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  경로
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  화면타입
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  역할
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  상호작용
                </th>
              </tr>
            </thead>
            <tbody>
              {specs.map((s, i) => (
                <tr
                  key={s.id ?? i}
                  className="hover:bg-[var(--bg-hover)]"
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    height: "var(--table-row-height)",
                  }}
                >
                  <td className="px-3 font-mono text-sm" style={{ color: "var(--text-link)" }}>
                    {s.screen_code}
                  </td>
                  <td className="px-3">{s.screen_name}</td>
                  <td className="px-3">{s.path}</td>
                  <td className="px-3">{s.screen_type}</td>
                  <td className="px-3">{s.roles}</td>
                  <td className="px-3">{s.interactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}>
            <button
              onClick={handleCreateTc}
              disabled={tcLoading}
              className="px-4 py-2 rounded-md font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              style={{ background: "var(--point-default)" }}
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
    </div>
  );
}
