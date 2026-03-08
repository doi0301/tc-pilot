/**
 * TC Pilot — POST /api/spec (T-009)
 * multipart/form-data 파일 수신 → 파싱 → Claude → 스펙 JSON → Supabase specs 저장
 */

import { NextRequest, NextResponse } from "next/server";
import { parseFile, isAllowedFile } from "@/lib/parsers";
import { createClaudeMessage } from "@/lib/claude";
import {
  SPEC_CONVERSION_SYSTEM_PROMPT,
  SPEC_CONVERSION_USER_PROMPT_PREFIX,
} from "@/lib/prompts";
import { supabase } from "@/lib/supabase";
import type { Spec } from "@/types";

async function getDefaultProjectId(): Promise<string | undefined> {
  const { data } = await supabase.from("projects").select("id").limit(1);
  return data?.[0]?.id;
}

function extractJsonArray(text: string): Spec[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("JSON 배열을 찾을 수 없습니다.");
  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) throw new Error("배열이 아닙니다.");
  return parsed as Spec[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let projectId: string | undefined =
      (formData.get("projectId") as string | null) ?? undefined;
    if (!projectId) projectId = await getDefaultProjectId();

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 }
      );
    }

    if (!isAllowedFile(file.name)) {
      return NextResponse.json(
        { error: "지원 형식: PPT, PPTX, MD, MDX, XLSX, XLS" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = await parseFile(buffer, file.name);

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "파일에서 내용을 추출할 수 없습니다." },
        { status: 400 }
      );
    }

    const parseOnly = formData.get("parseOnly") === "true";

    if (parseOnly) {
      return NextResponse.json({
        parsedText: content,
        specs: [],
        parseOnly: true,
      });
    }

    const userPrompt = SPEC_CONVERSION_USER_PROMPT_PREFIX + content;
    const rawResponse = await createClaudeMessage(
      SPEC_CONVERSION_SYSTEM_PROMPT,
      userPrompt,
      { maxTokens: 4096 }
    );

    let specs: Spec[];
    try {
      specs = extractJsonArray(rawResponse);
    } catch (parseErr) {
      console.error("Spec JSON parse error:", parseErr);
      return NextResponse.json(
        { error: "AI 응답 파싱 실패. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    if (specs.length === 0) {
      return NextResponse.json({ specs: [] });
    }

    const projectIdToUse = projectId ?? undefined;
    const rows = specs.map((s) => ({
      project_id: projectIdToUse,
      screen_code: s.screen_code ?? "",
      screen_name: s.screen_name ?? "",
      path: s.path ?? "",
      screen_type: s.screen_type ?? "",
      roles: s.roles ?? "",
      conditions: s.conditions ?? "",
      format: s.format ?? "",
      interactions: s.interactions ?? "",
      notes: s.notes ?? "",
    }));

    const { data: inserted, error } = await supabase
      .from("specs")
      .insert(rows)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "스펙 저장 실패: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ specs: inserted ?? rows });
  } catch (err) {
    console.error("POST /api/spec error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
