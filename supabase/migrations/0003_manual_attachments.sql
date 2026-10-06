-- 메뉴얼 첨부파일.
--  · manuals.attachments : 줄마다 "파일ID|파일명|크기" (시트의 "첨부파일" 칸과 같은 텍스트)
--  · 파일 본문은 비공개 버킷 manual-files 에 둔다. 승인된 사용자만 읽고(서명 주소로 내려받음) 올리고 지울 수 있다.
alter table manuals add column if not exists attachments text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('manual-files', 'manual-files', false, 20971520)   -- 20MB
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "approved can read manual files" on storage.objects;
create policy "approved can read manual files" on storage.objects
  for select using (bucket_id = 'manual-files' and public.is_approved());

drop policy if exists "approved can upload manual files" on storage.objects;
create policy "approved can upload manual files" on storage.objects
  for insert with check (bucket_id = 'manual-files' and public.is_approved());

drop policy if exists "approved can delete manual files" on storage.objects;
create policy "approved can delete manual files" on storage.objects
  for delete using (bucket_id = 'manual-files' and public.is_approved());
