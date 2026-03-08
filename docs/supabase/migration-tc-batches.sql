-- TC Pilot — tc_batches 마이그레이션 (기존 DB에 적용)
-- Supabase SQL Editor에서 schema.sql 적용 후, 이미 test_cases가 있는 경우 이 스크립트 실행

-- tc_batches 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS tc_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- test_cases에 batch_id 컬럼 추가 (없으면)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_cases' AND column_name = 'batch_id'
  ) THEN
    ALTER TABLE test_cases ADD COLUMN batch_id UUID REFERENCES tc_batches(id) ON DELETE SET NULL;
  END IF;
END $$;
