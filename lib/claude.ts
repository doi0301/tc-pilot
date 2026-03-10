import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn("ANTHROPIC_API_KEY is not set. Claude API will not work.");
}

export const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

/**
 * Claude API로 텍스트 생성 (JSON 응답용)
 */
export async function createClaudeMessage(
  systemPrompt: string,
  userContent: string,
  options?: { maxTokens?: number; model?: string }
) {
  if (!anthropic) {
    throw new Error(
      "Claude API 키가 설정되지 않았습니다. .env.local에 ANTHROPIC_API_KEY를 추가해주세요. (설정 방법: docs/API_KEYS_GUIDE.md) AI 없이 파싱만 테스트하려면 '파싱만 테스트' 체크박스를 사용하세요."
    );
  }

  let response;
  try {
    response = await anthropic.messages.create({
      model: options?.model ?? "claude-sonnet-4-20250514",
      max_tokens: options?.maxTokens ?? 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });
  } catch (err) {
    const anyErr = err as any;
    const status = anyErr?.status ?? anyErr?.response?.status;
    const type = anyErr?.error?.type;

    if (status === 429 || type === "rate_limit_error") {
      throw new Error(
        "현재 AI 사용량이 많아 요청이 제한되었습니다. 잠시 후 다시 시도하거나, 문서 분량을 줄여서 다시 시도해 주세요."
      );
    }

    throw err;
  }

  const textBlock = response.content.find((block: any) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in Claude response.");
  }

  return textBlock.text;
}
