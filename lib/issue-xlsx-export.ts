/**
 * TC Pilot — 이슈 목록 xlsx 내보내기 (T-032)
 * 수동 등록용 백업 포맷
 */

import * as XLSX from "xlsx";
import type { Issue } from "@/types";

const ISSUE_HEADERS = [
  "TC ID",
  "제목",
  "심각도",
  "재현순서",
  "기대결과",
  "실제결과",
  "스크린샷 URL",
  "등록일",
];

function issueToRow(issue: Issue): string[] {
  return [
    issue.tc_id ?? "",
    issue.title ?? "",
    issue.severity ?? "",
    issue.reproduction_steps ?? "",
    issue.expected ?? "",
    issue.actual ?? "",
    issue.screenshot_url ?? "",
    issue.created_at
      ? new Date(issue.created_at).toLocaleString("ko-KR")
      : "",
  ];
}

export function exportIssuesToXlsx(issues: Issue[], filename?: string): void {
  const rows = [ISSUE_HEADERS, ...issues.map(issueToRow)];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = [
    { wch: 12 },
    { wch: 40 },
    { wch: 10 },
    { wch: 40 },
    { wch: 30 },
    { wch: 40 },
    { wch: 50 },
    { wch: 18 },
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "이슈목록");

  const name = filename ?? `이슈목록_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}
