# TC Pilot × FlowDay Dark Theme — 스타일 핸드오프 (v1.0)

> **목적:** [tc-pilot](https://github.com/doi0301/tc-pilot)에 **비즈니스 로직·TypeScript 코드 구조는 유지**한 채, FlowDay에서 쓰는 **다크 테마(Deep Space) 셸**만 동일하게 맞추기 위한 구현 가이드입니다.  
> **소스 레퍼런스 (FlowDay):** `web/src/app/globals.css` (`.dark` 블록), `FlowDay_DesignSystem_v2.md`

---

## 1. 범위와 원칙

| 항목 | 포함 | 제외(유지) |
|------|------|------------|
| 페이지·레이아웃 **배경**, **카드**, **사이드바 크롬**, **기본 텍스트/보더** | FlowDay 토큰으로 통일 | — |
| **TC 전용** 색: P/F, Severity, Perspective 태그, Priority 뱃지 등 | 선택 | 기존 `tc-pilot-design-system-v1.0.md` 변수·의미 유지 권장 |
| **포인트 컬러** (Warm Red) | 선택 | 다크 셸 위에서는 **액센트만** 레드 유지하고, 배경은 Deep Space 계열 사용 |

**권장 전략:**

- **셸(shell):** `bg-background`, `text-foreground`, `border-border`, `bg-card`, 사이드바는 `bg-sidebar` 등 **시맨틱 토큰**으로 통일.
- **도메인:** `--status-pass-*`, `--severity-*` 등 **기존 CSS 변수**를 그대로 두고, 테이블/뱃지에만 사용.

---

## 2. 스택 차이 (이식 시 알아둘 것)

| | TC Pilot (현재) | FlowDay (참고) |
|--|-----------------|----------------|
| Next.js | 14 App Router | 15 |
| Tailwind | **3.x** (`tailwind.config.ts`) | **4.x** (`@import "tailwindcss"`, `@theme inline`) |
| 전역 CSS | `@tailwind base/components/utilities` + `:root` 커스텀 변수 | CSS 변수 + `@theme inline`로 Tailwind와 연결 |

이 핸드오프는 **Tailwind 3**에서 동작하도록 **토큰 이름은 FlowDay와 동일**하게 두고, **`tailwind.config.ts`에 `theme.extend`로 매핑**하는 방식을 사용합니다.

---

## 3. 색상 토큰 (Deep Space — 다크 기본)

FlowDay와 동일한 HEX입니다. `html`에 클래스 **`dark`**가 있을 때 적용됩니다.

```css
/* app/globals.css 하단 등에 추가 */
.dark {
  --background: #0b1222;
  --foreground: #f1f5f9;
  --card: #111c2e;
  --card-foreground: #f1f5f9;
  --popover: #111c2e;
  --popover-foreground: #f1f5f9;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #1e3050;
  --secondary-foreground: #f1f5f9;
  --muted: #182740;
  --muted-foreground: #94a3b8;
  --accent: #1e3050;
  --accent-foreground: #f1f5f9;
  --destructive: #ef4444;
  --border: #1e2d42;
  --input: #182740;
  --ring: #3b82f6;
  --chart-1: #3b82f6;
  --chart-2: #10b981;
  --chart-3: #8b5cf6;
  --chart-4: #f59e0b;
  --chart-5: #ec4899;
  --radius: 0.625rem;
  --sidebar: #0f1629;
  --sidebar-foreground: #94a3b8;
  --sidebar-primary: #f1f5f9;
  --sidebar-primary-foreground: #0b1222;
  --sidebar-accent: rgb(59 130 246 / 0.15);
  --sidebar-accent-foreground: #60a5fa;
  --sidebar-border: #1e2d42;
  --sidebar-ring: #3b82f6;
}
```

**라이트 모드**를 나중에 살리려면 FlowDay `web/src/app/globals.css`의 `:root` 라이트 팔레트를 함께 넣고, `html`에서 `dark` 클래스를 토글하면 됩니다. (선택)

---

## 4. Tailwind 3 연동 (`tailwind.config.ts`)

`theme.extend`에 시맨틱 색을 연결합니다. (값은 위 CSS 변수를 가리킴)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) * 0.8)",
        sm: "calc(var(--radius) * 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
