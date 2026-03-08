# TC Pilot — 진행 현황

**최종 갱신:** 2026-03-08

---

## 완료된 작업

### 인프라 & 기반
| ID | 태스크 | 상태 |
|----|--------|------|
| T-001 | Supabase 스키마 | ✅ |
| T-002 | 기본 프로젝트 데이터 | ✅ |
| T-003 | Design System CSS 변수 | ✅ |
| T-004 | Notion 이슈 DB (수동) | ✅ |

### Day 1: 파일 업로드 & 스펙 변환
| ID | 태스크 | 상태 |
|----|--------|------|
| T-005 | 파일 업로드 UI (react-dropzone) | ✅ |
| T-006 | MD/XLSX 파싱 | ✅ |
| T-007 | PPT 파싱 (jszip) | ✅ |
| T-008 | 스펙 변환 프롬프트 | ✅ |
| T-009 | POST /api/spec | ✅ |
| T-010 | SpecTab 컴포넌트 | ✅ |

### Day 2: TC 생성 & 테이블 렌더링
| ID | 태스크 | 상태 |
|----|--------|------|
| T-011 | TC 생성 프롬프트 | ✅ |
| T-012 | POST /api/tc, GET /api/tc | ✅ |
| T-014 | TCTab 레이아웃 | ✅ |
| T-015 | DashboardCards | ✅ |
| T-016 | TC 테이블 렌더링 | ✅ |
| T-017 | TC 생성 플로우 연결 | ✅ |
| T-018 | TC 생성 로딩 UI | ✅ |

### Day 2 (추가)
| ID | 태스크 | 상태 |
|----|--------|------|
| T-013 | EditableTable 공통 컴포넌트 | ✅ |

---

### Day 3: P/F 추적 & 이슈 등록 & Notion
| ID | 태스크 | 상태 |
|----|--------|------|
| T-021 | P/F 상태 드롭다운 | ✅ |
| T-022 | 대시보드 실시간 연동 | ✅ (state 기반) |
| T-023 | IssuePanel 슬라이드 패널 | ✅ |
| T-024 | FAIL 선택 시 IssuePanel + TC 매핑 | ✅ |
| T-025 | 이슈 입력 필드 (실제결과, 심각도) | ✅ |
| T-026 | lib/notion.ts | ✅ |
| T-027 | POST /api/notion | ✅ |
| T-028 | [Notion 등록] 버튼 연동 | ✅ |
| T-029 | 이슈 AI 보강 | ✅ |

---

### Day 4: 내보내기 & UI 폴리싱
| ID | 태스크 | 상태 |
|----|--------|------|
| T-020 | 관점별/기능그룹별 필터 | ✅ |
| T-030 | Notion 실패 시 xlsx 백업 안내 | ✅ |
| T-031 | TC 목록 xlsx 다운로드 | ✅ |
| T-032 | 이슈 목록 xlsx 다운로드 | ✅ |
| T-033 | IssueLogTab (탭 3) | ✅ |
| T-034 | 탭 네비게이션 Design System | ✅ |

---

### 배포 & 문서
| ID | 태스크 | 상태 |
|----|--------|------|
| T-037 | Vercel 배포 설정 | ✅ |
| T-040 | README 및 문서 정리 | ✅ |

---

### 안정성
| ID | 태스크 | 상태 |
|----|--------|------|
| T-019 | JSON 파싱 fallback | ✅ |

### UI 폴리싱
| ID | 태스크 | 상태 |
|----|--------|------|
| T-035 | 버튼/뱃지 Design System | ✅ |
| T-039 | 스크린샷 첨부 (P3) | ✅ |

---

### 추가 구현 (문서 외)
| 항목 | 설명 |
|------|------|
| TC 배치 히스토리 (tc_batches) | TCTab 1depth 배치 리스트 + 2depth 상세 테이블, api/tc/batches |
| 파싱만 테스트 모드 (parseOnly) | SpecTab parseOnly 체크박스, api/spec 분기 |

### SRD 반영
| ID | 항목 | 상태 |
|----|------|------|
| F-007-2 | 상단 프로젝트명 표시 | ✅ |

---

## 다음 단계 (선택)

| ID | 태스크 | 비고 |
|----|--------|------|
| T-038 | 데모 시나리오 검증 | 배포 후 E2E 테스트 |

---

## T-039 스크린샷 Storage 설정

스크린샷 업로드 사용 시 Supabase Storage 버킷 생성 필요:

1. `docs/supabase/migration-storage-screenshots.sql` 실행
2. 또는 Dashboard: Storage > New bucket > `issue-screenshots`, Public: true
