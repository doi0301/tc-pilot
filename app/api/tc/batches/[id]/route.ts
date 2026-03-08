/**
 * TC Pilot — PATCH/DELETE /api/tc/batches/[id]
 * 배치 제목 수정, 배치 삭제
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const UNBATCHED_ID = "__unbatched__";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (id === UNBATCHED_ID) {
      return NextResponse.json(
        { error: "미분류 배치는 수정할 수 없습니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tc_batches")
      .update({ title })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/tc/batches/[id] error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ batch: data });
  } catch (err) {
    console.error("PATCH /api/tc/batches/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (id === UNBATCHED_ID) {
      return NextResponse.json(
        { error: "미분류 배치는 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tc_batches")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/tc/batches/[id] error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tc/batches/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
