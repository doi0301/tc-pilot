/**
 * TC Pilot — TC 목록 xlsx 가져오기
 * HIPAS 양식 xlsx 파싱 → TestCase[]
 */

import * as XLSX from "xlsx";
import type { TestCase } from "@/types";

const PERSPECTIVE_LABEL_TO_CODE: Record<string, "N" | "E" | "A" | "R" | "D"> = {
  정상: "N",
  예외: "E",
  권한: "A",
  에러: "R",
  데이터: "D",
};

const VALID_PRIORITIES = ["P1", "P2", "P3", "P4"] as const;
const VALID_STATUSES = ["PASS", "FAIL", "진행중", "미확인"] as const;

function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function parsePerspective(val: string): "N" | "E" | "A" | "R" | "D" {
  const code = PERSPECTIVE_LABEL_TO_CODE[val] ?? val;
  if (["N", "E", "A", "R", "D"].includes(code)) return code as "N" | "E" | "A" | "R" | "D";
  return "N";
}

function parsePriority(val: string): "P1" | "P2" | "P3" | "P4" {
  const upper = val.toUpperCase();
  if (VALID_PRIORITIES.includes(upper as (typeof VALID_PRIORITIES)[number])) return upper as "P1" | "P2" | "P3" | "P4";
  return "P3";
}

function parseStatus(val: string): "PASS" | "FAIL" | "진행중" | "미확인" {
  if (VALID_STATUSES.includes(val as (typeof VALID_STATUSES)[number])) return val as "PASS" | "FAIL" | "진행중" | "미확인";
  return "미확인";
}

/**
 * HIPAS 양식 xlsx 시트를 파싱하여 TestCase[] 반환
 * 첫 행은 헤더로 간주
 */
export function parseTcXlsx(buffer: ArrayBuffer): TestCase[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" }) as string[][];

  if (!rows.length) return [];

  const headerRow = rows[0].map((h) => str(h));
  const colIndex: Record<string, number> = {};
  const expectedHeaders = ["TC ID", "섹션", "기능그룹", "화면코드", "테스트 관점", "우선순위", "TC 제목", "사전조건", "테스트 절차", "기대결과", "P/F", "이슈메모"];
  expectedHeaders.forEach((h, i) => {
    const idx = headerRow.findIndex((cell) => str(cell) === h);
    colIndex[h] = idx >= 0 ? idx : i < headerRow.length ? i : -1;
  });

  const get = (row: string[], key: string): string => {
    const idx = colIndex[key];
    return idx !== undefined && idx >= 0 ? str(row[idx]) : "";
  };

  const result: TestCase[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const tcId = get(row, "TC ID");
    if (!tcId) continue;

    result.push({
      tc_id: tcId,
      section: get(row, "섹션"),
      feature_group: get(row, "기능그룹"),
      screen_code: get(row, "화면코드"),
      test_perspective: parsePerspective(get(row, "테스트 관점")),
      priority: parsePriority(get(row, "우선순위")),
      title: get(row, "TC 제목"),
      preconditions: get(row, "사전조건"),
      steps: get(row, "테스트 절차"),
      expected_result: get(row, "기대결과"),
      status: parseStatus(get(row, "P/F")),
      issue_memo: get(row, "이슈메모") || undefined,
    });
  }
  return result;
}
