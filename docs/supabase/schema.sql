-- TC Pilot Supabase 스키마
-- docs/tc-pilot-trd-v1.0.md 참고
-- Supabase SQL Editor에서 실행하거나 migration으로 적용

-- projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- specs
CREATE TABLE IF NOT EXISTS specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  screen_code TEXT,
  screen_name TEXT,
  path TEXT,
  screen_type TEXT,
  roles TEXT,
  conditions TEXT,
  format TEXT,
  interactions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tc_batches: TC 생성 배치 (제목별 그룹)
CREATE TABLE IF NOT EXISTS tc_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- test_cases
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES tc_batches(id) ON DELETE SET NULL,
  spec_id UUID REFERENCES specs(id) ON DELETE SET NULL,
  tc_id TEXT NOT NULL,
  section TEXT,
  feature_group TEXT,
  screen_code TEXT,
  test_perspective TEXT,
  priority TEXT,
  title TEXT,
  preconditions TEXT,
  steps TEXT,
  expected_result TEXT,
  status TEXT DEFAULT '미확인',
  issue_memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- issues
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tc_id TEXT,
  title TEXT,
  severity TEXT,
  reproduction_steps TEXT,
  expected TEXT,
  actual TEXT,
  screenshot_url TEXT,
  notion_page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MVP용 기본 프로젝트 (선택)
-- INSERT INTO projects (project_name) VALUES ('TC Pilot Demo');
