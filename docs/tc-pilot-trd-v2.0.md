# TC Pilot — Technical Requirements Document (TRD)

# 기술 요구사항 명세서

**버전:** v2.0
**작성일:** 2026-03-30
**기반 문서:** TC Pilot PRD v2.0, SRD v2.0
**이전 버전:** v1.0 (2026-03-08)

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| v1.0 | 2026-03-08 | 최초 작성 |
| v2.0 | 2026-03-30 | 1차 MVP 구현 완료 기준 반영. AI 엔진 Gemini → Claude 변경, 추가 구현 항목 반영 |

---

## 범례

| 아이콘 | 의미 |
|--------|------|
| ✅ | 1차 MVP에서 구현 완료 |
| 🆕 | 원래 계획에 없었으나 1차에서 추가 구현 |
| 🔜 | 2차 스프린트에서 구현/변경 예정 |

---

## 1. 기술 스택 상세 (실제 구현 기준)

### 1.1 프론트엔드

| 항목 | 기술 | 버전 | 구현 상태 |
|------|------|------|----------|
| 프레임워크 | Next.js | 14.x (App Router) | ✅ |
| 언어 | TypeScript | 5.x | ✅ |
| UI | React 18 | - | ✅ |
| 스타일링 | Tailwind CSS | 3.x | ✅ |
| 아이콘 | lucide-react | - | 🆕 |
| 파일 업로드 | react-dropzone | 14.x | ✅ |
| 엑셀 | SheetJS (xlsx) | 0.18.x | ✅ |
| PPT 파싱 | jszip | - | ✅ (Gemini 멀티모달 대신 사용) |

> **변경 사항:** TRD v1.0에서 TanStack Table(React Table)을 계획했으나, 커스텀 EditableTable 컴포넌트로 구현됨.

### 1.2 백엔드 / 서비스

| 항목 | 기술 | 구현 상태 | 비고 |
|------|------|----------|------|
| API | Next.js API Routes | ✅ | |
| AI | **Anthropic Claude API** | ✅ | v1.0에서 Gemini로 계획, Claude로 변경 |
| DB | Supabase (PostgreSQL) | ✅ | |
| 외부 연동 | Notion API | ✅ | |
| 파일 스토리지 | Supabase Storage | 🆕 | 스크린샷 업로드용 |

> **중요 변경:** AI 엔진이 Gemini 3 Pro API에서 **Anthropic Claude API**로 변경됨.
> 멀티모달 PPT 처리는 Gemini가 아닌 jszip으로 텍스트 추출 후 Claude에 전달하는 방식으로 구현됨.

### 1.3 인프라

| 항목 | 기술 | 구현 상태 |
|------|------|----------|
| 호스팅 | Vercel | ✅ |
| 파일 스토리지 | Supabase Storage | 🆕 (스크린샷) |

---

## 2. 아키텍처

### 2.1 시스템 구성도 (실제 구현)

```
[사용자] ──> [Next.js App (Vercel)]
                │
                ├─> [Supabase] (DB + Storage)
                ├─> [Anthropic Claude API] (AI) ← v1.0에서 Gemini에서 변경
                └─> [Notion API] (이슈 전송)
```

### 2.2 디렉터리 구조 (실제 구현 기준)

