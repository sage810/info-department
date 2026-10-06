-- 시트 정규화
--  1) 학급 "담임 성함" 열 제거: 담임은 교직원 탭의 "담임" 칸("학년-반") 하나로만 관리한다.
--  2) 날짜를 붙여 쌓던 칸(반별 TV 비고, 반별 A/S HDMI·LAN·비고, 반별 충전함 비고, 장비 A/S 기록)을 "AS기록" 탭(as_logs)으로:
--     기록 한 건이 한 줄(날짜·학년도·학년-반 또는 개별 장비 ID·항목·내용). 여유 보관함의 "기타 메모"는 보통 칸으로 남는다.
--  3) 태블릿 충전함 사양(USB줄 타입·초기화 방법·크롬북 가능 여부)을 개별 장비 → 묶음(전자기기 탭)으로.
-- 시트가 원본이므로 데이터 옮기기는 시트에서 한다(이 파일은 DB 모양만 맞춘다). 시트를 먼저 바꾼 뒤 이 파일을 실행하고 동기화한다.

-- 1)
alter table classrooms drop column if exists homeroom_staff_id;

-- 2)
create table if not exists as_logs (
  id           text primary key,
  logged_on    date,                                                  -- 비면 날짜 없는 기록
  school_year  int,                                                   -- 학급 기록만
  classroom_id text references classrooms(id) on delete cascade,      -- 학급 기록만
  unit_id      text references device_units(id) on delete cascade,    -- 장비 A/S 만
  item         text not null,                                         -- TV 비고 / 충전함 비고 / HDMI / LAN / 반별 A/S 비고 / 장비 A/S
  body         text not null,
  updated_at   timestamptz not null default now()
);
create index if not exists as_logs_classroom_idx on as_logs (classroom_id);
create index if not exists as_logs_unit_idx on as_logs (unit_id);

alter table as_logs enable row level security;
drop policy if exists "approved can read" on as_logs;
create policy "approved can read" on as_logs for select using (public.is_approved());

create or replace view v_as_logs as
  select l.*, c.grade, c.class_no
  from as_logs l left join classrooms c on c.id = l.classroom_id;
alter view v_as_logs set (security_invoker = on);

drop view if exists v_classroom_tvs;
create view v_classroom_tvs as
  select t.id, c.school_year, c.grade, c.class_no, coalesce(t.location, c.location) as location, t.brand
  from classroom_tvs t join classrooms c on c.id = t.classroom_id;
alter view v_classroom_tvs set (security_invoker = on);

drop view if exists v_classroom_as;
create view v_classroom_as as
  select a.id, c.school_year, c.grade, c.class_no, coalesce(a.location, c.location) as location
  from classroom_as a join classrooms c on c.id = a.classroom_id;
alter view v_classroom_as set (security_invoker = on);

alter table classroom_tvs drop column if exists memo;
alter table classroom_as  drop column if exists hdmi;
alter table classroom_as  drop column if exists lan;
alter table classroom_as  drop column if exists memo;
alter table device_units  drop column if exists as_log;

-- 3)
alter table devices add column if not exists usb_type      text;
alter table devices add column if not exists reset_method  text;
alter table devices add column if not exists chromebook_ok text;
alter table device_units drop column if exists usb_type;
alter table device_units drop column if exists reset_method;
alter table device_units drop column if exists chromebook_ok;
