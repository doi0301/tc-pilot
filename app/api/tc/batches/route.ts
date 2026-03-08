/**
 * TC Pilot — GET /api/tc/batches
 * projectId로 tc_batches 목록 조회 (각 배치별 TC 개수 포함)
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let projectId = searchParams.get("projectId");

    if (!projectId) {
      const { data } = await supabase.from("projects").select("id").limit(1);
      projectId = data?.[0]?.id ?? null;
    }

    if (!projectId) {
      return NextResponse.json({ batches: [] });
    }

    const { data: batches, error } = await supabase
      .from("tc_batches")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const batchesWithCount = await Promise.all(
      (batches ?? []).map(async (b) => {
        const { count } = await supabase
          .from("test_cases")
          .select("*", { count: "exact", head: true })
          .eq("batch_id", b.id);
        return { ...b, tc_count: count ?? 0 };
      })
    );

    const { count: unbatchedCount } = await supabase
      .from("test_cases")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .is("batch_id", null);

    const result = batchesWithCount;
    if ((unbatchedCount ?? 0) > 0) {
      result.unshift({
        id: "__unbatched__",
        project_id: projectId,
        title: "미분류 (이전)" as string,
        created_at: null,
        tc_count: unbatchedCount ?? 0,
      } as (typeof batchesWithCount)[0] & { id: string });
    }

    return NextResponse.json({ batches: result });
  } catch (err) {
    console.error("GET /api/tc/batches error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
