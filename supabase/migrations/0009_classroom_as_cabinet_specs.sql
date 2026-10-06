-- 반별 관리 → 반별 A/S: 학급마다 HDMI·LAN·비고 기록(줄마다 날짜를 앞에 붙여 쌓는다). 시트 "반별AS" 탭 ↔ classroom_as.
-- 전자기기 → 태블릿 충전함 개별 장비: 크롬북 가능 여부·초기화 방법·USB줄 타입 열 추가(시트 "전자기기_개별" 탭 끝).

create table if not exists classroom_as (
  id           text primary key,
  school_year  int  not null,
  classroom_id text not null references classrooms(id) on delete cascade,
  location     text,          -- 비우면 학급 위치
  hdmi         text,
  lan          text,
  memo         text,
  updated_at   timestamptz not null default now()
);

alter table classroom_as enable row level security;
drop policy if exists "approved can read" on classroom_as;
create policy "approved can read" on classroom_as for select using (public.is_approved());

create or replace view v_classroom_as as
  select a.id, c.school_year, c.grade, c.class_no, coalesce(a.location, c.location) as location, a.hdmi, a.lan, a.memo
  from classroom_as a join classrooms c on c.id = a.classroom_id;
alter view v_classroom_as set (security_invoker = on);

alter table device_units add column if not exists chromebook_ok text;
alter table device_units add column if not exists reset_method  text;
alter table device_units add column if not exists usb_type      text;
