# TC Pilot — Software Requirements Document (SRD)

# 소프트웨어 요구사항 명세서

**버전:** v2.0
**작성일:** 2026-03-30
**기반 문서:** TC Pilot PRD v2.0
**이전 버전:** v1.0 (2026-03-08)

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| v1.0 | 2026-03-08 | 최초 작성 |
| v2.0 | 2026-03-30 | 1차 MVP 구현 완료 기준 반영. 구현완료/추가구현/차기스프린트 구분 |

---

## 범례

| 아이콘 | 의미 |
|--------|------|
| ✅ | 1차 MVP에서 구현 완료 |
| 🆕 | 원래 계획에 없었으나 1차에서 추가 구현 |
| 🔜 | 2차 스프린트에서 구현 예정 |

---

## 1. 문서 개요

### 1.1 목적

본 SRD v2.0은 TC Pilot 1차 MVP 구현 완료를 기준으로, 실제 구현된 기능과 차기 스프린트 계획을 명확히 구분한 기준 명세이다. 2차 개선 기획 및 개발 시 참조 문서로 사용된다.

### 1.2 1차 MVP 구현 평가

| 항목 | 계획 대비 | 비고 |
|------|-----------|------|
| 핵심 5단계 플로우 | ✅ 완전 구현 | 파일업로드→스펙→TC→P/F→Notion |
| Must Have 항목 | ✅ 전체 완료 | 4개 항목 모두 구현 |
| Should Have 항목 | ✅ 전체 완료 | AI 보강, 필터, 이슈 로그 탭 |
| Could Have 항목 | 스크린샷 ✅, 프로젝트관리 🔜 | 스크린샷은 구현, 다중 프로젝트 미구현 |
| 계획 외 추가 구현 | 🆕 관리자 인증, TC 배치, CSV 내보내기 | |
| AI 엔진 | Gemini → Claude 변경 | Anthropic Claude API로 전환 |

---

## 2. 기능 요구사항

### 2.1 F-001: 파일 업로드 및 스펙 구조화 변환 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-001-1 | PPT/PPTX, MD, XLSX 파일 드래그앤드롭 업로드 | P1 | ✅ | react-dropzone |
| F-001-2 | 업로드된 파일을 AI로 분석하여 표준 스펙 JSON 변환 | P1 | ✅ | Claude API, jszip(PPT), SheetJS(XLSX) |
| F-001-3 | 변환 결과를 편집 가능한 테이블로 표시 | P1 | ✅ | EditableTable 공통 컴포넌트 |
| F-001-4 | 표준 스펙 필드 9개 (화면코드, 화면명칭, 경로, 화면타입, 관련권한, 출력조건, 표시형식, 클릭동작, 비고) | P1 | ✅ | |
| F-001-5 | [TC 생성하기] 버튼으로 다음 단계 진행 | P1 | ✅ | |
| F-001-6 🆕 | parseOnly 모드 (AI 파싱만 수행, DB 저장 없이 결과 확인) | P2 | 🆕 | 체크박스 UI |

### 2.2 F-002: TC 자동 생성 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-002-1 | 확인된 스펙을 입력으로 AI가 TC JSON 배열 생성 | P1 | ✅ | Claude API |
| F-002-2 | TC 도출 8단계 프로세스 적용 (시스템 프롬프트) | P1 | ✅ | lib/prompts.ts |
| F-002-3 | 11개 엣지케이스 카테고리 점검 적용 | P1 | ✅ | |
| F-002-4 | TC ID 형식: {화면코드}-{관점}-{순번} | P1 | ✅ | |
| F-002-5 | TC 컬럼 12개 (TC ID, 섹션, 기능그룹, 화면코드, 테스트관점, 우선순위, TC 제목, 사전조건, 테스트절차, 기대결과, P/F, 이슈메모) | P1 | ✅ | |
| F-002-6 | 테스트 관점: N/E/A/R/D | P1 | ✅ | |
| F-002-7 | 생성된 TC를 테이블로 렌더링 | P1 | ✅ | |
| F-002-8 🆕 | TC 배치 히스토리 관리 | P2 | 🆕 | tc_batches 테이블, 1depth 목록 + 2depth 상세 |
| F-002-9 | AI JSON 파싱 실패 시 fallback 파서 | P1 | ✅ | |
| F-002-10 | AI Rate-limit 및 응답 안정성 처리 | P1 | ✅ | |
| F-002-11 🔜 | TC 인라인 편집 (제목, 절차, 기대결과 수정) | P2 | 🔜 | 차기 스프린트 |
| F-002-12 🔜 | TC 수동 추가 (빈 행 삽입) | P3 | 🔜 | 차기 스프린트 |
| F-002-13 🔜 | TC 개별 삭제 | P3 | 🔜 | 차기 스프린트 |

