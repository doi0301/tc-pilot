# TC Pilot — Design System v1.0

> Jira Product Discovery 레이아웃 + Warm Red 포인트 컬러
> 차분하고 신뢰감 있는 B2B 기획 테스트 도구 UI

---

## 1. Design Principle

### 톤 & 무드: "Calm Authority"

차분한 뉴트럴 베이스 위에 따뜻한 레드가 핵심 액션과 경고를 강조하는 구조.
정보 밀도가 높되 시각적 피로가 없고, 상태를 즉시 인지할 수 있는 인터페이스.

핵심 원칙:
- 정보 우선 — 장식보다 데이터 가독성
- 상태 즉시 인지 — 색상 코딩으로 0.5초 안에 상태 파악
- 최소 클릭 — 핵심 액션까지 최대 2클릭
- 차분한 긴장감 — 뉴트럴 기반에 레드 포인트로 주의 환기

참고 UI: Jira Product Discovery "All Ideas" 뷰
- 좌측 사이드바 내비게이션 + 우측 메인 테이블 레이아웃
- 행 기반 데이터 테이블 중심
- 컬럼별 태그/뱃지로 상태 구분
- 상단 필터바 + 검색


---

## 2. Color System

### 2-1. Point Color — Warm Red

서비스 전체의 핵심 포인트 컬러. CTA 버튼, 활성 탭, FAIL 상태, 주요 강조에 사용.

```css
:root {
  --point-default:     #E04545;       /* 메인 포인트 — 따뜻한 레드 */
  --point-hover:       #C93C3C;       /* hover 시 약간 어둡게 */
  --point-pressed:     #B33333;       /* pressed / active */
  --point-subtle:      #FDE8E8;       /* 연한 배경 — 뱃지, 선택 힌트 */
  --point-muted:       #F5CCCC;       /* 중간 톤 — 보더, 디바이더 강조 */
}
```

### 2-2. Neutral Base — 차분한 뉴트럴

Jira 스타일의 쿨 그레이 베이스. 전체 UI의 90%를 차지하는 기본 톤.

```css
:root {
  /* Background */
  --bg-surface:        #FFFFFF;       /* 메인 콘텐츠 영역 */
  --bg-sidebar:        #F7F8F9;       /* 사이드바, 헤더 배경 */
  --bg-hover:          #F1F2F4;       /* 테이블 행 hover */
  --bg-selected:       #FDE8E8;       /* 선택된 행 (포인트 subtle) */
  --bg-elevated:       #FFFFFF;       /* 카드, 모달, 슬라이드 패널 */
  --bg-page:           #FAFBFC;       /* 전체 페이지 배경 */
  --bg-overlay:        rgba(23, 43, 77, 0.5);  /* 모달 오버레이 */

  /* Border */
  --border-default:    #EBECF0;       /* 테이블 구분선, 카드 보더 */
  --border-focused:    #E04545;       /* 포커스 링 — 포인트 컬러 */
  --border-bold:       #DFE1E6;       /* 강조 구분선 */
  --border-subtle:     #F4F5F7;       /* 미세한 구분 */

  /* Text */
  --text-primary:      #172B4D;       /* 제목, 본문 — Jira 다크 네이비 */
  --text-secondary:    #6B778C;       /* 부제, 설명 텍스트 */
  --text-subtle:       #97A0AF;       /* 비활성, 타임스탬프, 플레이스홀더 */
  --text-inverse:      #FFFFFF;       /* 진한 배경 위 텍스트 */
  --text-link:         #E04545;       /* 링크 — 포인트 컬러 */
  --text-point:        #E04545;       /* 강조 텍스트 */
}
```

### 2-3. Status Colors — TC 상태 (P/F)

전체적으로 채도를 낮춘 차분한 톤. 배경색은 연하게, 텍스트만 진하게.

