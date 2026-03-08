-- T-039: 이슈 스크린샷 Storage 버킷 정책
-- Supabase SQL Editor에서 실행
--
-- 사전 준비: Dashboard > Storage > New bucket
--   Name: issue-screenshots
--   Public: true
--   (선택) File size limit: 5MB, Allowed MIME: image/jpeg, image/png, image/gif, image/webp
--
-- 아래 정책 실행 후 anon key로 업로드 가능

-- 업로드 정책
DROP POLICY IF EXISTS "Allow screenshot uploads" ON storage.objects;
CREATE POLICY "Allow screenshot uploads"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'issue-screenshots');

-- 읽기 정책 (공개 URL)
DROP POLICY IF EXISTS "Allow public read screenshots" ON storage.objects;
CREATE POLICY "Allow public read screenshots"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'issue-screenshots');
