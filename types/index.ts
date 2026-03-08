/**
 * TC Pilot 타입 정의
 * docs/PRD, docs/SRD 참고
 */

export interface Spec {
  id?: string;
  project_id?: string;
  screen_code: string;
  screen_name: string;
  path: string;
  screen_type: string;
  roles: string;
  conditions: string;
  format: string;
  interactions: string;
  notes: string;
}

export interface TestCase {
  id?: string;
  project_id?: string;
  spec_id?: string;
  tc_id: string;
  section: string;
  feature_group: string;
  screen_code: string;
  test_perspective: "N" | "E" | "A" | "R" | "D";
  priority: "P1" | "P2" | "P3" | "P4";
  title: string;
  preconditions: string;
  steps: string;
  expected_result: string;
  status: "PASS" | "FAIL" | "진행중" | "미확인";
  issue_memo?: string;
}

export interface Issue {
  id?: string;
  project_id?: string;
  tc_id: string;
  title: string;
  severity: "Critical" | "Major" | "Minor" | "Low";
  reproduction_steps: string;
  expected: string;
  actual: string;
  screenshot_url?: string;
  notion_page_id?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  project_name: string;
  created_at: string;
}
