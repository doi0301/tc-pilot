# TC Pilot — Notion & Mantis 이슈 스키마 설계

이 문서는 TC Pilot에서 생성된 이슈를 **Notion 이슈 DB**에 저장하고, 장기적으로 **MantisBT와 연동**하기 위한 스키마/뷰/필드 매핑을 정의한다.

## 1. Notion 이슈 DB 속성 설계 (Mantis 기준)

메인 데이터베이스 이름: **`TC Issues`**

### 1-1. 기본 식별자 계층

- **요약 (Title, 필수)**  
  - 형식: `[화면코드] 이슈 간단 요약`  
  - 예: `[CS001] 결제 승인 실패 시 메시지 노출 오류`
- **TC ID (Text, 필수)**  
  - TC Pilot에서 넘어오는 테스트 케이스 식별자.
  - 예: `CS001-N-001`
- **Mantis 이슈 ID (Text, 선택)**  
  - Mantis 버그 ID를 입력하는 자리.  
  - 예: `0004321`
- **프로젝트 (Select, 필수)**  
  - Mantis 프로젝트명과 동일한 옵션 사용.  
  - 예: `HIPAS`, `내부 포탈`, `결제 시스템`

### 1-2. 상태/우선순위 계층

- **상태 (Select, 필수)** — Mantis 상태 축약 버전
  - `신규`
  - `확인중`
  - `수정중`
  - `해결`
  - `보류`
- **심각도 (Select, 필수)** — Priority/Severity 용
  - `Critical`
  - `Major`
  - `Minor`
  - `Low`
- **담당자 (People 또는 Text, 선택)**  
  - 운영 방식에 따라 Notion People 타입 또는 Text 중 선택.

### 1-3. 테스트/기능 컨텍스트

- **화면코드 (Text, 필수)**  
  - TC Pilot에서 제공하는 화면 코드. 예: `CS001`
- **TC 제목 (Text, 필수)**  
  - 테스트 케이스 제목.
- **기능 그룹 (Select, 선택)**  
  - 예: `로그인`, `주문`, `정산`, `대시보드` 등.
- **테스트 관점 (Select, 필수)**  
  - `N` (정상), `E` (예외), `A` (권한), `R` (에러), `D` (데이터)

### 1-4. 이슈 설명 영역

- **재현 순서 (Rich text, 필수)**  
  - 사용자가 입력한 재현 절차 + AI 보강 결과.
- **기대 결과 (Rich text, 필수)**  
  - 해당 테스트 케이스의 기대 결과.
- **실제 결과 (Rich text, 필수)**  
  - 실제 실행 시 관찰된 결과.
- **스크린샷 (Files & media 또는 URL, 선택)**  
  - TC Pilot에서 업로드한 스크린샷을 저장.  
  - URL 타입으로만 저장할 경우 속성명은 `스크린샷 URL`.

### 1-5. 운영/연동 메타데이터

- **Source (Select, 필수)**  
  - `TC Pilot`, `Mantis`, `기타`
- **Mantis Sync 상태 (Select, 필수)**  
  - `미연동` — TC Pilot에서 생성되었으나 아직 Mantis에 등록되지 않음  
  - `수동 등록` — 사람이 Mantis에 수동 등록 완료  
  - `자동 연동` — API를 통해 자동 생성 완료 (향후)  
  - `연동 실패` — API 연동 실패, 재시도 필요
- **Mantis 링크 (URL, 선택)**  
  - Mantis 이슈 상세 페이지 직접 링크.
- **생성일 (Created time, Notion 기본)**  
- **갱신일 (Last edited time, Notion 기본)**

---

## 2. Notion 뷰 구성

하나의 `TC Issues` DB 위에 여러 뷰를 만들어 운영 편의성과 Mantis 연동 의도를 드러낸다.

### 2-1. 전체 이슈 (Table 뷰)

- **기본 컬럼**
  - `요약`, `TC ID`, `상태`, `심각도`, `화면코드`, `담당자`, `Source`, `Mantis Sync 상태`, `생성일`
- **정렬**
  - `생성일` 내림차순
- **용도**
  - 전체 이슈 현황을 한 번에 보는 기본 리스트.

### 2-2. Mantis 연동 대기 (Table / Filter 뷰)

- **필터**
  - `Mantis Sync 상태 = 미연동`
  - `Source = TC Pilot`
- **표시 컬럼**
  - `요약`, `TC ID`, `심각도`, `화면코드`, `담당자`, `Mantis 이슈 ID`, `Mantis 링크`
- **뷰 설명 (Description) 권장 문구**
  - _\"이 뷰의 이슈는 아직 Mantis에 등록되지 않았습니다. Mantis에 버그를 생성한 뒤 `Mantis 이슈 ID`, `Mantis 링크`, `Mantis Sync 상태`를 업데이트해 주세요.\"_
- **용도**
  - 운영자가 Mantis로 옮겨야 할 이슈의 작업큐 역할.

### 2-3. 상태별 칸반 (Board 뷰)

- **Group by**: `상태`
- **컬럼 순서**: `신규 → 확인중 → 수정중 → 해결 → 보류`
- **카드에 노출할 필드**
  - `요약`, `심각도`, `TC ID`, `담당자`
