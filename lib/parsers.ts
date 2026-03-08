/**
 * TC Pilot — 파일 파싱 유틸 (T-006, T-007)
 * MD: 텍스트 추출, XLSX: SheetJS, PPT: jszip으로 XML에서 텍스트 추출
 */

import * as XLSX from "xlsx";
import * as path from "path";
import JSZip from "jszip";

const ALLOWED_EXT = [".md", ".mdx", ".xlsx", ".xls", ".ppt", ".pptx"] as const;
export type FileType = "md" | "xlsx" | "ppt";

export function getFileType(filename: string): FileType | null {
  const ext = path.extname(filename).toLowerCase();
  if ([".md", ".mdx"].includes(ext)) return "md";
  if ([".xlsx", ".xls"].includes(ext)) return "xlsx";
  if ([".ppt", ".pptx"].includes(ext)) return "ppt";
  return null;
}

export function isAllowedFile(filename: string): boolean {
  return getFileType(filename) !== null;
}

/**
 * MD: 파일 텍스트 그대로 반환
 */
export async function parseMd(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

/**
 * XLSX: 시트 데이터를 JSON 배열로 변환
 * 첫 행을 헤더로 사용
 */
export async function parseXlsx(buffer: Buffer): Promise<string> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
  return JSON.stringify(json, null, 2);
}

/**
 * PPTX XML에서 <a:t> 텍스트 추출
 */
function extractTextFromSlideXml(xml: string): string {
  const matches = xml.match(/<a:t>([^<]*)<\/a:t>/g);
  if (!matches) return "";
  return matches
    .map((m) => m.replace(/<\/?a:t>/g, ""))
    .filter(Boolean)
    .join(" ");
}

/**
 * PPT/PPTX: jszip으로 압축 해제 후 슬라이드 XML에서 텍스트 추출
 * 참고: .ppt(구형 바이너리)는 미지원, .pptx만 지원
 */
export async function parsePpt(buffer: Buffer): Promise<string> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new Error("PPTX 파싱 실패. .pptx 형식만 지원합니다. (.ppt 구형 형식은 미지원)");
  }
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const nA = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
      const nB = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
      return nA - nB;
    });

  const texts: string[] = [];
  for (const name of slideFiles) {
    const file = zip.files[name];
    if (!file) continue;
    const xml = await file.async("string");
    const text = extractTextFromSlideXml(xml);
    if (text) texts.push(text);
  }

  return texts.join("\n\n--- 슬라이드 구분 ---\n\n");
}

/**
 * 파일 타입에 따라 파싱 후 텍스트 반환
 */
export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const type = getFileType(filename);
  if (!type) throw new Error(`지원하지 않는 파일 형식: ${filename}`);

  switch (type) {
    case "md":
      return parseMd(buffer);
    case "xlsx":
      return parseXlsx(buffer);
    case "ppt":
      return parsePpt(buffer);
    default:
      throw new Error(`파싱 미구현: ${type}`);
  }
}
