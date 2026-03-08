# TC Pilot — Software Requirements Document (SRD)

# 소프트웨어 요구사항 명세서

**버전:** v1.0  
**작성일:** 2026-03-08  
**작성자:** CTO (PRD 기반 검토)  
**기반 문서:** TC Pilot PRD v1.0

---

## 1. 문서 개요

### 1.1 목적

본 SRD는 TC Pilot PRD를 검토하고, 구현 가능한 수준의 소프트웨어 요구사항으로 정제한 문서이다. 개발팀 및 AI 코딩 에이전트가 기능을 구현할 때 참조하는 기준 명세이다.

### 1.2 PRD 검토 의견 (CTO 관점)

| 항목 | 검토 결과 | 비고 |
|------|-----------|------|
| 기획 목표 | ✅ 명확 | TC 생성→테스트→이슈 연계의 단절 해소가 핵심 가치 |
| 기술 스택 | ✅ 적정 | Cursor, Gemini, Supabase, Notion, Vercel 조합이 MVP에 적합 |
| 일정(20h) | ⚠️ 타이트 | Day 1~2 핵심 플로우 우선, Day 4 폴리싱은 최소화 권장 |
| MVP 범위 | ✅ 합리적 | Must Have 4개 항목으로 스코프 제한 적절 |
| 데이터 구조 | ✅ 일관됨 | projects → specs → test_cases → issues 관계 명확 |

**결론:** PRD 기획목표에 부합하며, SRD/TRD로 세부 요구사항을 보완하여 개발 진행 가능.

---

## 2. 기능 요구사항

### 2.1 F-001: 파일 업로드 및 스펙 구조화 변환

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-001-1 | PPT/PPTX, MD, XLSX 파일 드래그앤드롭 업로드 | P1 | |
| F-001-2 | 업로드된 파일을 AI(Gemini)로 분석하여 표준 스펙 JSON 변환 | P1 | 멀티모달(이미지+텍스트) 지원 |
| F-001-3 | 변환 결과를 편집 가능한 테이블로 표시 | P1 | |
| F-001-4 | 표준 스펙 필드: 화면코드, 화면명칭, 경로, 화면타입, 관련권한, 출력조건, 표시형식, 클릭동작, 비고 | P1 | |
| F-001-5 | [TC 생성하기] 버튼으로 다음 단계 진행 | P1 | |

### 2.2 F-002: TC 자동 생성

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-002-1 | 확인된 스펙을 입력으로 AI가 TC JSON 배열 생성 | P1 | |
| F-002-2 | TC 도출 8단계 프로세스 적용 (시스템 프롬프트) | P1 | |
| F-002-3 | 11개 엣지케이스 카테고리 점검 적용 | P1 | |
| F-002-4 | TC ID 형식: {화면코드}-{관점}-{순번} (예: CS001-N-001) | P1 | |
| F-002-5 | TC 컬럼: TC ID, 섹션, 기능그룹, 화면코드, 테스트관점, 우선순위, TC 제목, 사전조건, 테스트절차, 기대결과, P/F, 이슈메모 | P1 | |
| F-002-6 | 테스트 관점: N(정상), E(예외), A(권한), R(에러), D(데이터) | P1 | |
| F-002-7 | 생성된 TC를 테이블로 렌더링 | P1 | |

### 2.3 F-003: 테스트 실행 및 추적

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-003-1 | 각 TC의 P/F 상태를 드롭다운으로 변경 (PASS/FAIL/진행중/미확인) | P1 | |
| F-003-2 | 상단 대시보드 실시간 집계: 총 TC, PASS, FAIL, 진행중, 미확인, 완료율 | P1 | |
| F-003-3 | 섹션별(기능그룹별) 현황 표시 | P2 | |
| F-003-4 | 필터: 관점별, 기능그룹별 | P2 | |

### 2.4 F-004: FAIL → 이슈 등록

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-004-1 | TC에서 FAIL 선택 시 오른쪽 슬라이드 패널 열림 | P1 | |
| F-004-2 | TC 데이터 자동 매핑: 화면코드+TC제목→제목, 테스트절차→재현순서, 기대결과→기대결과, TC ID→관련TC | P1 | |
| F-004-3 | 사용자 입력: 실제결과(텍스트), 심각도(라디오: Critical/Major/Minor/Low) | P1 | |
| F-004-4 | [AI 보강] 버튼: 사용자 실제결과를 AI가 보강하여 이슈 등록용 텍스트 생성 | P2 | |
| F-004-5 | [Notion 등록] 버튼: 이슈를 Notion DB에 생성 | P1 | |
| F-004-6 | 스크린샷 첨부 | P3 | |

### 2.5 F-005: Notion 연동

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-005-1 | Notion API POST /v1/pages로 이슈 페이지 생성 | P1 | |
| F-005-2 | 이슈 DB 속성: 이슈 제목, 상태, 심각도, 화면코드, 재현순서, 기대결과, 실제결과, 관련TC, 등록일 | P1 | |
| F-005-3 | 전송 후 Notion 페이지 URL을 issues 테이블에 저장 | P1 | |
| F-005-4 | Notion 연동 실패 시 xlsx 다운로드 백업 안내 | P2 | |

