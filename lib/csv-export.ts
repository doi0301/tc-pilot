/**
 * TC Pilot — TC 목록 CSV 내보내기 (구글 시트 IMPORTDATA용)
 */

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

function escapeCsvField(val: string | number | undefined | null): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

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

export function testCasesToCsv(testCases: TestCase[]): string {
  const rows = [HIPAS_HEADERS, ...testCases.map(tcToRow)];
  return rows.map((row) => row.map(escapeCsvField).join(",")).join("\n");
}
