/**
 * TC Pilot — POST /api/tc (T-012)
 * projectId, specIds 수신 → specs 조회 → Claude → TC JSON 파싱 → test_cases 저장
 */

import { NextRequest, NextResponse } from "next/server";
import { createClaudeMessage } from "@/lib/claude";
import { TC_GENERATION_SYSTEM_PROMPT } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";
import type { Spec, TestCase } from "@/types";

async function getDefaultProjectId(): Promise<string | undefined> {
  const { data } = await supabase.from("projects").select("id").limit(1);
  return data?.[0]?.id;
}

function extractJsonArray(text: string): TestCase[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("JSON 배열을 찾을 수 없습니다.");
  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) throw new Error("배열이 아닙니다.");
  return parsed as TestCase[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let projectId: string | undefined = body.projectId;
    const specIds: string[] | undefined = body.specIds;

    if (!projectId) projectId = await getDefaultProjectId();
    if (!projectId) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    let specs: Spec[];
    if (specIds && specIds.length > 0) {
      const { data, error } = await supabase
        .from("specs")
        .select("*")
        .in("id", specIds)
        .eq("project_id", projectId);
      if (error) throw error;
      specs = data ?? [];
    } else {
      const { data, error } = await supabase
        .from("specs")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      specs = data ?? [];
    }

    if (specs.length === 0) {
      return NextResponse.json(
        { error: "스펙이 없습니다. 먼저 스펙을 변환해주세요." },
        { status: 400 }
      );
    }

    const specsJson = JSON.stringify(specs, null, 2);
    const userPrompt = `다음 스펙 JSON을 기반으로 테스트 케이스를 도출해주세요. 순수 JSON 배열만 출력하세요.\n\n${specsJson}`;

    const rawResponse = await createClaudeMessage(
      TC_GENERATION_SYSTEM_PROMPT,
      userPrompt,
      { maxTokens: 8192 }
    );

    let testCases: TestCase[];
    try {
      testCases = extractJsonArray(rawResponse);
    } catch (parseErr) {
      console.error("TC JSON parse error:", parseErr);
      return NextResponse.json(
        { error: "AI 응답 파싱 실패. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const specByScreenCode = new Map(specs.map((s) => [s.screen_code, s]));

    const rows = testCases.map((tc) => {
      const spec = specByScreenCode.get(tc.screen_code);
      return {
        project_id: projectId,
        spec_id: spec?.id ?? null,
        tc_id: tc.tc_id ?? "",
        section: tc.section ?? "",
        feature_group: tc.feature_group ?? "",
        screen_code: tc.screen_code ?? "",
        test_perspective: tc.test_perspective ?? "N",
        priority: tc.priority ?? "P3",
        title: tc.title ?? "",
        preconditions: tc.preconditions ?? "",
        steps: tc.steps ?? "",
        expected_result: tc.expected_result ?? "",
        status: "미확인",
      };
    });

    const { data: inserted, error } = await supabase
      .from("test_cases")
      .insert(rows)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "TC 저장 실패: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ testCases: inserted ?? rows });
  } catch (err) {
    console.error("POST /api/tc error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}

/** GET /api/tc — projectId로 test_cases 조회 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let projectId = searchParams.get("projectId");

    if (!projectId) {
      const { data } = await supabase.from("projects").select("id").limit(1);
      projectId = data?.[0]?.id ?? null;
    }

    if (!projectId) {
      return NextResponse.json({ testCases: [] });
    }

    const { data, error } = await supabase
      .from("test_cases")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ testCases: data ?? [] });
  } catch (err) {
    console.error("GET /api/tc error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
