"use client";

import type { TestCase } from "@/types";

const PERSPECTIVE_LABEL: Record<string, string> = {
  N: "정상",
  E: "예외",
  A: "권한",
  R: "에러",
  D: "데이터",
};

function getStatusCounts(tcs: TestCase[]) {
  const pass = tcs.filter((t) => t.status === "PASS").length;
  const fail = tcs.filter((t) => t.status === "FAIL").length;
  const progress = tcs.filter((t) => t.status === "진행중").length;
  const pending = tcs.filter((t) => t.status === "미확인").length;
  const total = tcs.length;
  const done = pass + fail;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, pass, fail, progress, pending, completionRate };
}

export default function DashboardCards({ testCases }: { testCases: TestCase[] }) {
  const { total, pass, fail, progress, pending, completionRate } =
    getStatusCounts(testCases);

  if (total === 0) return null;

  const passTcs = testCases.filter((t) => t.status === "PASS");
  const failTcs = testCases.filter((t) => t.status === "FAIL");
  const progressTcs = testCases.filter((t) => t.status === "진행중");
  const pendingTcs = testCases.filter((t) => t.status === "미확인");

  const statItems = [
    { label: "총 TC", value: total, style: { color: "var(--text-primary)" }, tcIds: total <= 10 ? testCases.map((t) => t.tc_id).join(", ") : "" },
    { label: "PASS", value: pass, style: { color: "var(--status-pass-text)" }, tcIds: pass <= 10 && pass > 0 ? passTcs.map((t) => t.tc_id).join(", ") : "" },
    { label: "FAIL", value: fail, style: { color: "var(--status-fail-text)" }, tcIds: fail <= 10 && fail > 0 ? failTcs.map((t) => t.tc_id).join(", ") : "" },
    { label: "진행중", value: progress, style: { color: "var(--status-progress-text)" }, tcIds: progress <= 10 && progress > 0 ? progressTcs.map((t) => t.tc_id).join(", ") : "" },
    { label: "미확인", value: pending, style: { color: "var(--status-pending-text)" }, tcIds: pending <= 10 && pending > 0 ? pendingTcs.map((t) => t.tc_id).join(", ") : "" },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 px-4 rounded-lg border mb-4"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {statItems.map((item, i) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          {i > 0 && (
            <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
              |
            </span>
          )}
          <span
            className={`relative inline-flex items-baseline gap-1.5 group ${item.tcIds ? "cursor-default" : ""}`}
          >
            <span className="text-base font-semibold" style={item.style}>
              {item.value}
            </span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {item.label}
            </span>
            {item.tcIds && (
              <span
                className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-50 px-2.5 py-2 text-xs rounded-md shadow-lg border whitespace-pre-wrap max-w-[280px]"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                {item.tcIds.split(", ").join("\n")}
              </span>
            )}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 ml-auto min-w-[100px]">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          완료율
        </span>
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden min-w-[60px]"
          style={{ background: "var(--bg-hover)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${completionRate}%`,
              background: "var(--point-default)",
            }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {completionRate}%
        </span>
      </div>
    </div>
  );
}

export { getStatusCounts, PERSPECTIVE_LABEL };
