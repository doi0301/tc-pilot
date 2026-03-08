# TC Pilot

기획서 파일을 업로드하면 테스트 케이스를 자동 생성하고, 테스트 실행부터 이슈 등록(Notion)까지 하나의 흐름으로 연결해주는 기획 테스트 도구입니다.

**Repository:** [https://github.com/doi0301/tc-pilot](https://github.com/doi0301/tc-pilot)

## 한 줄 정의

**파일 업로드 → 스펙 확인/수정 → TC 생성 → 테스트 실행(P/F) → 이슈 등록(Notion)**

## 문서 구조

| 문서 | 경로 | 용도 |
|------|------|------|
| PRD | `docs/prd/tc-pilot-prd-v1.0.md` | 제품 요구사항, 기획 목표 |
| SRD | `docs/tc-pilot-srd-v1.0.md` | 소프트웨어 기능/비기능 요구사항 |
| TRD | `docs/tc-pilot-trd-v1.0.md` | 기술 스택, 아키텍처, API 명세 |
| TASK | `docs/tc-pilot-task-v1.0.md` | 개발 태스크 분해 (Day 1~4) |
| Design System | `docs/design/tc-pilot-design-system-v1.0.md` | 컬러, 타이포, 컴포넌트 UI 가이드 |
| API 키 가이드 | `docs/API_KEYS_GUIDE.md` | Supabase, Claude, Notion API 키 발급 방법 |
| Vercel 배포 | `docs/deployment/Vercel-배포-가이드.md` | 배포 절차, 환경변수 설정 |
| 참고자료 | `docs/references/` | HIPAS, VOC 기획서 PDF |

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 에 API 키 등 입력
```

필수 환경변수 (발급 방법: `docs/API_KEYS_GUIDE.md` 참고):

- `ANTHROPIC_API_KEY` — Claude API
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
- `NOTION_API_KEY`, `NOTION_ISSUE_DATABASE_ID` — Notion 이슈 DB

### 3. Supabase 스키마 적용

`docs/supabase/schema.sql` 내용을 Supabase SQL Editor에서 실행합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3001 에서 확인합니다. (포트 3001 사용)

## Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 레포 연결
2. 환경변수 설정: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NOTION_API_KEY`, `NOTION_ISSUE_DATABASE_ID`
3. Deploy 클릭

자세한 절차: `docs/deployment/Vercel-배포-가이드.md`

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes
- **AI**: Anthropic Claude API
- **DB**: Supabase (PostgreSQL)
- **외부 연동**: Notion API
- **배포**: Vercel

## 바이브코딩 (Cursor AI)

- `.cursorrules` 에 프로젝트 컨텍스트가 정의되어 있습니다.
- 개발 시 `docs/PRD`, `docs/SRD`, `docs/TRD` 를 참조하세요.

## 개발 일정 (20h)

| Day | 목표 |
|-----|------|
| 1 | 파일 업로드 + 스펙 변환 |
| 2 | TC 생성 + 테이블 렌더링 |
| 3 | P/F 추적 + 이슈 등록 + Notion 연동 |
| 4 | xlsx 내보내기 + UI 폴리싱 + 배포 |

## 라이선스

Private (내부 프로젝트)