```

`--radius`는 `.dark` 블록에 이미 포함되어 있습니다. 라이트만 쓸 경우 `:root`에도 `--radius: 0.625rem`을 두세요.

---

## 5. 전역 CSS (`app/globals.css`) 정리 가이드

1. **기존 `:root` 블록**은 TC Pilot 도메인 변수(`--status-*`, `--point-*` 등) 때문에 **삭제하지 말고**, 위 `.dark { ... }` 블록을 **추가**합니다.
2. **다크 기본**으로 쓸 경우:

   ```css
   body {
     @apply bg-background text-foreground;
   }
   ```

   기존 `body { background: var(--bg-page); color: var(--text-primary); }`는 **충돌**하므로, 셸은 `bg-background`/`text-foreground`로 통일하고, **테이블·뱃지**는 기존 변수 클래스를 유지해도 됩니다.

3. **베이스 보더** (FlowDay와 맞추려면):

   ```css
   @layer base {
     * {
       @apply border-border;
     }
   }
   ```

---

## 6. 루트 레이아웃 (`app/layout.tsx`)

다크 셸을 기본으로 쓰려면 `html`에 `dark` 클래스를 붙입니다.

```tsx
<html lang="ko" className="h-full dark">
  <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
```

(선택) 나중에 라이트/다크 토글을 쓰려면 `next-themes`의 `ThemeProvider` + `attribute="class"` 패턴을 도입하고, `storageKey`는 `tc-pilot-theme` 등으로 분리하는 것을 권장합니다.

---

## 7. 타이포그래피 (FlowDay와 유사하게)

FlowDay는 **Pretendard Variable** + **Geist Mono**를 사용합니다.

1. 패키지 추가: `npm i pretendard`
2. `layout.tsx`에서:

   ```tsx
   import "pretendard/dist/web/variable/pretendardvariable.css";
   import { Geist_Mono } from "next/font/google";

   const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
   });
   ```

3. `body`:

   ```tsx
   <body className={`${geistMono.variable} font-sans antialiased ...`}>
   ```

4. `tailwind.config.ts`:

   ```ts
   fontFamily: {
     sans: [
       '"Pretendard Variable"',
       "Pretendard",
       "ui-sans-serif",
       "system-ui",
       "sans-serif",
     ],
     mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
   },
   ```

폰트까지 동일하지 않아도 되면, 기존 `--font-primary` 스택만 유지해도 됩니다.

---

## 8. 컴포넌트 마이그레이션 치트시트

| 목적 | Tailwind 클래스 예시 |
|------|----------------------|
| 페이지 배경 | `bg-background` |
| 본문 텍스트 | `text-foreground` |
| 보조 텍스트 | `text-muted-foreground` |
| 카드/패널 | `bg-card text-card-foreground border border-border rounded-lg` |
| 사이드바 영역 | `bg-sidebar text-sidebar-foreground border-sidebar-border` |
| 주요 버튼(블루 계열) | `bg-primary text-primary-foreground` |
| 구분선 | `border-border` |

기존 **Warm Red** 포인트를 유지하려면 CTA에 `bg-[var(--point-default)]` 또는 도메인 전용 클래스(`.btn-primary`)를 유지하면 됩니다. 다크 배경과의 대비만 확인하세요.

---

## 9. 검증 체크리스트

- [ ] `html`에 `dark` 적용 시 전체 배경이 `#0B1222` 계열로 보이는지
- [ ] 사이드바/메인 영역이 FlowDay와 유사한 명암인지 (`#0F1629` / `#111C2E` 등)
- [ ] TC 테이블의 P/F·Severity 색이 **가독성**을 잃지 않는지 (필요 시 변수만 미세 조정)
- [ ] 포커스 링 `ring-ring` / `outline`이 키보드 내비게이션에서 보이는지
- [ ] 빌드: `npm run build` 통과

---

## 10. 참고

- TC Pilot: [github.com/doi0301/tc-pilot](https://github.com/doi0301/tc-pilot)
- 기존 TC Pilot 디자인: `docs/design/tc-pilot-design-system-v1.0.md`
- FlowDay 구현: `web/src/app/globals.css`, `FlowDay_DesignSystem_v2.md` (FlowDay 레포)

---

**문서 버전:** 1.0  
**작성 기준일:** 2026-03-29
