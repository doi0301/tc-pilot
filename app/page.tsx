"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, UserCheck, ClipboardList, ShieldCheck } from "lucide-react";
import SpecTab from "@/components/SpecTab";
import TCTab from "@/components/TCTab";
import IssueLogTab from "@/components/IssueLogTab";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLoginModal } from "@/components/AdminLoginModal";

type Tab = "spec" | "tc" | "issues";

const WORKFLOW_STEPS = [
  { id: "spec", label: "업로드", icon: FileText },
  { id: "tc", label: "생성 TC", icon: Sparkles },
  { id: "tc", label: "테스트 실행", icon: UserCheck },
  { id: "issues", label: "이슈 정리", icon: ClipboardList },
] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("spec");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projectName, setProjectName] = useState<string | undefined>();
  const { isAdmin, logout } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // T-002: 앱 로드 시 기본 프로젝트 없으면 자동 생성
  useEffect(() => {
    fetch("/api/projects/ensure-default")
      .then((r) => r.json())
      .then((data) => {
        const p = data.project;
        if (p?.id) {
          setProjectId(p.id);
          setProjectName(p.project_name ?? undefined);
        }
      })
      .catch(() => {});
  }, []);

  const handleProject = (id: string, name?: string) => {
    setProjectId(id);
    setProjectName(name);
  };

  return (
    <main className="flex-1 flex flex-col min-h-0" style={{ background: "var(--bg-page)" }}>
      {/* 1. 상단 쉘 영역 — 다크 헤더 (레퍼런스 좌측 느낌) */}
      <div
        className="shrink-0 border-b"
        style={{
          background: "linear-gradient(90deg, #0f172a, #111827)",
          borderColor: "rgba(15,23,42,0.9)",
          boxShadow: "0 1px 0 0 rgba(15,23,42,0.9)",
        }}
      >
        <div className="max-w-6xl mx-auto w-full px-4 py-5 pb-3">
          <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-inverse)" }}>
                TC Pilot
              </h1>
              {projectName && (
                <p className="text-sm mt-1" style={{ color: "rgba(249,250,251,0.7)" }}>
                  현재 프로젝트: {projectName}
                </p>
              )}
            </div>
            <div className="mt-2 md:mt-0 flex items-center gap-2">
              {isAdmin ? (
                <>
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(15,23,42,0.7)",
                      color: "rgba(249,250,251,0.85)",
                      border: "1px solid rgba(148,163,184,0.4)",
                    }}
                  >
                    <ShieldCheck size={14} />
                    관리자 모드
                  </span>
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => logout()}
                    style={{
                      color: "rgba(249,250,251,0.85)",
                      padding: "0 8px",
                      height: 28,
                    }}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-ghost text-sm inline-flex items-center gap-1.5"
                  style={{
                    color: "rgba(249,250,251,0.9)",
                    padding: "0 8px",
                    height: 28,
                  }}
                  onClick={() => setShowLoginModal(true)}
                >
                  <ShieldCheck size={16} />
                  관리자 로그인
                </button>
              )}
            </div>
          </header>
          <div className="mt-1 flex flex-col gap-2">
            <div
              className="flex items-center gap-2 flex-wrap"
              style={{ color: "rgba(249,250,251,0.7)" }}
            >
              {WORKFLOW_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive =
                  (step.id === "spec" && activeTab === "spec") ||
                  (step.id === "tc" && activeTab === "tc") ||
                  (step.id === "issues" && activeTab === "issues");
                return (
                  <div key={step.id + i} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab(step.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isActive ? "" : "opacity-80"
                      }`}
                      style={{
                        background: isActive ? "rgba(37,99,235,0.18)" : "rgba(15,23,42,0.8)",
                        color: isActive ? "rgba(249,250,251,0.96)" : "rgba(249,250,251,0.85)",
                        border: isActive
                          ? "1px solid rgba(129,140,248,0.9)"
                          : "1px solid rgba(148,163,184,0.4)",
                      }}
                    >
                      <Icon size={14} />
                      {step.label}
                    </button>
                    {/* 생성 TC와 테스트 실행 사이(인덱스 1과 2)는 화살표 제외 */}
                    {i < WORKFLOW_STEPS.length - 1 && i !== 1 && (
                      <span className="text-xs" style={{ color: "rgba(148,163,184,0.85)" }}>
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-sm" style={{ color: "rgba(209,213,219,0.9)" }}>
              기획서를 올리면 테스트 케이스 작성, 실행 결과 기록, 이슈 정리까지 한 화면에서 관리할 수 있어요.
            </p>
          </div>

          {/* 2. 상단 탭 메뉴 — 헤더 하단에 얇은 포인트 바 */}
          <nav
            className="flex gap-0 border-b-2 -mb-px mt-4"
            style={{
              borderColor: "rgba(31,41,55,0.9)",
              background: "transparent",
            }}
          >
            {[
              { id: "spec" as Tab, label: "업로드" },
              { id: "tc" as Tab, label: "생성 TC" },
              { id: "issues" as Tab, label: "이슈 목록" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2.5 font-medium text-sm transition-colors rounded-t border-0 border-b-2"
                  style={{
                    color: isActive ? "rgba(249,250,251,0.98)" : "rgba(156,163,175,0.95)",
                    borderBottomColor: isActive ? "#60a5fa" : "transparent",
                    background: "transparent",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 2. 메인 콘텐츠 영역 — 라이트 그레이 배경 + 화이트 카드 (레퍼런스 우측 느낌) */}
      <section className="flex-1 min-h-0 overflow-x-auto overflow-y-auto px-4 pb-6 pt-4" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-6xl mx-auto w-full">
        {activeTab === "spec" && (
          <SpecTab
            projectId={projectId}
            onTcCreated={() => setActiveTab("tc")}
            onProjectId={(id, name) => handleProject(id, name)}
          />
        )}
        {activeTab === "tc" && <TCTab projectId={projectId} />}
        {activeTab === "issues" && <IssueLogTab projectId={projectId} />}
        </div>
      </section>

      <AdminLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
