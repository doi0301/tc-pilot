# T-037: Vercel 배포 가이드

**예상 소요:** 0.5h  
**완료 조건:** Vercel URL에서 앱 접근 가능

---

## 1. 사전 준비

- [ ] GitHub에 코드 푸시 완료
- [ ] Supabase 프로젝트 생성 및 스키마 적용
- [ ] `.env.local`에서 로컬 동작 확인

---

## 2. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com) 접속 후 로그인 (GitHub 계정 연동 권장)
2. **Add New** → **Project** 클릭
3. **Import Git Repository**에서 `tc-pilot` 선택
4. **Import** 클릭

---

## 3. 환경변수 설정

**Configure Project** 화면에서 **Environment Variables** 섹션으로 이동 후 아래 변수 추가:

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API 키 (필수) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon public key |
| `NOTION_API_KEY` | `secret_...` 또는 `ntn_...` | Notion Integration (이슈 등록 시 필수) |
| `NOTION_ISSUE_DATABASE_ID` | 32자리 ID | Notion 이슈 DB ID |
| `NOTION_USE_ENGLISH` | `true` | (선택) 영어 Notion 속성명 사용 시 |

**참고:**
- `.env.local`의 값을 그대로 복사해 사용
- Notion 미설정 시: `NOTION_API_KEY`, `NOTION_ISSUE_DATABASE_ID` 생략 가능 (이슈 등록 기능만 비활성)
- `NEXT_PUBLIC_` 접두사 변수는 **프리뷰/프로덕션** 모두에 적용

---

## 4. 배포 실행

1. **Deploy** 클릭
2. 빌드 완료까지 2~3분 소요
3. **Visit** 클릭하여 배포 URL 확인

예: `https://tc-project-xxx.vercel.app`

---

## 5. 배포 후 확인

1. **스펙 변환**: 파일 업로드 → 스펙 변환 → TC 생성
2. **TC 목록**: P/F 체크, xlsx 다운로드
3. **이슈 로그**: 탭 전환 확인

---

## 6. 트러블슈팅

### 빌드 실패

- `npm run build` 로컬에서 실행해 에러 확인
- Node.js 버전: Vercel 기본 18.x 사용

### API 오류 (500)

- Vercel 대시보드 → **Settings** → **Environment Variables**에서 값 재확인
- Supabase RLS: `docs/supabase/schema.sql` 기준 RLS 비활성 상태인지 확인

### CORS / 네트워크

- Next.js API Routes는 동일 도메인에서 호출되므로 CORS 이슈 없음
