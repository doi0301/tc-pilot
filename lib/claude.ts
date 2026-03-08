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
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const response = await anthropic.messages.create({
    model: options?.model ?? "claude-sonnet-4-20250514",
    max_tokens: options?.maxTokens ?? 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in Claude response.");
  }

  return textBlock.text;
}
