-- 에듀테크 메뉴: 구독 에듀테크 / 기타 에듀테크 목록(이름·사이트·공용 아이디·비밀번호·안내·사용 기한·가격).
-- 시트의 "에듀테크" 탭 ↔ edutech_items. (시트 → DB 동기화가 표를 통째로 채운다. 공용 아이디·비밀번호는 승인된 교직원에게 보인다.)

create table if not exists edutech_items (
  id          text primary key,
  category    text,          -- 구독 / 기타
  name        text,
  url         text,
  shared_id   text,
  password    text,
  guide       text,
  expires_on  date,
  price       text,
  memo        text,
  updated_at  timestamptz not null default now()
);

alter table edutech_items enable row level security;
drop policy if exists "approved can read" on edutech_items;
create policy "approved can read" on edutech_items for select using (public.is_approved());