```
tc-pilot/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 메인 (탭 컨테이너, 워크플로우 스텝)
│   ├── api/
│   │   ├── spec/route.ts           # 스펙 변환 API ✅
│   │   ├── tc/
│   │   │   ├── route.ts            # TC 생성/조회 API ✅
│   │   │   ├── [id]/route.ts       # TC 개별 수정 ✅
│   │   │   ├── batches/route.ts    # TC 배치 목록 🆕
│   │   │   ├── export-csv/route.ts # TC CSV 내보내기 🆕
│   │   │   └── import/route.ts     # TC 가져오기 🆕
│   │   ├── issue/route.ts          # 이슈 AI 보강 ✅
│   │   ├── issues/route.ts         # 이슈 목록 조회 ✅
│   │   ├── notion/route.ts         # Notion 전송 ✅
│   │   ├── projects/
│   │   │   └── ensure-default/route.ts  # 기본 프로젝트 보장 ✅
│   │   ├── upload/route.ts         # 파일 업로드 🆕
│   │   └── admin/
│   │       ├── login/route.ts      # 관리자 로그인 🆕
│   │       ├── logout/route.ts     # 관리자 로그아웃 🆕
│   │       ├── session/route.ts    # 세션 확인 🆕
│   │       └── screenshot/route.ts # 스크린샷 업로드 🆕
│   └── globals.css
├── components/
│   ├── SpecTab.tsx                 # 탭 1: 스펙 변환 ✅
│   ├── TCTab.tsx                   # 탭 2: TC 목록 + 대시보드 ✅
│   ├── IssueLogTab.tsx             # 탭 3: 이슈 로그 ✅
│   ├── IssuePanel.tsx              # 이슈 등록 슬라이드 패널 ✅
│   ├── DashboardCards.tsx          # 진행현황 카드 ✅
│   ├── EditableTable.tsx           # 편집 가능 테이블 (공통) ✅
│   ├── AdminAuthProvider.tsx       # 전역 인증 컨텍스트 🆕
│   ├── AdminLoginModal.tsx         # 관리자 로그인 모달 🆕
│   ├── LoginRequiredModal.tsx      # 비관리자 접근 안내 모달 🆕
│   └── Modal.tsx                   # 공통 모달 🆕
├── hooks/
│   └── useAdminAuth.ts             # 인증 상태 훅 🆕
├── lib/
│   ├── supabase.ts                 # Supabase 클라이언트 ✅
│   ├── claude.ts                   # Claude API 래퍼 ✅ (v1.0: gemini.ts)
│   ├── notion.ts                   # Notion API 래퍼 ✅
│   └── prompts.ts                  # 시스템 프롬프트 (스펙/TC/이슈) ✅
├── types/
│   └── index.ts                    # Spec, TestCase, Issue, Batch 타입 ✅
├── docs/                           # PRD, SRD, TRD, 참고자료
├── .env.local
├── package.json
└── README.md
```

### 2.3 데이터 흐름 (실제 구현)

```
1. 파일 업로드 (✅)
   Client ──(file)──> API /api/spec ──> Claude ──> Supabase (specs)

2. TC 생성 (✅)
   Client ──(specs)──> API /api/tc ──> Claude ──> Supabase (test_cases + tc_batches)

3. P/F 변경 (✅)
   Client ──(status)──> Supabase (test_cases update)

4. 이슈 등록 (✅)
   Client ──(issue)──> API /api/issue (AI 보강) ──> API /api/notion ──> Notion API
                    ──> Supabase (issues)

5. 스크린샷 업로드 (🆕)
   Client ──(file)──> API /api/admin/screenshot ──> Supabase Storage
```

---

## 3. API 명세 (실제 구현 기준)

### 3.1 POST /api/spec ✅

**요청:** `multipart/form-data` (file: File, parseOnly?: boolean)

**처리:**
1. 파일 타입 분기 (PPT/MD/XLSX)
2. PPT: jszip으로 XML 추출 후 텍스트 파싱 → Claude 호출
3. MD/XLSX: 텍스트/데이터 추출 후 Claude 호출
4. 표준 스펙 JSON 파싱 (fallback 파서 적용)
5. parseOnly=true: Supabase 저장 없이 결과만 반환 🆕
6. Supabase specs 테이블에 저장

**응답:** `{ specs: Spec[] }`

### 3.2 POST /api/tc ✅

**요청:** `{ projectId: string, specIds?: string[] }`

**처리:**
1. specs 조회
2. Claude에 스펙 + 시스템 프롬프트(8단계, 11개 엣지케이스) 전달
3. TC JSON 배열 파싱 (fallback 파서 + rate-limit 처리)
4. Supabase test_cases 테이블에 저장
5. tc_batches 테이블에 배치 이력 저장 🆕

**응답:** `{ testCases: TestCase[], batchId: string }`

### 3.3 POST /api/issue (AI 보강) ✅

**요청:** `{ tcContext: TestCase, actualResult: string }`

**처리:**
1. Claude에 TC 맥락 + 실제결과 전달
2. 보강된 재현순서/설명 JSON 반환

**응답:** `{ enhanced: { reproductionSteps, actual } }`

### 3.4 POST /api/notion ✅

**요청:** `{ issue: Issue }`

**처리:**
1. Notion API POST /v1/pages 호출
2. 이슈 DB에 페이지 생성
3. 반환된 page_id를 Supabase issues.notion_page_id에 저장

**응답:** `{ notionPageId: string, notionPageUrl: string }`

### 3.5 관리자 인증 API 🆕

| 경로 | 처리 |
|------|------|
| POST /api/admin/login | 이메일/비밀번호 검증 → HttpOnly 세션 쿠키 발급 |
| POST /api/admin/logout | 세션 쿠키 삭제 |
| GET /api/admin/session | 세션 쿠키 확인 → `{ isAdmin: boolean }` |
| POST /api/admin/screenshot | 이미지 → Supabase Storage 업로드 → URL 반환 |

