-- =============================================================================
-- 정보부 업무 관리 시스템 — Supabase(Postgres) 스키마
--
-- 설계 원칙
--   1. 구글 시트가 단일 진실 공급원(source of truth). 아래 테이블은 시트의 읽기 캐시.
--      (shared/sheet-schema.js 의 탭 하나 = 테이블 하나)
--   2. 사람(staff, students)과 교실(classrooms)이 허브. 나머지는 여기에 FK 로 매달린다.
--   3. id 는 text. 시트의 ID 열 그대로 쓰고, 비어 있으면 동기화가 행 해시로 만든다.
--      동기화가 행을 통째로 교체할 수 있으므로 FK 는 모두 ON DELETE SET NULL / CASCADE.
--   4. 인증·승인(profiles)과 비밀 메모(admin_notes)만 시트에 없다.
--
-- 관계도
--   staff ─┬─< laptops.staff_id                 (교원용 노트북, NULL 이면 보유 노트북)
--          ├─< goedu_teacher_accounts.staff_id  (1:1)
--          ├─< rentals.borrower_staff_id / checked_by_staff_id
--          ├─< classrooms.homeroom_staff_id
--          └─< profiles.staff_id               (로그인 계정 ↔ 교직원)
--   classrooms ─┬─< classroom_tvs         (1:1)
--               ├─< tablet_cabinets       (1:1, NULL 이면 보유(예비) 보관함)
--               └─< cyber_guardians >─ students
--   students ──< goedu_student_accounts   (1:1)
--   tablets  (보유 태블릿, 독립)
--   manuals, links (콘텐츠, 독립)
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------- 인증 · 승인 ----------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text,
  role        text not null default 'member' check (role in ('admin', 'member')),
  approved    boolean not null default false,
  staff_id    text,                       -- FK 는 staff 생성 뒤에 추가
  created_at  timestamptz not null default now()
);

-- 회원가입 시 profiles 행 자동 생성 (승인 전 상태)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select approved from profiles where id = auth.uid()), false);
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select approved and role = 'admin' from profiles where id = auth.uid()), false);
$$;

-- ---------- 허브: 사람 · 교실 ----------
create table if not exists staff (
  id          text primary key,
  department  text not null,
  name        text not null,
  subject     text,
  position    text,
  location    text,
  extension   text,
  updated_at  timestamptz not null default now()
);
create index if not exists staff_name_idx on staff (name);

alter table profiles
  drop constraint if exists profiles_staff_id_fkey,
  add constraint profiles_staff_id_fkey foreign key (staff_id) references staff(id) on delete set null;

create table if not exists students (
  id          text primary key,
  school_year int  not null,
  grade       int  not null check (grade between 1 and 3),
  class_no    int  not null check (class_no between 1 and 30),
  number      int  not null check (number between 1 and 60),
  name        text not null,
  -- 학번: 학년(1) + 반(2) + 번호(2). 예) 2학년 10반 11번 = 21011
  student_no  text generated always as (grade::text || lpad(class_no::text, 2, '0') || lpad(number::text, 2, '0')) stored,
  updated_at  timestamptz not null default now(),
  unique (school_year, grade, class_no, number)
);
create index if not exists students_no_idx   on students (school_year, student_no);
create index if not exists students_name_idx on students (name);

create table if not exists classrooms (
  id                text primary key,
  school_year       int  not null,
  grade             int  not null,
  class_no          int  not null,
  location          text,
  homeroom_staff_id text references staff(id) on delete set null,
  updated_at        timestamptz not null default now(),
  unique (school_year, grade, class_no)
);

-- ---------- 교실에 매달린 것 ----------
create table if not exists classroom_tvs (
  id           text primary key,
  school_year  int  not null,
  classroom_id text not null references classrooms(id) on delete cascade,
  brand        text not null,
  model        text,
  memo         text,
  updated_at   timestamptz not null default now()
);

create table if not exists tablet_cabinets (
  id           text primary key,
  school_year  int  not null,
  classroom_id text references classrooms(id) on delete set null,  -- NULL = 보유(예비) 보관함
  location     text,
  tablet_count int  not null default 0,
  password     text,
  memo         text,
  updated_at   timestamptz not null default now()
);
create index if not exists tablet_cabinets_classroom_idx on tablet_cabinets (classroom_id);

create table if not exists cyber_guardians (
  id           text primary key,
  school_year  int  not null,
  classroom_id text not null references classrooms(id) on delete cascade,
  student_id   text not null references students(id) on delete cascade,
  updated_at   timestamptz not null default now()
);

-- ---------- Goedu 계정 ----------
create table if not exists goedu_teacher_accounts (
  id         text primary key,
  staff_id   text not null references staff(id) on delete cascade,
  account    text not null,
  updated_at timestamptz not null default now()
);
create table if not exists goedu_student_accounts (
  id          text primary key,
  school_year int  not null,
  student_id  text not null references students(id) on delete cascade,
  account     text not null,
  updated_at  timestamptz not null default now()
);

