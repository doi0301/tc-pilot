/**
 * TC Pilot — GET /api/tc/export-csv
 * projectId, batchId로 TC 조회 후 CSV 반환 (구글 시트 IMPORTDATA용)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { testCasesToCsv } from "@/lib/csv-export";

async function getDefaultProjectId(): Promise<string | null> {
  const { data } = await supabase.from("projects").select("id").limit(1);
  return data?.[0]?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let projectId: string | null = searchParams.get("projectId");
    const batchId = searchParams.get("batchId");

    if (!projectId) {
      const defaultProjectId = await getDefaultProjectId();
      if (!defaultProjectId) {
        return new NextResponse("프로젝트를 찾을 수 없습니다.", { status: 400 });
      }
      projectId = defaultProjectId;
    }

    let query = supabase
      .from("test_cases")
      .select("*")
      .eq("project_id", projectId);

    if (batchId && batchId !== "__unbatched__") {
      query = query.eq("batch_id", batchId);
    } else if (batchId === "__unbatched__") {
      query = query.is("batch_id", null);
    }

    const { data: testCases, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    const csv = testCasesToCsv((testCases ?? []) as Parameters<typeof testCasesToCsv>[0]);
    const bom = "\uFEFF";
    const body = bom + csv;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "inline; filename=tc-list.csv",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("GET /api/tc/export-csv error:", err);
    return new NextResponse("서버 오류", { status: 500 });
  }
}
