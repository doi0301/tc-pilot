# TC Pilot — API 키 발급 및 설정 가이드

각 서비스별로 API 키를 어디서 확인·발급하는지 구체적으로 안내합니다.

---

## 1. Supabase (URL & Anon Key)

### 확인 위치

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **프로젝트 선택** (또는 새 프로젝트 생성)
3. 좌측 메뉴 **Project Settings** (톱니바퀴 아이콘) 클릭
4. **API** 탭 선택
5. 아래 항목 확인:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 입력
   - **Project API keys** > **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력

![Supabase API 위치](https://supabase.com/docs/img/api-keys.png)

### 기존 프로젝트 vs 신규 프로젝트

| 상황 | URL / Anon Key |
|------|----------------|
| **다른 프로젝트에 연결된 키** | 그 키는 **해당 프로젝트의 DB**에만 연결됩니다. TC Pilot 전용 테이블(projects, specs, test_cases, issues)을 쓰려면 **TC Pilot 전용 Supabase 프로젝트**를 새로 만드는 것을 권장합니다. |
| **같은 DB를 여러 앱에서 공유** | 기존 프로젝트의 URL + anon key를 그대로 사용해도 됩니다. 단, `docs/supabase/schema.sql`로 테이블을 추가해야 합니다. |
| **TC Pilot만 단독 사용** | **신규 프로젝트 생성** → 새 URL, 새 anon key 발급 |

**결론:** TC Pilot 전용 DB가 필요하면 **신규 Supabase 프로젝트**를 만들고, 그 프로젝트의 URL과 anon key를 사용하세요.

---

## 2. Claude API (Anthropic)

### 발급 위치

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 로그인 후 **Settings** → **API Keys** (또는 [직접 링크](https://console.anthropic.com/settings/keys))
3. **Create Key** 클릭
4. 키 이름 입력 후 생성
5. 생성된 키를 **한 번만** 복사 (다시 보이지 않음)
6. `.env.local`의 `ANTHROPIC_API_KEY`에 붙여넣기

**참고:** [Anthropic API 문서](https://docs.anthropic.com/en/api/getting-started)

---

## 3. Notion API

### 발급 위치

1. [Notion Integrations](https://www.notion.so/my-integrations) 접속
2. **+ New integration** 클릭
3. 이름 입력 (예: TC Pilot)
4. **Associated workspace**에서 사용할 워크스페이스 선택
5. **Submit** 클릭
6. **Internal Integration Secret** (`secret_`로 시작) 복사 → `NOTION_API_KEY`에 입력

### Database ID 확인

1. Notion에서 **이슈용 데이터베이스** 생성 (Table 형태)
2. 데이터베이스 페이지를 **브라우저에서** 열기
3. URL 확인:
   ```
   https://www.notion.so/workspace이름/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyy
   ```
4. `?` 앞의 **32자리 영숫자** (`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)가 Database ID
5. `.env.local`의 `NOTION_ISSUE_DATABASE_ID`에 입력

### 중요: 데이터베이스에 Integration 연결

1. Notion 데이터베이스 페이지에서 **우측 상단 `...`** 클릭
2. **Connections** → **Connect to** → 방금 만든 Integration 선택
3. 연결하지 않으면 API로 접근할 수 없습니다.

---

## 4. 환경변수 요약 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Notion
NOTION_API_KEY=secret_...
NOTION_ISSUE_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 5. 빠른 링크

| 서비스 | 발급/확인 링크 |
|--------|----------------|
| Supabase Dashboard | https://supabase.com/dashboard |
| Supabase API 설정 | Project Settings → API |
| Anthropic API Keys | https://console.anthropic.com/settings/keys |
| Notion Integrations | https://www.notion.so/my-integrations |
