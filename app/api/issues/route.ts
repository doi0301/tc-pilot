/**
 * TC Pilot — GET /api/issues (T-033)
 * projectId로 issues 조회
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
      return NextResponse.json({ issues: [] });
    }

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ issues: data ?? [] });
  } catch (err) {
    console.error("GET /api/issues error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
