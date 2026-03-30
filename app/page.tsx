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
    <main className="flex-1 flex flex-col min-h-0 bg-background">
      {/* 상단 쉘 — FlowDay sidebar 톤 */}
      <div className="shrink-0 border-b border-sidebar-border bg-sidebar shadow-[0_1px_0_0_var(--sidebar-border)]">
        <div className="max-w-6xl mx-auto w-full px-4 py-5 pb-3">
          <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">TC Pilot</h1>
              {projectName && (
                <p className="text-sm mt-1 text-sidebar-foreground">현재 프로젝트: {projectName}</p>
              )}
            </div>
            <div className="mt-2 md:mt-0 flex items-center gap-2">
              {isAdmin ? (
                <>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-sidebar-border bg-muted/50 text-sidebar-foreground">
                    <ShieldCheck size={14} />
                    관리자 모드
                  </span>
                  <button
                    type="button"
                    className="btn-ghost text-sm text-sidebar-foreground px-2 h-7"
                    onClick={() => logout()}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-ghost text-sm inline-flex items-center gap-1.5 text-sidebar-foreground px-2 h-7"
                  onClick={() => setShowLoginModal(true)}
                >
                  <ShieldCheck size={16} />
                  관리자 로그인
                </button>
              )}
            </div>
          </header>
          <div className="mt-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap text-sidebar-foreground">
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
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border border-sidebar-border ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "opacity-90 bg-secondary/50 text-sidebar-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      {step.label}
                    </button>
                    {i < WORKFLOW_STEPS.length - 1 && i !== 1 && (
                      <span className="text-xs text-muted-foreground">→</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              기획서를 올리면 테스트 케이스 작성, 실행 결과 기록, 이슈 정리까지 한 화면에서 관리할 수 있어요.
            </p>
          </div>

          <nav className="flex gap-0 border-b border-border -mb-px mt-4 bg-transparent">
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
                  className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t border-0 border-b-2 ${
                    isActive
                      ? "text-foreground border-primary"
                      : "text-muted-foreground border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <section className="flex-1 min-h-0 overflow-x-auto overflow-y-auto px-4 pb-6 pt-4 bg-background">
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
