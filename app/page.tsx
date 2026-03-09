"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, UserCheck, ClipboardList } from "lucide-react";
import SpecTab from "@/components/SpecTab";
import TCTab from "@/components/TCTab";
import IssueLogTab from "@/components/IssueLogTab";

type Tab = "spec" | "tc" | "issues";

const WORKFLOW_STEPS = [
  { id: "spec", label: "기획서", icon: FileText },
  { id: "tc", label: "TC 자동 생성", icon: Sparkles },
  { id: "tc", label: "테스트 실행", icon: UserCheck },
  { id: "issues", label: "이슈 등록", icon: ClipboardList },
] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("spec");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projectName, setProjectName] = useState<string | undefined>();

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
      {/* 1. 상단 정보 영역 (TC Pilot 타이틀) */}
      <div
        className="shrink-0 p-6 pb-4 border-b"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-bold)",
          boxShadow: "0 1px 0 0 var(--border-subtle)",
        }}
      >
        <header className="mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            TC Pilot
          </h1>
          <div className="mt-3 flex flex-col gap-2">
            <div
              className="flex items-center gap-2 flex-wrap"
              style={{ color: "var(--text-secondary)" }}
            >
              {WORKFLOW_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = (step.id === "spec" && activeTab === "spec") ||
                  (step.id === "tc" && activeTab === "tc") ||
                  (step.id === "issues" && activeTab === "issues");
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveTab(step.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:opacity-100 ${
                      isActive ? "" : "opacity-70"
                    }`}
                    style={{
                      background: isActive ? "var(--bg-selected)" : "var(--bg-sidebar)",
                      color: isActive ? "var(--point-default)" : "var(--text-secondary)",
                      border: "none",
                    }}
                  >
                    <Icon size={14} />
                    {step.label}
                  </button>
                );
              })}
            </div>
            <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
              파일 업로드부터 스펙 변환, TC 생성, P/F 테스트, Notion 이슈 등록까지 한 번에
            </p>
          </div>
        </header>

        {/* 2. 스펙 변환 탭 메뉴 */}
        <nav
          className="flex gap-0 border-b-2 -mb-px"
          style={{
            borderColor: "var(--border-default)",
            background: "transparent",
          }}
        >
          {[
            { id: "spec" as Tab, label: "스펙 변환" },
            { id: "tc" as Tab, label: "TC 목록" },
            { id: "issues" as Tab, label: "이슈 로그" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t border-0 border-b-2 ${
                  isActive ? "" : "hover:bg-[var(--bg-hover)]"
                }`}
                style={{
                  color: isActive ? "var(--point-default)" : "var(--text-secondary)",
                  borderBottomColor: isActive ? "var(--point-default)" : "transparent",
                  background: "transparent",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. 오른쪽 콘텐츠 영역 */}
      <section className="flex-1 min-h-0 overflow-x-auto overflow-y-auto p-6 pt-4" style={{ background: "var(--bg-page)" }}>
        {activeTab === "spec" && (
          <SpecTab
            projectId={projectId}
            onTcCreated={() => setActiveTab("tc")}
            onProjectId={(id, name) => handleProject(id, name)}
          />
        )}
        {activeTab === "tc" && <TCTab projectId={projectId} />}
        {activeTab === "issues" && <IssueLogTab projectId={projectId} />}
      </section>
    </main>
  );
}
