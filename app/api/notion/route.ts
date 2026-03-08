/**
 * TC Pilot — POST /api/notion (T-027)
 * Issue 수신 → Notion API 호출 → Supabase issues 저장
 */
import { NextRequest, NextResponse } from "next/server";
import { createIssuePage } from "@/lib/notion";
import { supabase } from "@/lib/supabase";
import type { Issue } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const issue: Issue = body.issue;

    if (!issue?.tc_id || !issue?.title || !issue?.actual) {
      return NextResponse.json(
        { error: "tc_id, title, actual은 필수입니다." },
        { status: 400 }
      );
    }

    const { pageId, pageUrl } = await createIssuePage(issue);

    const { data, error } = await supabase
      .from("issues")
      .insert({
        project_id: issue.project_id,
        tc_id: issue.tc_id,
        title: issue.title,
        severity: issue.severity,
        reproduction_steps: issue.reproduction_steps,
        expected: issue.expected,
        actual: issue.actual,
        screenshot_url: issue.screenshot_url ?? null,
        notion_page_id: pageId,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase issues insert error:", error);
      return NextResponse.json(
        { error: "이슈 저장 실패: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notionPageId: pageId,
      notionPageUrl: pageUrl,
      issue: data,
    });
  } catch (err) {
    console.error("POST /api/notion error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Notion 등록 실패" },
      { status: 500 }
    );
  }
}
