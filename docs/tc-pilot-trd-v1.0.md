# TC Pilot — Technical Requirements Document (TRD)

# 기술 요구사항 명세서

**버전:** v1.0  
**작성일:** 2026-03-08  
**작성자:** CTO  
**기반 문서:** TC Pilot PRD v1.0, SRD v1.0

---

## 1. 기술 스택 상세

### 1.1 프론트엔드

| 항목 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | Next.js | 14.x (App Router) | SPA, API Routes, Vercel 배포 최적화 |
| 언어 | TypeScript | 5.x | 타입 안전성 |
| UI | React 18 | - | 컴포넌트 |
| 스타일링 | Tailwind CSS | 3.x | 유틸리티 기반 스타일 |
| 테이블/폼 | TanStack Table (React Table) | 8.x | 편집 가능 테이블 |
| 파일 업로드 | react-dropzone | 14.x | 드래그앤드롭 |
| 엑셀 | SheetJS (xlsx) | 0.18.x | xlsx 생성/다운로드 |

### 1.2 백엔드 / 서비스

| 항목 | 기술 | 용도 |
|------|------|------|
| API | Next.js API Routes | 서버사이드 로직, API 키 보호 |
| AI | Anthropic Claude API | 스펙 변환, TC 생성, 이슈 보강 |
| DB | Supabase (PostgreSQL) | projects, specs, test_cases, issues |
| 외부 연동 | Notion API | 이슈 페이지 생성 |

### 1.3 인프라

| 항목 | 기술 | 용도 |
|------|------|------|
| 호스팅 | Vercel | Next.js 배포 |
| 파일 스토리지 | Supabase Storage (선택) | 스크린샷 업로드 (P3) |

---

## 2. 아키텍처

### 2.1 시스템 구성도

```
[사용자] ──> [Next.js App (Vercel)]
                │
                ├─> [Supabase] (DB)
                ├─> [Gemini API] (AI)
                └─> [Notion API] (이슈 전송)
```

### 2.2 디렉터리 구조 (권장)

```
tc-pilot/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # 메인 (탭 컨테이너)
│   ├── api/
│   │   ├── spec/route.ts      # 스펙 변환 API
│   │   ├── tc/route.ts       # TC 생성 API
│   │   ├── issue/route.ts    # 이슈 보강 API
│   │   └── notion/route.ts   # Notion 전송 API
│   └── globals.css
├── components/
│   ├── SpecTab.tsx           # 탭 1: 스펙 변환
│   ├── TCTab.tsx             # 탭 2: TC 목록 + 대시보드
│   ├── IssueLogTab.tsx       # 탭 3: 이슈 로그
│   ├── IssuePanel.tsx        # 이슈 등록 슬라이드 패널
│   ├── DashboardCards.tsx   # 진행현황 카드
│   └── EditableTable.tsx     # 편집 가능 테이블 (공통)
├── lib/
│   ├── supabase.ts          # Supabase 클라이언트
│   ├── claude.ts            # Claude API 래퍼
│   ├── notion.ts            # Notion API 래퍼
│   └── prompts.ts          # 시스템 프롬프트 (스펙/TC/이슈)
├── types/
│   └── index.ts             # Spec, TestCase, Issue 타입
├── docs/                     # PRD, SRD, TRD, 참고자료
├── .env.local                # 환경변수 (gitignore)
├── package.json
└── README.md
```

### 2.3 데이터 흐름

```
1. 파일 업로드
   Client ──(file)──> API /api/spec ──> Gemini ──> Supabase (specs)

2. TC 생성
   Client ──(specs)──> API /api/tc ──> Gemini ──> Supabase (test_cases)

3. P/F 변경
   Client ──(status)──> Supabase (test_cases update)

4. 이슈 등록
   Client ──(issue)──> API /api/issue (AI 보강) ──> API /api/notion ──> Notion API
                    ──> Supabase (issues)
```

---

## 3. API 명세

### 3.1 POST /api/spec

**요청:** `multipart/form-data` (file: File)

**처리:**
1. 파일 타입 분기 (PPT/MD/XLSX)
2. PPT: 이미지로 변환 후 Gemini 멀티모달 호출
3. MD/XLSX: 텍스트/데이터 추출 후 Gemini 호출
4. 표준 스펙 JSON 파싱
5. Supabase specs 테이블에 저장 (project_id 필요)

**응답:** `{ specs: Spec[] }`

### 3.2 POST /api/tc

**요청:** `{ projectId: string, specIds?: string[] }`