### 2.3 F-003: 테스트 실행 및 추적 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-003-1 | 각 TC의 P/F 상태를 드롭다운으로 변경 (PASS/FAIL/진행중/미확인) | P1 | ✅ | |
| F-003-2 | 상단 대시보드 실시간 집계: 총 TC, PASS, FAIL, 진행중, 미확인, 완료율 | P1 | ✅ | DashboardCards 컴포넌트 |
| F-003-3 | 섹션별(기능그룹별) 현황 표시 | P2 | ✅ | |
| F-003-4 | 필터: 관점별, 기능그룹별 | P2 | ✅ | |
| F-003-5 🆕 | 우선순위 툴팁 (P1~P4 기준 설명) | P3 | 🆕 | |
| F-003-6 🔜 | 기능그룹별 PASS/FAIL 차트 | P2 | 🔜 | 차기 스프린트 |

### 2.4 F-004: FAIL → 이슈 등록 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-004-1 | TC에서 FAIL 선택 시 오른쪽 슬라이드 패널 열림 | P1 | ✅ | IssuePanel 컴포넌트 |
| F-004-2 | TC 데이터 자동 매핑 (화면코드+제목→제목, 절차→재현순서, 기대결과, TC ID) | P1 | ✅ | |
| F-004-3 | 사용자 입력: 실제결과(텍스트), 심각도(라디오: Critical/Major/Minor/Low) | P1 | ✅ | |
| F-004-4 | [AI 보강] 버튼: 실제결과를 AI가 보강하여 이슈 등록용 텍스트 생성 | P2 | ✅ | |
| F-004-5 | [Notion 등록] 버튼: 이슈를 Notion DB에 생성 | P1 | ✅ | |
| F-004-6 | 스크린샷 첨부 | P3 | ✅ | Supabase Storage 연동 |

### 2.5 F-005: Notion 연동 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-005-1 | Notion API POST /v1/pages로 이슈 페이지 생성 | P1 | ✅ | lib/notion.ts |
| F-005-2 | 이슈 DB 속성 매핑 (이슈 제목, 상태, 심각도, 화면코드, 재현순서, 기대결과, 실제결과, 관련TC, 등록일) | P1 | ✅ | |
| F-005-3 | 전송 후 Notion 페이지 URL을 issues 테이블에 저장 | P1 | ✅ | notion_page_id 컬럼 |
| F-005-4 | Notion 연동 실패 시 에러 메시지 및 xlsx 백업 안내 | P2 | ✅ | |
| F-005-5 🔜 | 웹앱에서 이슈 상태 변경 시 Notion 상태 동기화 | P2 | 🔜 | 차기 스프린트 |

### 2.6 F-006: 내보내기 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-006-1 | TC 목록 xlsx 다운로드 (HIPAS 양식, 구글시트 호환) | P1 | ✅ | SheetJS |
| F-006-2 | 이슈 목록 xlsx 다운로드 | P2 | ✅ | |
| F-006-3 🆕 | TC CSV 내보내기 (Google Sheets 호환) | P2 | 🆕 | /api/tc/export-csv |

### 2.7 F-007: 화면 구성 ✅ 전체 구현완료

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-007-1 | 3탭 구조: 업로드 \| TC/테스트 \| 이슈 로그 | P1 | ✅ | |
| F-007-2 | 상단 프로젝트명 표시 | P1 | ✅ | |
| F-007-3 | 탭 1: 파일 업로드 영역 + 변환 결과 테이블 | P1 | ✅ | SpecTab |
| F-007-4 | 탭 2: 진행현황 카드 + 필터 + TC 테이블 + xlsx 다운로드 | P1 | ✅ | TCTab |
| F-007-5 | 탭 3: 이슈 목록, Notion 전송 상태, 필터(심각도/상태) | P2 | ✅ | IssueLogTab |
| F-007-6 🆕 | 워크플로우 스텝 표시 (상단 진행 단계 안내) | P2 | 🆕 | |
| F-007-7 🆕 | 다크 헤더 + 관리자 배지 UI | P2 | 🆕 | |