-- ---------- 기기 ----------
create table if not exists laptops (
  id            text primary key,
  ip_address    text,
  staff_id      text references staff(id) on delete set null,   -- NULL = 보유 노트북
  position      text,
  location      text,
  manufacturer  text,
  model         text,
  serial_no     text,
  purchase_date date,
  memo          text,
  updated_at    timestamptz not null default now()
);
create index if not exists laptops_staff_idx on laptops (staff_id);

create table if not exists tablets (
  id            text primary key,
  location      text,
  manufacturer  text,
  model         text,
  serial_no     text,
  purchase_date date,
  memo          text,
  updated_at    timestamptz not null default now()
);

-- ---------- 대여 ----------
create table if not exists rentals (
  id                  text primary key,
  item_type           text not null check (item_type in ('노트북', '태블릿', '소모품', '기타')),
  borrower_staff_id   text references staff(id) on delete set null,
  borrower_name       text not null,        -- 교직원이 아니어도 기록 가능
  manufacturer        text,
  model               text,
  item_name           text,                 -- 소모품·기타 품목명
  rented_on           date not null,
  returned_on         date,
  checked_by_staff_id text references staff(id) on delete set null,
  memo                text,
  updated_at          timestamptz not null default now()
);
create index if not exists rentals_type_idx on rentals (item_type, returned_on);

-- ---------- 콘텐츠 ----------
create table if not exists manuals (
  id         text primary key,
  category   text not null,
  title      text not null,
  body       text not null,
  sort_order int  not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists links (
  id         text primary key,
  group_name text not null,
  key        text not null unique,
  label      text not null,
  url        text not null,
  memo       text,
  updated_at timestamptz not null default now()
);

-- 관리자 전용 메모 (goedu 관리자 계정, 학교 공용 메일 등). 시트에 넣지 않는다.
create table if not exists admin_notes (
  key        text primary key,
  label      text not null,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- 동기화 기록
create table if not exists sync_runs (
  id          bigserial primary key,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  ok          boolean,
  summary     jsonb
);

-- ---------- 화면용 뷰 (앱은 가능하면 이 뷰를 읽는다) ----------
create or replace view v_goedu_teachers as
  select a.id, a.account, s.id as staff_id, s.name, s.department, s.subject, s.location, s.extension
  from goedu_teacher_accounts a join staff s on s.id = a.staff_id;

create or replace view v_goedu_students as
  select a.id, a.school_year, st.grade, st.class_no, st.number, st.student_no, st.name, a.account
  from goedu_student_accounts a join students st on st.id = a.student_id;

create or replace view v_classroom_tvs as
  select t.id, c.school_year, c.grade, c.class_no, c.location, t.brand, t.model, t.memo
  from classroom_tvs t join classrooms c on c.id = t.classroom_id;

create or replace view v_tablet_cabinets as
  select k.id, k.school_year, c.grade, c.class_no, coalesce(k.location, c.location) as location,
         k.tablet_count, k.password, k.memo, (k.classroom_id is null) as is_spare
  from tablet_cabinets k left join classrooms c on c.id = k.classroom_id;

create or replace view v_cyber_guardians as
  select g.id, c.school_year, c.grade, c.class_no, st.number, st.name, st.student_no
  from cyber_guardians g join classrooms c on c.id = g.classroom_id join students st on st.id = g.student_id;

create or replace view v_laptops as
  select l.*, s.name as user_name, s.department
  from laptops l left join staff s on s.id = l.staff_id;

create or replace view v_rentals as
  select r.*, c.name as checked_by_name
  from rentals r left join staff c on c.id = r.checked_by_staff_id;

-- ---------- RLS ----------
-- 승인된 사용자만 읽기. 쓰기는 대여만 승인 사용자에게 허용(시트 반영은 Netlify 함수가 한다).
-- 그 외 테이블 쓰기는 service_role(동기화 함수) 만.
do $$
declare t text;
begin
  foreach t in array array['staff','students','classrooms','classroom_tvs','tablet_cabinets','cyber_guardians',
                           'goedu_teacher_accounts','goedu_student_accounts','laptops','tablets','rentals',
                           'manuals','links','sync_runs']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "approved can read" on %I', t);
    execute format('create policy "approved can read" on %I for select using (public.is_approved())', t);
  end loop;
end $$;

drop policy if exists "approved can write rentals" on rentals;
create policy "approved can write rentals" on rentals
  for all using (public.is_approved()) with check (public.is_approved());

alter table profiles enable row level security;
drop policy if exists "own profile"   on profiles;
drop policy if exists "admin profiles" on profiles;
create policy "own profile"    on profiles for select using (id = auth.uid());
create policy "admin profiles" on profiles for all   using (public.is_admin()) with check (public.is_admin());

alter table admin_notes enable row level security;
drop policy if exists "admin notes" on admin_notes;
create policy "admin notes" on admin_notes for all using (public.is_admin()) with check (public.is_admin());

-- 뷰는 security_invoker 로 만들어 RLS 를 그대로 태운다 (Postgres 15+)
alter view v_goedu_teachers  set (security_invoker = on);
alter view v_goedu_students  set (security_invoker = on);
alter view v_classroom_tvs   set (security_invoker = on);
alter view v_tablet_cabinets set (security_invoker = on);
alter view v_cyber_guardians set (security_invoker = on);
alter view v_laptops         set (security_invoker = on);
alter view v_rentals         set (security_invoker = on);