**처리:**
1. specs 조회 (또는 specIds로 필터)
2. Gemini에 스펙 + 시스템 프롬프트(8단계, 11개 엣지케이스) 전달
3. TC JSON 배열 파싱
4. Supabase test_cases 테이블에 저장

**응답:** `{ testCases: TestCase[] }`

### 3.3 POST /api/issue (AI 보강)

**요청:** `{ tcContext: TestCase, actualResult: string }`

**처리:**
1. Gemini에 TC 맥락 + 실제결과 전달
2. 보강된 재현순서/설명 JSON 반환

**응답:** `{ enhanced: { reproductionSteps, actual } }`

### 3.4 POST /api/notion

**요청:** `{ issue: Issue }`

**처리:**
1. Notion API POST /v1/pages 호출
2. 이슈 DB에 페이지 생성
3. 반환된 page_id를 Supabase issues.notion_page_id에 저장

**응답:** `{ notionPageId: string, notionPageUrl: string }`

---

## 4. AI 프롬프트 설계

### 4.1 스펙 변환 프롬프트 (요약)

- 입력: 기획서 파일 내용(이미지/텍스트)
- 출력: JSON 배열 `[{ screen_code, screen_name, path, screen_type, roles, conditions, format, interactions, notes }]`
- 제약: 화면코드는 3~5자 영문+숫자 (예: CS001, EX001)

### 4.2 TC 생성 프롬프트 (요약)

- 입력: 스펙 JSON 배열
- 출력: JSON 배열 `[{ tc_id, section, feature_group, screen_code, test_perspective, priority, title, preconditions, steps, expected_result }]`
- 시스템 규칙: 8단계 도출 순서, 11개 엣지케이스 점검, TC 품질 3원칙

### 4.3 이슈 보강 프롬프트 (요약)

- 입력: TC(테스트절차, 기대결과) + 사용자 실제결과
- 출력: `{ reproductionSteps, actual }` (이슈 등록용으로 다듬은 텍스트)

### 4.4 JSON 모드

- Gemini 호출 시 `response_mime_type: "application/json"` 사용
- 파싱 실패 시: `response_schema` 또는 fallback 파서 적용

---

## 5. Supabase 스키마 (SQL)

```sql
-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- specs
CREATE TABLE specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  screen_code TEXT,
  screen_name TEXT,
  path TEXT,
  screen_type TEXT,
  roles TEXT,
  conditions TEXT,
  format TEXT,
  interactions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- test_cases
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  spec_id UUID REFERENCES specs(id) ON DELETE SET NULL,
  tc_id TEXT NOT NULL,
  section TEXT,
  feature_group TEXT,
  screen_code TEXT,
  test_perspective TEXT,
  priority TEXT,
  title TEXT,
  preconditions TEXT,
  steps TEXT,
  expected_result TEXT,
  status TEXT DEFAULT '미확인',
  issue_memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- issues
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tc_id TEXT,
  title TEXT,
  severity TEXT,
  reproduction_steps TEXT,
  expected TEXT,
  actual TEXT,
  screenshot_url TEXT,
  notion_page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - MVP에서는 비활성화 가능
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

---

## 6. 환경변수

```env
# .env.local (gitignore 필수)

# Claude (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Notion
NOTION_API_KEY=your_notion_integration_token
NOTION_ISSUE_DATABASE_ID=your_database_id
```

---

## 7. 배포 (Vercel)

1. GitHub 연동
2. 환경변수 설정 (Vercel Dashboard)
3. `vercel` CLI 또는 Git push로 자동 배포
4. 프리티어: Hobby 플랜으로 충분

---

## 8. 개발 우선순위 (Day별)

| Day | TRD 대응 | 작업 |
|-----|----------|------|
| 1 | 2.2, 3.1, 5 | Next.js 프로젝트 생성, Supabase 스키마, /api/spec, SpecTab UI |
| 2 | 3.2, 4.2 | /api/tc, TC 생성, TCTab 테이블 렌더링 |
| 3 | 3.3, 3.4, F-004 | P/F 추적, IssuePanel, Notion 연동 |
| 4 | F-006, NFR | xlsx 다운로드, UI 폴리싱, 배포 |

---

## 9. 참고 링크

- [Claude API 문서](https://docs.anthropic.com/en/api/getting-started)
- [Notion API](https://developers.notion.com/)
- [Supabase 문서](https://supabase.com/docs)
- [SheetJS (xlsx)](https://sheetjs.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