### 2.6 F-006: 내보내기

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-006-1 | TC 목록 xlsx 다운로드 (HIPAS 양식, 구글시트 호환) | P1 | SheetJS 사용 |
| F-006-2 | 이슈 목록 xlsx 다운로드 | P2 | |

### 2.7 F-007: 화면 구성

| ID | 요구사항 | 우선순위 | 비고 |
|----|----------|----------|------|
| F-007-1 | 3탭 구조: 스펙 변환 \| TC 목록 \| 이슈 로그 | P1 | |
| F-007-2 | 상단 프로젝트명 표시 | P1 | |
| F-007-3 | 탭 1: 파일 업로드 영역 + 변환 결과 테이블 | P1 | |
| F-007-4 | 탭 2: 진행현황 카드 + 필터 + TC 테이블 + xlsx 다운로드 | P1 | |
| F-007-5 | 탭 3: 이슈 목록, Notion 전송 상태, 필터(심각도/상태) | P2 | |

---

## 3. 비기능 요구사항

### 3.1 NFR-001: 성능

| ID | 요구사항 |
|----|----------|
| NFR-001-1 | 파일 업로드 후 스펙 변환 응답 30초 이내 (로딩 인디케이터 필수) |
| NFR-001-2 | TC 생성 응답 60초 이내 |
| NFR-001-3 | P/F 변경 시 대시보드 즉시 반영 |

### 3.2 NFR-002: 안정성

| ID | 요구사항 |
|----|----------|
| NFR-002-1 | AI JSON 파싱 실패 시 fallback 파서 또는 재시도 안내 |
| NFR-002-2 | Notion API 실패 시 에러 메시지 및 xlsx 백업 안내 |

### 3.3 NFR-003: 사용성

| ID | 요구사항 |
|----|----------|
| NFR-003-1 | 데모 시나리오 3분 내 완료 가능 |
| NFR-003-2 | FAIL 클릭 → 이슈 패널 자동 채움 → Notion 등록까지 복사붙여넣기 0회 |

---

## 4. 데이터 요구사항

### 4.1 엔티티 관계

```
projects (1) ──< specs (N)
projects (1) ──< test_cases (N)
projects (1) ──< issues (N)
test_cases (1) ──< issues (N)  [tc_id 참조]
specs (1) ──< test_cases (N)  [spec_id 참조]
```

### 4.2 테이블 스키마 (Supabase)

**projects**
- id (uuid, PK), project_name (text), created_at (timestamptz)

**specs**
- id (uuid, PK), project_id (uuid, FK), screen_code (text), screen_name (text), path (text), screen_type (text), roles (text), conditions (text), format (text), interactions (text), notes (text)

**test_cases**
- id (uuid, PK), project_id (uuid, FK), spec_id (uuid, FK), tc_id (text), section (text), feature_group (text), screen_code (text), test_perspective (text), priority (text), title (text), preconditions (text), steps (text), expected_result (text), status (text), issue_memo (text)

**issues**
- id (uuid, PK), project_id (uuid, FK), tc_id (text), title (text), severity (text), reproduction_steps (text), expected (text), actual (text), screenshot_url (text), notion_page_id (text), created_at (timestamptz)

---

## 5. 인터페이스 요구사항

### 5.1 AI API (Gemini)

| 호출 시점 | 입력 | 출력 |
|-----------|------|------|
| 스펙 변환 | 파일(이미지/텍스트) | 표준 스펙 JSON 배열 |
| TC 생성 | 스펙 JSON | TC JSON 배열 |
| 이슈 보강 | TC 맥락 + 실제결과 | 보강된 이슈 JSON |

### 5.2 Notion API

| 동작 | 엔드포인트 | 용도 |
|------|------------|------|
| 페이지 생성 | POST /v1/pages | 이슈 DB에 새 페이지 추가 |

### 5.3 사용자 인터페이스

- 웹 SPA (Single Page Application)
- 3탭 네비게이션
- 드래그앤드롭 파일 업로드
- 편집 가능 테이블 (스펙, TC)
- 슬라이드 패널 (이슈 등록)

---

## 6. 제약사항 및 가정

### 6.1 제약사항

- 총 개발 시간 20시간 (4일×5시간)
- Gemini 3 Pro API 사용 (멀티모달, JSON 모드)
- Cursor 기반 개발
- 무료 티어 활용 (Supabase, Vercel)

### 6.2 가정

- Notion 워크스페이스 및 이슈 DB가 사전 생성됨
- Gemini API 키 환경변수로 제공됨
- MVP에서는 단일 프로젝트만 지원 (다중 프로젝트 제외)

---

## 7. 추적성 매트릭스

| PRD 섹션 | SRD 대응 |
|----------|----------|
| 2-1 Step 1 | F-001 |
| 2-1 Step 2 | F-002 |
| 2-1 Step 3 | F-003 |
| 2-1 Step 4 | F-004 |
| 2-1 Step 5 | F-005 |
| 2-2 내보내기 | F-006 |
| 3 화면 구성 | F-007 |
| 4 기술 요구사항 | TRD 참조 |
