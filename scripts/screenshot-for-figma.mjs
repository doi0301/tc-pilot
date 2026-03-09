/**
 * TC Pilot — Figma용 화면 스크린샷 캡처
 * 사용법: npm run dev 실행 후, 다른 터미널에서 node scripts/screenshot-for-figma.mjs
 * 생성된 PNG를 Figma에 드래그앤드롭하세요.
 */

import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "../figma-screenshots");

const BASE_URL = "http://localhost:3001";
const VIEWPORT = { width: 1440, height: 900 };

async function capture() {
  let browser;
  try {
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    await mkdir(OUTPUT_DIR, { recursive: true });

    const screens = [
      { name: "01-스펙변환", url: BASE_URL, wait: 2000 },
      { name: "02-TC목록", url: BASE_URL, tab: "tc", wait: 2000 },
      { name: "03-이슈로그", url: BASE_URL, tab: "issues", wait: 2000 },
    ];

    for (const s of screens) {
      await page.goto(s.url, { waitUntil: "networkidle0", timeout: 15000 });
      if (s.tab) {
        const label = s.tab === "tc" ? "TC 목록" : "이슈 로그";
        await page.evaluate((lbl) => {
          const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes(lbl));
          btn?.click();
        }, label);
        await new Promise((r) => setTimeout(r, 800));
      }
      await new Promise((r) => setTimeout(r, s.wait ?? 1500));
      const path = join(OUTPUT_DIR, `${s.name}.png`);
      await page.screenshot({ path, fullPage: false });
      console.log(`✓ ${s.name}.png`);
    }

    console.log(`\n완료! ${OUTPUT_DIR} 폴더의 PNG 파일을 Figma에 드래그앤드롭하세요.`);
  } catch (err) {
    console.error("오류:", err.message);
    if (err.message?.includes("Target closed") || err.message?.includes("net::ERR_CONNECTION_REFUSED")) {
      console.log("\n먼저 'npm run dev'로 개발 서버를 실행해주세요.");
    }
  } finally {
    await browser?.close();
  }
}

capture();
