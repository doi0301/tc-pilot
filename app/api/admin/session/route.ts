import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const { isAdmin } = getAdminFromRequest(request);
  return NextResponse.json({ isAdmin });
}

