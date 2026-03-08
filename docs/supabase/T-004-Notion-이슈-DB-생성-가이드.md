# T-004: Notion 이슈 DB 수동 생성 가이드

**예상 소요:** 0.3h  
**완료 조건:** `NOTION_ISSUE_DATABASE_ID` 확보, API로 페이지 생성 테스트 가능

---

## 1. Notion Integration 생성

1. [Notion Integrations](https://www.notion.so/my-integrations) 접속
2. **+ New integration** 클릭
3. 이름: `TC Pilot` (또는 원하는 이름)
4. **Associated workspace** 선택
5. **Submit** → **Internal Integration Secret** 복사
6. `.env.local`에 `NOTION_API_KEY=secret_...` 추가

---

## 2. 이슈용 데이터베이스 생성

1. Notion 워크스페이스에서 **새 페이지** 생성
2. `/table` 입력 → **Table - Inline** 선택
3. 데이터베이스 이름: `TC Pilot 이슈` (또는 원하는 이름)

---

## 3. 속성(Properties) 설정

다음 속성을 **정확한 타입과 이름**으로 추가/수정하세요.

| 속성 이름 | Notion 타입 | 용도 |
|-----------|-------------|------|
| **이름** (Name) | Title | 이슈 제목 (기본 제목 속성) |
| **상태** | Select | Open / In Progress / Done 등 |
| **심각도** | Select | Critical / Major / Minor / Low |
| **화면코드** | Text | 스펙 화면코드 (예: LGN01) |
| **재현순서** | Text (또는 Rich Text) | 테스트 절차 |
| **기대결과** | Text (또는 Rich Text) | 기대 결과 |
| **실제결과** | Text (또는 Rich Text) | 실제 결과 |
| **관련TC** | Text | TC ID (예: LGN01-N-001) |
| **등록일** | Date | 이슈 등록일 |

### Select 옵션 예시

**상태:**
- Open
- In Progress
- Done

**심각도:**
- Critical
- Major
- Minor
- Low

---

## 4. Integration 연결

1. 데이터베이스 페이지에서 **우측 상단 `...`** 클릭
2. **Connections** → **Connect to** → `TC Pilot` Integration 선택
3. 연결하지 않으면 API 접근 불가

---

## 5. Database ID 확보

1. 데이터베이스 페이지를 **브라우저에서** 열기
2. URL 확인:
   ```
   https://www.notion.so/workspace이름/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyy
   ```
3. `?` 앞의 **32자리 영숫자**가 Database ID
4. `.env.local`에 추가:
   ```
   NOTION_ISSUE_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**참고:** URL에 하이픈(-)이 있으면 제거한 32자만 사용합니다.

---

## 6. 테스트

`lib/notion.ts`와 `POST /api/notion` 구현 후, 이슈 등록 버튼으로 Notion에 페이지가 생성되는지 확인하세요.

---

## 7. "is not a property that exists" 오류 시

Notion DB의 속성 이름이 위 표와 **정확히** 일치해야 합니다. 영어 Notion 사용 시 기본 속성명이 다를 수 있습니다.

### 방법 1: 영어 속성명 사용

`.env.local`에 추가:
```
NOTION_USE_ENGLISH=true
```

이렇게 하면 `Name`, `Status`, `Severity`, `Screen code`, `Reproduction steps`, `Expected`, `Actual`, `Related TC`, `Date`를 사용합니다.

### 방법 2: 속성명 직접 지정

Notion DB에서 실제 속성 이름을 확인한 뒤, `.env.local`에 개별 지정:

```
NOTION_PROP_TITLE=Name
NOTION_PROP_STATUS=Status
NOTION_PROP_SEVERITY=Severity
NOTION_PROP_SCREEN_CODE=화면코드
NOTION_PROP_REPRO_STEPS=재현순서
NOTION_PROP_EXPECTED=기대결과
NOTION_PROP_ACTUAL=실제결과
NOTION_PROP_RELATED_TC=관련TC
NOTION_PROP_REG_DATE=등록일
```

### 방법 3: Notion DB 속성명 통일

Notion 이슈 DB에서 속성 이름을 위 표(이름, 상태, 심각도 등)와 **완전히 동일하게** 맞춰주세요.
