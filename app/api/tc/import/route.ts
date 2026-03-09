/**
 * TC Pilot — POST /api/tc/import
 * xlsx 파일 업로드 → HIPAS 양식 파싱 → test_cases 저장
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseTcXlsx } from "@/lib/xlsx-import";
import type { TestCase } from "@/types";

async function getDefaultProjectId(): Promise<string | undefined> {
  const { data } = await supabase.from("projects").select("id").limit(1);
  return data?.[0]?.id;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let projectId = formData.get("projectId") as string | null;
    const batchId = formData.get("batchId") as string | null;
    const batchTitle = (formData.get("batchTitle") as string)?.trim();

    if (!file) {
      return NextResponse.json({ error: "xlsx 파일을 선택해주세요." }, { status: 400 });
    }

    if (!projectId) projectId = await getDefaultProjectId();
    if (!projectId) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const testCases = parseTcXlsx(buffer);

    if (testCases.length === 0) {
      return NextResponse.json(
        { error: "유효한 TC가 없습니다. HIPAS 양식 xlsx인지 확인해주세요." },
        { status: 400 }
      );
    }

    let targetBatchId: string | null = batchId;

    if (!targetBatchId && batchTitle) {
      const { data: newBatch, error: batchError } = await supabase
        .from("tc_batches")
        .insert({ project_id: projectId, title: batchTitle })
        .select()
        .single();
      if (batchError || !newBatch) {
        return NextResponse.json(
          { error: "배치 생성 실패: " + (batchError?.message ?? "알 수 없음") },
          { status: 500 }
        );
      }
      targetBatchId = newBatch.id;
    }

    if (!targetBatchId) {
      return NextResponse.json(
        { error: "배치를 선택하거나 새 배치 제목을 입력해주세요." },
        { status: 400 }
      );
    }

    const rows = testCases.map((tc) => ({
      project_id: projectId,
      batch_id: targetBatchId,
      spec_id: null,
      tc_id: tc.tc_id,
      section: tc.section ?? "",
      feature_group: tc.feature_group ?? "",
      screen_code: tc.screen_code ?? "",
      test_perspective: tc.test_perspective ?? "N",
      priority: tc.priority ?? "P3",
      title: tc.title ?? "",
      preconditions: tc.preconditions ?? "",
      steps: tc.steps ?? "",
      expected_result: tc.expected_result ?? "",
      status: tc.status ?? "미확인",
      issue_memo: tc.issue_memo ?? null,
    }));

    const { data: inserted, error } = await supabase
      .from("test_cases")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "TC 저장 실패: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      testCases: inserted ?? rows,
      count: (inserted ?? rows).length,
      batchId: targetBatchId,
    });
  } catch (err) {
    console.error("POST /api/tc/import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
