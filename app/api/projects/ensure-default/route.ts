import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * T-002: 기본 프로젝트가 없으면 "TC Pilot Demo" 생성
 * 앱 최초 진입 시 호출
 */
export async function GET() {
  try {
    const { data: existing } = await supabase
      .from("projects")
      .select("id, project_name")
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ project: existing[0] });
    }

    const { data: inserted, error } = await supabase
      .from("projects")
      .insert({ project_name: "TC Pilot Demo" })
      .select("id, project_name")
      .single();

    if (error) {
      console.error("T-002 ensure-default error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ project: inserted });
  } catch (e) {
    console.error("T-002 ensure-default:", e);
    return NextResponse.json(
      { error: "Failed to ensure default project" },
      { status: 500 }
    );
  }
}