- **용도**
  - 테스트/이슈 진행 상황을 한눈에 파악하는 대시보드.

### 2-4. 프로젝트별 뷰 (Table 또는 Board, 선택)

- **Filter**: 필요시 `프로젝트 = {특정 프로젝트}`  
  또는 Group by `프로젝트`
- **용도**
  - Mantis와 동일한 프로젝트 단위로 이슈를 관리하고 싶은 팀을 위한 뷰.

---

## 3. TC Pilot ↔ Notion ↔ Mantis 필드 매핑

### 3-1. TC Pilot → Notion 매핑

TC Pilot에서 Notion으로 이슈를 보낼 때 최소한 다음 필드를 포함한다.

| TC Pilot 필드              | Notion 속성        | 비고 |
| -------------------------- | ------------------ | ---- |
| `tc_id`                    | `TC ID` (Text)     | 필수 |
| `screen_code`              | `화면코드` (Text)  | 필수 |
| `title` (TC 제목)         | `TC 제목` (Text)   | 필수 |
| `feature_group`            | `기능 그룹` (Select) | 선택 |
| `test_perspective` (N/E/…) | `테스트 관점` (Select) | 필수 |
| `expected_result`          | `기대 결과` (Rich text) | 필수 |
| `actual_result`            | `실제 결과` (Rich text) | 필수 |
| `steps`                    | `재현 순서` (Rich text) | 필수 |
| `severity` (P1~P4 등)      | `심각도` (Select)  | 필수 (Critical/Major/Minor/Low 로 변환) |
| `project_id`/`project_name`| `프로젝트` (Select) | 필수 |
| `screenshot_url`           | `스크린샷` 또는 `스크린샷 URL` | 선택 |

추가로:

- `요약`은 서버/클라이언트에서 `[화면코드] + TC 제목` 형태로 조합해서 보낸다.
- `Source`는 항상 `TC Pilot`으로 세팅한다.
- `Mantis Sync 상태`는 기본값 `미연동`.

### 3-2. Notion → Mantis 매핑 (향후)

향후 Mantis API 연동 시에는 다음과 같이 사용할 수 있다.

| Notion 속성          | Mantis 필드(예상) | 비고 |
| -------------------- | ----------------- | ---- |
| `요약`               | `summary`         | 필수 |
| `프로젝트`           | `project`         | 필수 |
| `심각도`             | `severity`/`priority` | 값 매핑 테이블 없이 동일명 사용 |
| `재현 순서`         | `steps_to_reproduce` |   |
| `기대 결과`         | `additional_info` 등 |   |
| `실제 결과`         | `description`     |   |
| `스크린샷`/URL      | `attachments`     | 파일 업로드 or 링크 |
| `담당자`            | `handler`         | 선택 |

연동 완료 후:

- 생성된 Mantis 버그 ID를 `Mantis 이슈 ID`에 기록.
- 상세 URL을 `Mantis 링크`에 기록.
- `Mantis Sync 상태`를 `자동 연동`으로 변경.

---

## 4. Mantis 연동 의도를 드러내는 UX 라이팅 가이드

### 4-1. 속성명 가이드

- Notion 속성에서 Mantis 관련 필드는 **항상 `Mantis`라는 접두어**를 유지한다.
  - 예: `Mantis 이슈 ID`, `Mantis 링크`, `Mantis Sync 상태`
- `Source` 속성에는 설명을 추가한다.
  - 설명 예시: _\"이 이슈가 처음 생성된 위치입니다. TC Pilot에서 생성된 이슈는 나중에 Mantis와 연동됩니다.\"_

### 4-2. 뷰 설명 문구 예시

- **Mantis 연동 대기 뷰**
  - _\"TC Pilot에서 생성된 이슈 중 아직 Mantis에 등록되지 않은 항목입니다. Mantis에 버그를 생성한 뒤 `Mantis 이슈 ID`, `Mantis 링크`, `Mantis Sync 상태`를 업데이트해 주세요.\"_
- **전체 이슈 뷰**
  - _\"TC Pilot와 Mantis에서 들어온 모든 이슈를 한 곳에서 관리합니다. Source와 Mantis 필드를 통해 연동 상태를 확인할 수 있습니다.\"_

### 4-3. 상태 값 설명

- `미연동`: TC Pilot에서 생성됨, 아직 Mantis에 버그가 없는 상태.
- `수동 등록`: 운영자가 Mantis에 버그를 만들고 ID/링크를 수동으로 채운 상태.
- `자동 연동`: 시스템이 API를 통해 Mantis 버그를 생성한 상태 (향후).
- `연동 실패`: 자동 등록 시 오류가 발생한 상태 — 재시도 필요.

---

## 5. 요약

위 스키마와 뷰 구성을 따르면:

- 현재는 **TC Pilot → Notion**까지만 자동화하면서도,
- 필드 구조와 뷰 이름만으로 **\"이 데이터는 결국 Mantis와 연동될 것\"**이라는 의도가 자연스럽게 드러난다.
- 나중에 실제 Mantis 연동을 붙일 때도, 이미 존재하는 `Mantis 이슈 ID`, `Mantis 링크`, `Mantis Sync 상태`, `Source` 필드를 그대로 활용하면 되어 추가 마이그레이션이 최소화된다.

