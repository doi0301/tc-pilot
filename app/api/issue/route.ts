/**
 * TC Pilot — POST /api/issue (T-029)
 * TC 맥락 + 사용자 실제결과 → Claude 보강 → 재현순서/실제결과 반환
 */
import { NextRequest, NextResponse } from "next/server";
import { createClaudeMessage } from "@/lib/claude";
import { ISSUE_ENHANCEMENT_SYSTEM_PROMPT } from "@/lib/prompts";
import { extractJsonObject } from "@/lib/json-parse-fallback";
import type { TestCase } from "@/types";

interface IssueEnhancementResponse {
  reproductionSteps: string;
  actual: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tcContext: TestCase | undefined = body.tcContext;
    const actualResult: string | undefined = body.actualResult;

    if (!tcContext || typeof actualResult !== "string") {
      return NextResponse.json(
        { error: "tcContext와 actualResult는 필수입니다." },
        { status: 400 }
      );
    }

    const userPrompt = `## TC 맥락
- 테스트 절차: ${tcContext.steps ?? ""}
- 기대결과: ${tcContext.expected_result ?? ""}

## 사용자 입력 (실제결과)
${actualResult.trim()}

위 TC 맥락을 참고하여, 사용자 입력을 이슈 트래커 등록용으로 보강한 JSON 객체만 출력해주세요.`;

    const rawResponse = await createClaudeMessage(
      ISSUE_ENHANCEMENT_SYSTEM_PROMPT,
      userPrompt,
      { maxTokens: 2048 }
    );

    let result: IssueEnhancementResponse;
    try {
      result = extractJsonObject<IssueEnhancementResponse>(rawResponse);
    } catch (parseErr) {
      console.error("Issue enhancement JSON parse error:", parseErr);
      const msg = parseErr instanceof Error ? parseErr.message : "AI 응답 파싱 실패";
      return NextResponse.json(
        { error: msg },
        { status: 500 }
      );
    }

    const reproductionSteps = typeof result.reproductionSteps === "string" ? result.reproductionSteps : "";
    const actual = typeof result.actual === "string" ? result.actual : actualResult;

    return NextResponse.json({ reproductionSteps, actual });
  } catch (err) {
    console.error("POST /api/issue error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "서버 오류" },
      { status: 500 }
    );
  }
}