```css
:root {
  /* PASS — Muted Green */
  --status-pass-bg:    #E6F4EA;       /* 행 배경 */
  --status-pass-text:  #1B7D3F;       /* 뱃지 텍스트 */
  --status-pass-badge: #D4EDDA;       /* 뱃지 배경 */
  --status-pass-dot:   #34A853;       /* 인디케이터 dot */

  /* FAIL — Point Red 활용 */
  --status-fail-bg:    #FDE8E8;       /* 행 배경 — point-subtle */
  --status-fail-text:  #C93C3C;       /* 뱃지 텍스트 */
  --status-fail-badge: #F5CCCC;       /* 뱃지 배경 — point-muted */
  --status-fail-dot:   #E04545;       /* 인디케이터 dot — point */

  /* 진행중 — Muted Amber */
  --status-progress-bg:    #FFF8E6;
  --status-progress-text:  #B87503;
  --status-progress-badge: #FFEFC6;
  --status-progress-dot:   #E8A317;

  /* 미확인 — Neutral Gray */
  --status-pending-bg:     #F4F5F7;
  --status-pending-text:   #6B778C;
  --status-pending-badge:  #EBECF0;
  --status-pending-dot:    #97A0AF;
}
```

### 2-4. Severity Colors — 이슈 심각도

심각도가 높을수록 포인트 레드에 가까워지는 그라데이션.

```css
:root {
  /* Critical — Point Red 풀톤 */
  --severity-critical-bg:    #E04545;
  --severity-critical-text:  #FFFFFF;

  /* Major — 따뜻한 오렌지 */
  --severity-major-bg:       #E8873D;
  --severity-major-text:     #FFFFFF;

  /* Minor — 차분한 블루 */
  --severity-minor-bg:       #5B8DEF;
  --severity-minor-text:     #FFFFFF;

  /* Low — 뉴트럴 */
  --severity-low-bg:         #DFE1E6;
  --severity-low-text:       #42526E;
}
```

### 2-5. Perspective Tag Colors — 테스트 관점 태그

Jira의 Goal 태그 스타일. 연한 배경 + 진한 텍스트 + 좌측 dot.

```css
:root {
  /* N: Normal (정상) — 세이지 그린 */
  --tag-normal-bg:      #E6F4EA;
  --tag-normal-text:    #1B7D3F;
  --tag-normal-dot:     #34A853;

  /* E: Exception (예외) — 머스타드 */
  --tag-exception-bg:   #FFF3CD;
  --tag-exception-text: #856404;
  --tag-exception-dot:  #E8A317;

  /* A: Authority (권한) — 라벤더 */
  --tag-authority-bg:   #EDE7F6;
  --tag-authority-text: #5E35A8;
  --tag-authority-dot:  #7E57C2;

  /* R: Error (에러) — 로즈 (포인트 계열) */
  --tag-error-bg:       #FDE8E8;
  --tag-error-text:     #C93C3C;
  --tag-error-dot:      #E04545;

  /* D: Data (데이터) — 스틸 블루 */
  --tag-data-bg:        #E3ECF6;
  --tag-data-text:      #2C5282;
  --tag-data-dot:       #5B8DEF;
}
```

### 2-6. Priority Badge — 우선순위

Jira Roadmap 뱃지 패턴. 라운드 pill 형태.

```css
:root {
  /* P1 Critical — 레드 pill */
  --priority-p1-bg:    #E04545;
  --priority-p1-text:  #FFFFFF;

  /* P2 High — 오렌지 pill */
  --priority-p2-bg:    #E8873D;
  --priority-p2-text:  #FFFFFF;

  /* P3 Medium — 블루 pill */
  --priority-p3-bg:    #5B8DEF;
  --priority-p3-text:  #FFFFFF;

  /* P4 Low — 그레이 pill */
  --priority-p4-bg:    #DFE1E6;
  --priority-p4-text:  #42526E;
}
```


---

## 3. Typography

### 3-1. Font Stack

```css
:root {
  /* Primary — 본문, UI 전반 */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;

  /* Mono — TC ID, 코드, 수치 */
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
```

