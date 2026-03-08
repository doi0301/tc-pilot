/**
 * TC Pilot — Notion API 래퍼 (T-026)
 * docs/supabase/T-004-Notion-이슈-DB-생성-가이드.md 참고
 *
 * 속성명: Notion DB의 속성 이름이 코드와 다르면 .env.local에 아래 변수로 맞춰주세요.
 * 예) NOTION_PROP_TITLE=Name, NOTION_PROP_STATUS=Status (영어 Notion 사용 시)
 */
import { Client } from "@notionhq/client";
import type { Issue } from "@/types";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_ISSUE_DATABASE_ID;

const useEnglish = process.env.NOTION_USE_ENGLISH === "true";
const prop = {
  title: process.env.NOTION_PROP_TITLE ?? (useEnglish ? "Name" : "이름"),
  status: process.env.NOTION_PROP_STATUS ?? (useEnglish ? "Status" : "상태"),
  severity: process.env.NOTION_PROP_SEVERITY ?? (useEnglish ? "Severity" : "심각도"),
  screenCode: process.env.NOTION_PROP_SCREEN_CODE ?? (useEnglish ? "Screen code" : "화면코드"),
  reproSteps: process.env.NOTION_PROP_REPRO_STEPS ?? (useEnglish ? "Reproduction steps" : "재현순서"),
  expected: process.env.NOTION_PROP_EXPECTED ?? (useEnglish ? "Expected" : "기대결과"),
  actual: process.env.NOTION_PROP_ACTUAL ?? (useEnglish ? "Actual" : "실제결과"),
  relatedTc: process.env.NOTION_PROP_RELATED_TC ?? (useEnglish ? "Related TC" : "관련TC"),
  regDate: process.env.NOTION_PROP_REG_DATE ?? (useEnglish ? "Date" : "등록일"),
};

export async function createIssuePage(issue: Issue): Promise<{ pageId: string; pageUrl: string }> {
  if (!DATABASE_ID) {
    throw new Error("NOTION_ISSUE_DATABASE_ID가 설정되지 않았습니다.");
  }

  const response = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      [prop.title]: {
        title: [{ type: "text", text: { content: issue.title } }],
      },
      [prop.status]: {
        select: { name: "Open" },
      },
      [prop.severity]: {
        select: { name: issue.severity },
      },
      [prop.screenCode]: {
        rich_text: [{ text: { content: issue.tc_id.split("-")[0] || "" } }],
      },
      [prop.reproSteps]: {
        rich_text: [{ text: { content: issue.reproduction_steps } }],
      },
      [prop.expected]: {
        rich_text: [{ text: { content: issue.expected } }],
      },
      [prop.actual]: {
        rich_text: [{ text: { content: issue.actual } }],
      },
      [prop.relatedTc]: {
        rich_text: [{ text: { content: issue.tc_id } }],
      },
      [prop.regDate]: {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    },
  });

  const pageId = "id" in response ? response.id : "";
  const pageUrl = pageId
    ? `https://www.notion.so/${pageId.replace(/-/g, "")}`
    : "";

  return { pageId, pageUrl };
}
