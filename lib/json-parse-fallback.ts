/**
 * TC Pilot — JSON 파싱 fallback (T-019)
 * AI 응답 JSON 파싱 실패 시 여러 전략으로 재시도
 */

/**
 * AI 응답 텍스트에서 JSON 배열 추출 (fallback 파서)
 * 1. 순수 JSON 배열 [ ... ]
 * 2. 마크다운 코드블록 ```json ... ``` 또는 ``` ... ```
 * 3. 괄호 밸런스로 배열 경계 추정
 */
export function extractJsonArray<T = unknown>(text: string): T[] {
  if (!text?.trim()) {
    throw new Error("응답 내용이 비어 있습니다.");
  }

  const strategies: Array<() => string | null> = [
    () => extractFromMarkdownCodeBlock(text),
    () => extractFromBracketMatch(text),
    () => extractFromRegex(text),
  ];

  for (const strategy of strategies) {
    const candidate = strategy();
    if (!candidate) continue;

    try {
      const parsed = JSON.parse(candidate);
      if (!Array.isArray(parsed)) continue;
      return parsed as T[];
    } catch {
      const fixed = tryFixCommonJsonIssues(candidate);
      if (fixed) {
        try {
          const parsed = JSON.parse(fixed);
          if (Array.isArray(parsed)) return parsed as T[];
        } catch {
          /* continue to next strategy */
        }
      }
    }
  }

  // 디버깅을 위해 응답 앞부분 일부를 로그로 남김
  try {
    const preview = text.slice(0, 400);
    // eslint-disable-next-line no-console
    console.error(
      "extractJsonArray 실패. 응답 앞부분 미리보기:",
      preview
    );
  } catch {
    // ignore logging errors
  }

  throw new Error(
    "AI 응답에서 JSON 배열을 추출할 수 없습니다. 다시 시도해주세요."
  );
}

/**
 * AI 응답 텍스트에서 JSON 객체 추출 (fallback 파서)
 * 이슈 보강 응답 { reproductionSteps, actual } 등 객체용
 */
export function extractJsonObject<T = Record<string, unknown>>(text: string): T {
  if (!text?.trim()) {
    throw new Error("응답 내용이 비어 있습니다.");
  }

  const strategies: Array<() => string | null> = [
    () => extractObjectFromMarkdownCodeBlock(text),
    () => extractFromBraceMatch(text),
    () => text.match(/\{[\s\S]*\}/)?.[0] ?? null,
  ];

  for (const strategy of strategies) {
    const candidate = strategy();
    if (!candidate) continue;

    try {
      const parsed = JSON.parse(candidate);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) continue;
      return parsed as T;
    } catch {
      const fixed = tryFixCommonJsonIssues(candidate);
      if (fixed) {
        try {
          const parsed = JSON.parse(fixed);
          if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as T;
        } catch {
          /* continue to next strategy */
        }
      }
    }
  }

  throw new Error(
    "AI 응답에서 JSON 객체를 추출할 수 없습니다. 다시 시도해주세요."
  );
}

function extractObjectFromMarkdownCodeBlock(text: string): string | null {
  const regex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const content = match[1].trim();
    if (content.startsWith("{")) return content;
  }
  return null;
}

function extractFromBraceMatch(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  let quoteChar = '"';

  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (inString) {
      if (c === quoteChar) inString = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      quoteChar = c;
      continue;
    }
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** 마크다운 코드블록에서 JSON 배열 추출 */
function extractFromMarkdownCodeBlock(text: string): string | null {
  const regex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const content = match[1].trim();
    if (content.startsWith("[")) return content;
  }
  return null;
}

/** 괄호 밸런스로 [ ... ] 배열 경계 찾기 */
function extractFromBracketMatch(text: string): string | null {
  const start = text.indexOf("[");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  let quoteChar = '"';

  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (inString) {
      if (c === quoteChar) inString = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      quoteChar = c;
      continue;
    }
    if (c === "[") depth++;
    if (c === "]") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** 정규식으로 첫 번째 [ ... ] 매칭 (기존 방식) */
function extractFromRegex(text: string): string | null {
  const match = text.match(/\[[\s\S]*\]/);
  return match ? match[0] : null;
}

/** 흔한 JSON 오류 수정 시도 (trailing comma, 줄바꿈 등) */
function tryFixCommonJsonIssues(json: string): string | null {
  try {
    let fixed = json;
    // trailing comma before ] or }
    fixed = fixed.replace(/,(\s*[}\]])/g, "$1");
    // single quotes -> double quotes (간단한 경우만)
    if (fixed.includes("'") && !fixed.includes('"')) {
      fixed = fixed.replace(/'/g, '"');
    }
    return fixed;
  } catch {
    return null;
  }
}