### 2.8 F-008: 관리자 인증 🆕 추가구현

계획에 없었으나 1차에서 구현됨. 공유 환경에서 무분별한 데이터 수정을 방지하기 위해 추가.

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-008-1 | 관리자 로그인 (이메일/비밀번호, 세션 쿠키 기반) | P1 | 🆕 | /api/admin/login |
| F-008-2 | 관리자 로그아웃 | P1 | 🆕 | /api/admin/logout |
| F-008-3 | 세션 상태 확인 | P1 | 🆕 | /api/admin/session |
| F-008-4 | 비관리자 사용자 읽기 전용 제한 | P1 | 🆕 | LoginRequiredModal 표시 |
| F-008-5 | AdminAuthProvider (전역 인증 컨텍스트) | P1 | 🆕 | useAdminAuth 훅 |
| F-008-6 🔜 | 사용자별 프로젝트 접근 권한 분리 | P2 | 🔜 | 차기 스프린트 |

### 2.9 F-009: 프로젝트 관리 (차기 스프린트)

현재 단일 기본 프로젝트(ensure-default)만 지원. 다중 프로젝트 관리는 2차 개선 대상.

| ID | 요구사항 | 우선순위 | 상태 | 비고 |
|----|----------|----------|------|------|
| F-009-1 🔜 | 프로젝트 목록 화면 (이름, TC 수, 마지막 수정일) | P1 | 🔜 | |
| F-009-2 🔜 | 신규 프로젝트 생성 | P1 | 🔜 | |
| F-009-3 🔜 | 프로젝트 전환 (현재 작업 프로젝트 변경) | P1 | 🔜 | |
| F-009-4 🔜 | 프로젝트 삭제 | P2 | 🔜 | CASCADE 삭제 |
| F-009-5 🔜 | 프로젝트별 독립된 스펙/TC/이슈 데이터 | P1 | 🔜 | 현재도 project_id 컬럼 존재, UI만 없음 |

---

## 3. 비기능 요구사항

### 3.1 NFR-001: 성능

| ID | 요구사항 | 상태 |
|----|----------|------|
| NFR-001-1 | 파일 업로드 후 스펙 변환 응답 30초 이내 (로딩 인디케이터 필수) | ✅ |
| NFR-001-2 | TC 생성 응답 60초 이내 | ✅ |
| NFR-001-3 | P/F 변경 시 대시보드 즉시 반영 | ✅ |

### 3.2 NFR-002: 안정성

| ID | 요구사항 | 상태 |
|----|----------|------|
| NFR-002-1 | AI JSON 파싱 실패 시 fallback 파서 또는 재시도 안내 | ✅ |
| NFR-002-2 | Notion API 실패 시 에러 메시지 및 xlsx 백업 안내 | ✅ |
| NFR-002-3 | AI Rate-limit 처리 (재시도 로직) | ✅ |

### 3.3 NFR-003: 사용성

| ID | 요구사항 | 상태 |
|----|----------|------|
| NFR-003-1 | 데모 시나리오 3분 내 완료 가능 | ✅ |
| NFR-003-2 | FAIL 클릭 → 이슈 패널 자동 채움 → Notion 등록까지 복사붙여넣기 0회 | ✅ |

### 3.4 NFR-004: 보안 (차기 스프린트)

| ID | 요구사항 | 상태 |
|----|----------|------|
| NFR-004-1 🔜 | Supabase RLS (Row Level Security) 활성화 | 🔜 현재 비활성화 |
| NFR-004-2 🔜 | 환경변수 기반 관리자 자격증명 → Supabase Auth 마이그레이션 | 🔜 |

---

## 4. 데이터 요구사항

### 4.1 엔티티 관계

```
projects (1) ──< specs (N)
projects (1) ──< test_cases (N)
projects (1) ──< issues (N)
projects (1) ──< tc_batches (N)       🆕 추가
test_cases (1) ──< issues (N)  [tc_id 참조]
specs (1) ──< test_cases (N)  [spec_id 참조]
tc_batches (1) ──< test_cases (N)     🆕 추가
```

### 4.2 테이블 스키마 (실제 구현 기준)

**projects**
- id (uuid, PK), project_name (text), created_at (timestamptz)