Jira와 동일하게 시스템 폰트 스택을 사용한다. B2B 도구에서는 브랜드 폰트보다 OS 네이티브 폰트의 가독성과 로딩 속도가 더 중요하다.

### 3-2. Type Scale

```css
:root {
  --text-xs:     11px;    /* 타임스탬프, 카운트 */
  --text-sm:     12px;    /* 뱃지 텍스트, 부가 정보 */
  --text-base:   14px;    /* 본문, 테이블 셀 — Jira 기본 */
  --text-md:     16px;    /* 섹션 소제목, 입력 필드 */
  --text-lg:     20px;    /* 페이지 제목 (예: "All Ideas") */
  --text-xl:     24px;    /* 대시보드 숫자, 통계 카드 */
  --text-2xl:    32px;    /* 대시보드 핵심 수치 */
}
```

### 3-3. Font Weight

```css
:root {
  --weight-regular:  400;   /* 본문 */
  --weight-medium:   500;   /* 테이블 헤더, 뱃지 */
  --weight-semibold: 600;   /* 제목, 탭 활성, CTA */
  --weight-bold:     700;   /* 대시보드 숫자 */
}
```

### 3-4. Line Height

```css
:root {
  --leading-tight:   1.2;   /* 제목, 대시보드 숫자 */
  --leading-normal:  1.5;   /* 본문, 테이블 셀 */
  --leading-relaxed: 1.7;   /* 장문 설명, 이슈 설명 */
}
```


---

## 4. Spacing & Layout

### 4-1. Spacing Scale

Jira의 4px 기반 스페이싱 시스템.

```css
:root {
  --space-0:   0;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
}
```

### 4-2. Layout Structure

Jira Product Discovery와 동일한 좌측 사이드바 + 우측 메인 구조.

```
┌─────────────────────────────────────────────────────┐
│  Header Bar (h: 56px)                    bg-surface │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Main Content                            │
│ w: 240px │                                          │
│ bg:      │  ┌─ Tab Bar ─────────────────────────┐  │
│ sidebar  │  │ 스펙변환 │ TC목록 │ 이슈로그       │  │
│          │  └────────────────────────────────────┘  │
│ Views:   │                                          │
│ · 전체   │  ┌─ Filter Bar ──────────────────────┐  │
│ · 관점별 │  │ Filter + Sort + Search             │  │
│ · 기능별 │  └────────────────────────────────────┘  │
│          │                                          │
│          │  ┌─ Data Table ──────────────────────┐  │
│          │  │ TC ID │ 제목 │ 관점 │ P/F │ ...   │  │
│          │  │───────────────────────────────────│  │
│          │  │  ...  │ ...  │ ...  │ ... │ ...   │  │
│          │  └────────────────────────────────────┘  │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
```

```css
:root {
  --sidebar-width:       240px;
  --header-height:       56px;
  --filter-bar-height:   48px;
  --table-row-height:    40px;
  --table-header-height: 36px;
  --slide-panel-width:   480px;    /* 이슈 등록 슬라이드 패널 */
}
```

### 4-3. Border Radius

```css
:root {
  --radius-sm:   3px;     /* 뱃지, 태그, 인라인 요소 */
  --radius-md:   6px;     /* 버튼, 입력 필드, 드롭다운 */
  --radius-lg:   8px;     /* 카드, 모달 */
  --radius-xl:   12px;    /* 대시보드 통계 카드 */
  --radius-full: 9999px;  /* pill 뱃지, 아바타 */
}
```

### 4-4. Shadow

```css
:root {
  --shadow-sm:    0 1px 2px rgba(23, 43, 77, 0.04);
  --shadow-md:    0 4px 8px rgba(23, 43, 77, 0.08),
                  0 2px 4px rgba(23, 43, 77, 0.04);
  --shadow-lg:    0 8px 16px rgba(23, 43, 77, 0.12),
                  0 4px 8px rgba(23, 43, 77, 0.06);
  --shadow-panel: 0 12px 24px rgba(23, 43, 77, 0.15);  /* 슬라이드 패널 */
}
```


---

