-- T-002: MVP용 기본 프로젝트 1건 생성
-- Supabase SQL Editor에서 실행 (projects가 비어 있을 때만)

INSERT INTO projects (project_name)
SELECT 'TC Pilot Demo'
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);