---

## 4. AI 프롬프트 설계 (실제 구현 기준)

> **변경:** TRD v1.0의 Gemini JSON 모드(`response_mime_type`) → Claude API의 JSON 출력 지시 방식으로 변경

### 4.1 스펙 변환 프롬프트 ✅

- 입력: 기획서 파일 내용(텍스트)
- 출력: JSON 배열 `[{ screen_code, screen_name, path, screen_type, roles, conditions, format, interactions, notes }]`
- Claude에 JSON 형식 출력 명시 지시 + fallback 파서

### 4.2 TC 생성 프롬프트 ✅

- 입력: 스펙 JSON 배열
- 출력: JSON 배열 `[{ tc_id, section, feature_group, screen_code, test_perspective, priority, title, preconditions, steps, expected_result }]`
- 시스템 규칙: 8단계 도출 순서, 11개 엣지케이스 점검, TC 품질 3원칙
- Rate-limit 대응: 재시도 로직 + 응답 안정성 처리 🆕

### 4.3 이슈 보강 프롬프트 ✅

- 입력: TC(테스트절차, 기대결과) + 사용자 실제결과
- 출력: `{ reproductionSteps, actual }` (이슈 등록용으로 다듬은 텍스트)

### 4.4 파싱 안정성 ✅

- Claude 응답에서 JSON 블록 추출 (```json ... ``` 코드 블록 파싱)
- 파싱 실패 시 fallback 파서 (정규식 기반 배열 추출)
- 재시도 안내 UI

---

## 5. Supabase 스키마 (실제 구현 기준)

```sql
-- projects ✅
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- specs ✅
CREATE TABLE specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  screen_code TEXT, screen_name TEXT, path TEXT, screen_type TEXT,
  roles TEXT, conditions TEXT, format TEXT, interactions TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tc_batches 🆕 (TC 생성 배치 이력)
CREATE TABLE tc_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  spec_ids TEXT[],
  tc_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- test_cases ✅ (batch_id 컬럼 추가됨)
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  spec_id UUID REFERENCES specs(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES tc_batches(id) ON DELETE SET NULL,  -- 🆕
  tc_id TEXT NOT NULL,
  section TEXT, feature_group TEXT, screen_code TEXT,
  test_perspective TEXT, priority TEXT, title TEXT,
  preconditions TEXT, steps TEXT, expected_result TEXT,
  status TEXT DEFAULT '미확인', issue_memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- issues ✅
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tc_id TEXT, title TEXT, severity TEXT,
  reproduction_steps TEXT, expected TEXT, actual TEXT,
  screenshot_url TEXT, notion_page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase Storage: issue-screenshots 버킷 🆕
-- RLS: 현재 비활성화 상태 (차기 스프린트에서 활성화 예정)
```

---

## 6. 환경변수 (실제 구현 기준)

```env
# .env.local

# Anthropic Claude (v1.0에서 Gemini → 변경)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Notion
NOTION_API_KEY=your_notion_integration_token
NOTION_ISSUE_DATABASE_ID=your_database_id

# 관리자 인증 (🆕 추가)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_SESSION_SECRET=your_session_secret
```

---

## 7. 배포 (Vercel) ✅

1. GitHub 연동 완료
2. 환경변수 Vercel Dashboard에 설정 완료
3. Git push → 자동 배포
4. Hobby 플랜으로 운영 중

---

## 8. 차기 스프린트 기술 과제

| 과제 | 설명 | 우선순위 |
|------|------|----------|
| Supabase RLS 활성화 | 현재 보안 미적용 상태, Row Level Security 정책 설계 필요 | P1 |
| 다중 프로젝트 UI | DB 구조(project_id)는 준비됨, 프로젝트 선택/생성 UI 구현 | P1 |
| TC 인라인 편집 | test_cases PATCH API 존재, 프론트 EditableTable 연동 필요 | P2 |
| 관리자 인증 강화 | 환경변수 기반 → Supabase Auth 또는 NextAuth 마이그레이션 | P2 |
| Notion 상태 동기화 | 이슈 상태 변경 시 Notion 페이지 PATCH | P2 |
| 이슈 상태 관리 UI | IssueLogTab에서 상태 변경 기능 | P2 |

---

## 9. 참고 링크

- [Claude API 문서](https://docs.anthropic.com/en/api/getting-started)
- [Notion API](https://developers.notion.com/)
- [Supabase 문서](https://supabase.com/docs)
- [SheetJS (xlsx)](https://sheetjs.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