## 5. Components

### 5-1. Button

```
[Primary]   bg: point-default → hover: point-hover → pressed: point-pressed
            text: white, font: semibold, size: 14px
            padding: 8px 16px, radius: radius-md
            예: "TC 생성하기", "Notion 등록"

[Secondary] bg: bg-hover → hover: border-bold
            text: text-primary, border: 1px border-default
            padding: 8px 16px, radius: radius-md
            예: "수정", "xlsx 다운로드"

[Ghost]     bg: transparent → hover: bg-hover
            text: text-secondary
            padding: 8px 12px, radius: radius-md
            예: 필터 버튼, 탭 비활성

[Danger]    bg: point-default (FAIL/삭제 관련 액션에만 사용)
            point 컬러와 동일하므로 별도 컬러 불필요
```

### 5-2. Badge / Tag

Jira의 Goal 태그와 동일한 패턴. 좌측에 컬러 dot + 연한 배경 + 진한 텍스트.

```
┌─ Perspective Tag ──────────┐
│  ● 정상                     │   bg: tag-normal-bg
│                             │   text: tag-normal-text
│  ● 예외                     │   dot: 6px circle
│                             │   padding: 2px 8px 2px 6px
│  ● 권한                     │   radius: radius-sm
│                             │   font: text-sm, weight-medium
│  ● 에러                     │
│  ● 데이터                   │
└────────────────────────────┘

┌─ Status Badge (P/F) ───────┐
│  PASS                      │   bg: status-pass-badge
│  FAIL                      │   text: status-fail-text
│  진행중                     │   padding: 2px 8px
│  미확인                     │   radius: radius-full (pill)
└────────────────────────────┘   font: text-sm, weight-medium

┌─ Priority Pill ────────────┐
│  P1  P2  P3  P4            │   bg: priority-p{n}-bg
│                             │   text: priority-p{n}-text
└────────────────────────────┘   radius: radius-full
                                 padding: 2px 8px
                                 font: text-xs, weight-semibold

┌─ Severity Badge ───────────┐
│  Critical                  │   bg: severity-critical-bg
│  Major                     │   text: white
│  Minor                     │   padding: 4px 10px
│  Low                       │   radius: radius-sm
└────────────────────────────┘   font: text-sm, weight-medium
```

### 5-3. Data Table

Jira Product Discovery "All Ideas" 테이블 패턴 그대로 적용.

```
헤더 행:
  bg: bg-sidebar (#F7F8F9)
  text: text-secondary, font: text-sm, weight-medium
  height: table-header-height (36px)
  border-bottom: 2px border-bold
  padding: 0 12px

데이터 행:
  bg: bg-surface (white)
  hover: bg-hover (#F1F2F4)
  selected: bg-selected (#FDE8E8 — point subtle)
  height: table-row-height (40px)
  border-bottom: 1px border-subtle
  padding: 0 12px
  text: text-base (14px), text-primary

FAIL 행 강조:
  bg: status-fail-bg (#FDE8E8)
  left-border: 3px solid point-default

첫 번째 컬럼 (TC ID):
  font: font-mono, text-sm
  color: text-link (point color)
  cursor: pointer
  hover: underline
```

### 5-4. Dashboard Stat Card

진행현황 대시보드 상단의 통계 카드.

```
┌───────────────────┐
│  총 61 TC          │   bg: bg-surface
│                    │   border: 1px border-default
│  ██████████ 42%    │   radius: radius-xl
│                    │   padding: space-5
│  PASS  12          │   shadow: shadow-sm
│  FAIL   3          │
│  진행중  5          │   숫자: text-2xl, weight-bold
│  미확인 41          │   라벨: text-sm, text-secondary
└───────────────────┘   프로그레스바: h 4px, radius-full

각 상태 숫자 옆에 해당 status-dot 컬러 표시
프로그레스바: pass=green, fail=red, progress=amber, pending=gray 순서로 스택
```

### 5-5. Slide Panel (이슈 등록)

