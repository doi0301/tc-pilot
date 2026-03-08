/**
 * PATCH /api/tc/[id] — test_cases.status 업데이트 (T-021)
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const VALID_STATUS = ["PASS", "FAIL", "진행중", "미확인"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 status입니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("test_cases")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/tc/[id] error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ testCase: data });
  } catch (err) {
    console.error("PATCH /api/tc/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
