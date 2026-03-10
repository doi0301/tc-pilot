/**
 * TC Pilot — POST /api/spec (T-009)
 * multipart/form-data 파일 수신 → 파싱 → Claude → 스펙 JSON → Supabase specs 저장
 */

import { NextRequest, NextResponse } from "next/server";
import { parseFile, isAllowedFile, getFileType } from "@/lib/parsers";
import { createClaudeMessage } from "@/lib/claude";
import {
  SPEC_CONVERSION_SYSTEM_PROMPT,
  SPEC_CONVERSION_USER_PROMPT_PREFIX,
} from "@/lib/prompts";
import { supabase } from "@/lib/supabase";
import { extractJsonArray } from "@/lib/json-parse-fallback";
import type { Spec } from "@/types";

async function getDefaultProjectId(): Promise<string | undefined> {
  const { data } = await supabase.from("projects").select("id").limit(1);
  return data?.[0]?.id;
}

function splitPptSlides(raw: string): string[] {
  return raw
    .split(/\n\s*--- 슬라이드 구분 ---\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPptPreview(slides: string[]): string {
  if (slides.length === 0) return "";
  return slides
    .map((slide, idx) => {
      return `[#${idx + 1} 슬라이드]\n${slide}`;
    })
    .join("\n\n------------------------------\n\n");
}

async function generateSpecsFromPptChunks(
  content: string,
  originalText: string
): Promise<Spec[]> {
  const slides = splitPptSlides(content);
  if (slides.length === 0) {
    // fallback: 기존 방식 유지
    const userPrompt = SPEC_CONVERSION_USER_PROMPT_PREFIX + originalText;
    const rawResponse = await createClaudeMessage(
      SPEC_CONVERSION_SYSTEM_PROMPT,
      userPrompt,
      { maxTokens: 4096 }
    );
    return extractJsonArray<Spec>(rawResponse);
  }

  const MAX_SLIDES_PER_CHUNK = 12;
  const allSpecs: Spec[] = [];

  for (let i = 0; i < slides.length; i += MAX_SLIDES_PER_CHUNK) {
    const chunkSlides = slides.slice(i, i + MAX_SLIDES_PER_CHUNK);
    const chunkRangeStart = i + 1;
    const chunkRangeEnd = i + chunkSlides.length;
    const chunkText = chunkSlides.join(
      "\n\n--- 슬라이드 구분 ---\n\n"
    );

    const userPrompt =
      SPEC_CONVERSION_USER_PROMPT_PREFIX +
      `다음 내용은 PPT 기획서의 슬라이드 #${chunkRangeStart}~#${chunkRangeEnd}에 해당합니다.\n` +
      `각 슬라이드에서 화면/기능 스펙으로 볼 수 있는 부분만 골라 JSON 스펙 배열로 변환해주세요.\n\n` +
      chunkText;

    const rawResponse = await createClaudeMessage(
      SPEC_CONVERSION_SYSTEM_PROMPT,
      userPrompt,
      { maxTokens: 4096 }
    );

    const chunkSpecs = extractJsonArray<Spec>(rawResponse);
    if (Array.isArray(chunkSpecs) && chunkSpecs.length > 0) {
      allSpecs.push(...chunkSpecs);
    }
  }

  return allSpecs;
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
    const fileType = getFileType(file.name);

    if (parseOnly) {
      if (fileType === "ppt") {
        const slides = splitPptSlides(content);
        return NextResponse.json({
          parsedText: buildPptPreview(slides),
          specs: [],
          parseOnly: true,
        });
      }

      return NextResponse.json({
        parsedText: content,
        specs: [],
        parseOnly: true,
      });
    }

    let specs: Spec[] = [];
    try {
      if (fileType === "ppt") {
        specs = await generateSpecsFromPptChunks(content, content);
      } else {
        const userPrompt = SPEC_CONVERSION_USER_PROMPT_PREFIX + content;
        const rawResponse = await createClaudeMessage(
          SPEC_CONVERSION_SYSTEM_PROMPT,
          userPrompt,
          { maxTokens: 4096 }
        );
        specs = extractJsonArray<Spec>(rawResponse);
      }
    } catch (parseErr) {
      console.error("Spec JSON parse error:", parseErr);
      const msg =
        parseErr instanceof Error ? parseErr.message : "AI 응답 파싱 실패";
      return NextResponse.json({ error: msg }, { status: 500 });
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