**specs**
- id (uuid, PK), project_id (uuid, FK), screen_code, screen_name, path, screen_type, roles, conditions, format, interactions, notes

**test_cases**
- id (uuid, PK), project_id (uuid, FK), spec_id (uuid, FK), **batch_id (uuid, FK)** 🆕, tc_id, section, feature_group, screen_code, test_perspective, priority, title, preconditions, steps, expected_result, status, issue_memo

**issues**
- id (uuid, PK), project_id (uuid, FK), tc_id, title, severity, reproduction_steps, expected, actual, screenshot_url, notion_page_id, created_at

**tc_batches** 🆕 추가
- id (uuid, PK), project_id (uuid, FK), created_at, spec_ids (text[]), tc_count (int)

---

## 5. 인터페이스 요구사항

### 5.1 AI API (Anthropic Claude)

| 호출 시점 | 입력 | 출력 | 상태 |
|-----------|------|------|------|
| 스펙 변환 | 파일(이미지/텍스트) | 표준 스펙 JSON 배열 | ✅ |
| TC 생성 | 스펙 JSON | TC JSON 배열 | ✅ |
| 이슈 보강 | TC 맥락 + 실제결과 | 보강된 이슈 JSON | ✅ |

### 5.2 Notion API

| 동작 | 엔드포인트 | 상태 |
|------|------------|------|
| 페이지 생성 | POST /v1/pages | ✅ |
| 상태 업데이트 🔜 | PATCH /v1/pages/:id | 🔜 차기 |

### 5.3 API Routes (실제 구현 기준)

| 경로 | 메서드 | 설명 | 상태 |
|------|--------|------|------|
| /api/spec | POST | 파일 업로드 → 스펙 변환 | ✅ |
| /api/tc | POST | TC 생성 | ✅ |
| /api/tc | GET | TC 목록 조회 | ✅ |
| /api/tc/[id] | GET/PATCH | TC 개별 조회/수정 | ✅ |
| /api/tc/batches | GET | TC 배치 목록 | 🆕 |
| /api/tc/export-csv | GET | TC CSV 내보내기 | 🆕 |
| /api/tc/import | POST | TC 가져오기 | 🆕 |
| /api/issue | POST | 이슈 AI 보강 | ✅ |
| /api/issues | GET | 이슈 목록 조회 | ✅ |
| /api/notion | POST | Notion 이슈 전송 | ✅ |
| /api/projects/ensure-default | GET | 기본 프로젝트 보장 | ✅ |
| /api/upload | POST | 파일 업로드 (스토리지) | 🆕 |
| /api/admin/login | POST | 관리자 로그인 | 🆕 |
| /api/admin/logout | POST | 관리자 로그아웃 | 🆕 |
| /api/admin/session | GET | 세션 확인 | 🆕 |
| /api/admin/screenshot | POST | 스크린샷 업로드 | 🆕 |

---

## 6. 제약사항 및 가정

### 6.1 1차 MVP 완료 기준 제약사항

- 단일 프로젝트만 지원 (다중 프로젝트는 차기 스프린트)
- 관리자 자격증명이 환경변수로 관리됨 (Supabase Auth 미사용)
- Supabase RLS 비활성화 상태

### 6.2 차기 스프린트 해소 대상 제약

| 제약 | 해소 방안 |
|------|-----------|
| 단일 프로젝트 | F-009 다중 프로젝트 관리 구현 |
| 환경변수 인증 | Supabase Auth 또는 NextAuth 마이그레이션 |
| Supabase RLS 미적용 | NFR-004-1 RLS 활성화 |

---

## 7. 추적성 매트릭스

| PRD v2.0 섹션 | SRD 대응 | 상태 |
|---------------|----------|------|
| Step 1 파일 업로드 & 스펙 변환 | F-001 | ✅ |
| Step 2 TC 자동 생성 | F-002 | ✅ |
| Step 3 테스트 실행 & 추적 | F-003 | ✅ |
| Step 4 FAIL → 이슈 등록 | F-004 | ✅ |
| Step 5 Notion 이슈 DB 전송 | F-005 | ✅ |
| 내보내기 | F-006 | ✅ |
| 화면 구성 | F-007 | ✅ |
| 관리자 인증 (추가) | F-008 | 🆕 |
| 다중 프로젝트 관리 | F-009 | 🔜 |
| 기술 요구사항 | TRD v2.0 참조 | — |