화면 오른쪽에서 슬라이드로 열리는 이슈 등록 패널.

```
width: slide-panel-width (480px)
bg: bg-elevated (white)
shadow: shadow-panel
border-left: 1px border-default

헤더:
  padding: space-5
  border-bottom: 1px border-default
  title: text-lg, weight-semibold, text-primary
  close button: 우상단 X 아이콘

콘텐츠:
  padding: space-5
  overflow-y: auto

하단 액션 바:
  padding: space-4 space-5
  border-top: 1px border-default
  bg: bg-sidebar
  버튼 우측 정렬: [AI 보강: secondary] [Notion 등록: primary]
```

### 5-6. Input Field

```
기본 상태:
  bg: bg-surface
  border: 1px border-default
  radius: radius-md
  padding: 8px 12px
  font: text-base, text-primary
  placeholder: text-subtle

포커스:
  border: 2px border-focused (point color)
  box-shadow: 0 0 0 2px point-subtle

에러:
  border: 2px point-default
  하단에 에러 메시지: text-sm, point-default
```

### 5-7. Dropdown / Select

P/F 상태 변경, 심각도 선택에 사용.

```
트리거:
  input field 스타일 동일 + 우측 chevron 아이콘
  선택된 값: 해당 status badge 인라인 표시

드롭다운 메뉴:
  bg: bg-elevated
  shadow: shadow-md
  border: 1px border-default
  radius: radius-md
  max-height: 240px, overflow-y: auto

메뉴 아이템:
  padding: 8px 12px
  hover: bg-hover
  selected: bg-selected + point color 좌측 2px bar
  각 아이템에 status dot 또는 badge 포함
```

### 5-8. Tab Navigation

Jira의 탭 스타일.

```
탭 바:
  border-bottom: 2px border-default
  padding: 0 space-5

탭 아이템:
  padding: 12px 16px
  font: text-base, weight-medium
  color: text-secondary

  활성:
    color: point-default
    border-bottom: 2px solid point-default
    font-weight: weight-semibold

  hover:
    color: text-primary
    bg: bg-hover (미세하게)
```

### 5-9. Sidebar Navigation

Jira Product Discovery 좌측 사이드바 패턴.

```
사이드바:
  width: sidebar-width (240px)
  bg: bg-sidebar
  border-right: 1px border-default
  padding: space-4 0

프로젝트 헤더:
  padding: space-3 space-4
  아이콘(32px round) + 프로젝트명 (text-base, weight-semibold)

섹션 타이틀:
  padding: space-2 space-4
  font: text-xs, weight-semibold, text-subtle
  text-transform: uppercase
  letter-spacing: 0.5px

메뉴 아이템:
  padding: 6px 12px 6px 16px
  radius: radius-md (좌측만 0으로 할 수도)
  font: text-base, text-secondary

  hover: bg-hover
  active: bg-selected + text: point-default + weight-medium
         좌측에 point-default 3px bar
```

### 5-10. File Upload Area

스펙 변환 탭의 파일 업로드 영역.

```
기본:
  border: 2px dashed border-bold
  radius: radius-lg
  bg: bg-page
  padding: space-10
  text-align: center
  아이콘: 📎 또는 upload 아이콘 (text-subtle)
  메인 텍스트: "PPT, MD, XLSX 파일을 드래그앤드롭 하세요" (text-secondary)
  서브 텍스트: "또는 클릭하여 파일 선택" (text-subtle, text-sm)

hover / drag-over:
  border-color: point-default
  bg: point-subtle (#FDE8E8)
  아이콘/텍스트 색상: point-default
```

### 5-11. Empty State

TC 0건, 이슈 0건일 때 빈 상태 화면.

```
아이콘: 64px, text-subtle
제목: text-md, weight-semibold, text-primary
설명: text-base, text-secondary
CTA: primary 버튼

예:
  📋
  "아직 생성된 TC가 없어요"
  "스펙 변환 탭에서 기획서를 업로드하고 TC를 생성하세요"
  [스펙 변환으로 이동]
```


---

