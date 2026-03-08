/**
 * TC Pilot — TC 목록 xlsx 내보내기 (T-031)
 * HIPAS 양식 컬럼, 구글시트 호환
 */

import * as XLSX from "xlsx";
import type { TestCase } from "@/types";

const PERSPECTIVE_LABEL: Record<string, string> = {
  N: "정상",
  E: "예외",
  A: "권한",
  R: "에러",
  D: "데이터",
};

const HIPAS_HEADERS = [
  "TC ID",
  "섹션",
  "기능그룹",
  "화면코드",
  "테스트 관점",
  "우선순위",
  "TC 제목",
  "사전조건",
  "테스트 절차",
  "기대결과",
  "P/F",
  "이슈메모",
];

function tcToRow(tc: TestCase): string[] {
  return [
    tc.tc_id ?? "",
    tc.section ?? "",
    tc.feature_group ?? "",
    tc.screen_code ?? "",
    PERSPECTIVE_LABEL[tc.test_perspective] ?? tc.test_perspective,
    tc.priority ?? "",
    tc.title ?? "",
    tc.preconditions ?? "",
    tc.steps ?? "",
    tc.expected_result ?? "",
    tc.status ?? "",
    tc.issue_memo ?? "",
  ];
}

export function exportTcToXlsx(testCases: TestCase[], filename?: string): void {
  const rows = [HIPAS_HEADERS, ...testCases.map(tcToRow)];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  const colWidths = [
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 10 },
    { wch: 6 },
    { wch: 40 },
    { wch: 25 },
    { wch: 35 },
    { wch: 30 },
    { wch: 8 },
    { wch: 20 },
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "TC목록");

  const name = filename ?? `TC목록_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}
