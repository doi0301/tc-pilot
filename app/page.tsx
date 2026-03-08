"use client";

import { useState, useEffect } from "react";
import SpecTab from "@/components/SpecTab";
import TCTab from "@/components/TCTab";
import IssueLogTab from "@/components/IssueLogTab";

type Tab = "spec" | "tc" | "issues";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("spec");
  const [projectId, setProjectId] = useState<string | undefined>();

  // T-002: 앱 로드 시 기본 프로젝트 없으면 자동 생성
  useEffect(() => {
    fetch("/api/projects/ensure-default")
      .then((r) => r.json())
      .then((data) => data.project?.id && setProjectId(data.project.id))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen p-6" style={{ background: "var(--bg-page)" }}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          TC Pilot
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          기획서 → TC 자동 생성 → 테스트 실행 → 이슈 등록
        </p>
      </header>

      <nav className="flex gap-0 mb-6 border-b" style={{ borderColor: "var(--border-default)" }}>
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
              className={`px-4 py-2.5 font-medium text-sm transition-colors rounded-t ${
                isActive ? "" : "hover:bg-[var(--bg-hover)]"
              }`}
              style={{
                color: isActive ? "var(--point-default)" : "var(--text-secondary)",
                borderBottom: isActive ? "2px solid var(--point-default)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section>
        {activeTab === "spec" && (
          <SpecTab
            projectId={projectId}
            onTcCreated={() => setActiveTab("tc")}
            onProjectId={setProjectId}
          />
        )}
        {activeTab === "tc" && <TCTab projectId={projectId} />}
        {activeTab === "issues" && <IssueLogTab projectId={projectId} />}
      </section>
    </main>
  );
}