## 6. Iconography

시스템 아이콘은 Lucide React (lucide-react) 사용. Jira와 유사한 라인 스타일 아이콘.

```
크기:
  --icon-sm:  16px    (테이블 인라인, 뱃지 내부)
  --icon-md:  20px    (버튼 아이콘, 메뉴 아이콘)
  --icon-lg:  24px    (헤더, 사이드바)

색상: 기본 text-secondary, hover 시 text-primary, 활성 시 point-default

주요 아이콘 매핑:
  파일 업로드     → Upload
  TC 생성        → Wand2 (AI 마법봉)
  PASS           → CheckCircle (status-pass-dot)
  FAIL           → XCircle (status-fail-dot)
  진행중          → Clock (status-progress-dot)
  미확인          → MinusCircle (status-pending-dot)
  이슈 등록       → Bug
  Notion 전송     → ExternalLink
  AI 보강         → Sparkles
  다운로드         → Download
  필터            → Filter
  검색            → Search
  설정            → Settings
  닫기            → X
```


---

## 7. Motion & Interaction

### 7-1. Transition

```css
:root {
  --transition-fast:   150ms ease;     /* hover, 드롭다운 열기 */
  --transition-normal: 250ms ease;     /* 탭 전환, 패널 슬라이드 */
  --transition-slow:   350ms ease;     /* 모달 열기, 페이지 전환 */
}
```

### 7-2. 주요 인터랙션

```
테이블 행 hover:
  bg transition: fast
  약간의 elevation 느낌 (shadow-sm 추가 가능)

슬라이드 패널:
  오른쪽에서 등장: transform translateX(100%) → translateX(0)
  transition: normal
  overlay: opacity 0 → 0.5, fast

P/F 상태 변경:
  드롭다운 선택 시 해당 행이 0.3초간 해당 status-bg로 flash
  대시보드 숫자 카운트업 애니메이션 (0 → 목표값, 0.5초)

TC 생성 로딩:
  skeleton placeholder (bg-hover → bg-sidebar 반복 pulse)
  프로그레스 텍스트: "AI가 TC를 생성하고 있어요..." + Sparkles 아이콘 회전

파일 드래그:
  drag-over 시 업로드 영역 border-color + bg 전환, fast
  drop 시 체크 아이콘 flash + 파일명 표시
```


---

## 8. Responsive Breakpoint

MVP에서는 데스크톱 중심이지만 기본 breakpoint만 정의.

```css
:root {
  --breakpoint-sm:   640px;
  --breakpoint-md:   768px;
  --breakpoint-lg:   1024px;
  --breakpoint-xl:   1280px;
}
```

데스크톱 (1280px+): 사이드바 + 메인 + 슬라이드 패널 동시 표시
노트북 (1024px~1279px): 사이드바 축소 (아이콘만), 슬라이드 패널 오버레이
태블릿 이하: MVP 범위 밖


---

## 9. 컬러 팔레트 요약 (Quick Reference)

```
포인트     #E04545  ███████  Warm Red — CTA, 링크, FAIL, 활성 탭
포인트 hover #C93C3C ███████
포인트 subtle #FDE8E8 ███████  선택 배경, FAIL 행

텍스트 1차  #172B4D  ███████  제목, 본문
텍스트 2차  #6B778C  ███████  부제, 설명
텍스트 3차  #97A0AF  ███████  비활성, 힌트

배경 메인   #FFFFFF  ███████
배경 사이드  #F7F8F9  ███████
배경 hover  #F1F2F4  ███████
보더 기본   #EBECF0  ███████

PASS       #34A853  ███████  dot / bold
FAIL       #E04545  ███████  = 포인트
진행중      #E8A317  ███████
미확인      #97A0AF  ███████

정상 태그   #1B7D3F on #E6F4EA
예외 태그   #856404 on #FFF3CD
권한 태그   #5E35A8 on #EDE7F6
에러 태그   #C93C3C on #FDE8E8
데이터 태그  #2C5282 on #E3ECF6
```
