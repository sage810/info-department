-- 전자기기 보유 현황: 노트북(laptops)·보유 태블릿(tablets)을 "묶음(devices) + 개별 장비(device_units)"로 합친다.
-- 보유 현황 집계표는 devices 만으로 계산하고, 제출한 해의 숫자는 inventory_snapshots 에 그대로 보관한다.
-- (시트 → DB 동기화가 표를 통째로 다시 채우므로 기존 행은 옮기지 않고 비운다. 시트 탭을 먼저 새 양식으로 바꿀 것.)

drop view if exists v_laptops;
drop table if exists laptops;
drop table if exists tablets;

create table if not exists devices (
  id            text primary key,
  usage         text,          -- 학생용 / 교원용 / 직원용 / 기타 (그 외 직접 입력)
  item_category text,          -- 데스크톱 / 노트북 / 태블릿 / 태블릿보관함 / 기타
  place         text,          -- 데스크톱만: 컴퓨터실습실 / 컴퓨터실습실 외
  manufacturer  text,
  model         text,
  quantity      int,           -- 개별 장비가 연결된 묶음은 무시(개수로 계산)
  capacity      int,           -- 태블릿 충전함만: 보관 가능 대수
  purchase_date date,
  os            text,
  disposed_on   date,          -- 적으면 보유 현황에서 빠짐
  memo          text,
  updated_at    timestamptz not null default now()
);

create table if not exists device_units (
  id            text primary key,
  batch_id      text,          -- devices.id (시트에 ID 를 그대로 적으므로 FK 는 두지 않는다)
  asset_no      text,
  serial_no     text,
  staff_id      text references staff(id) on delete set null,   -- NULL = 보유(예비)
  ip_address    text,
  location      text,
  purchase_date date,          -- 비우면 묶음 값
  os            text,          -- 비우면 묶음 값
  status        text,          -- 사용 중 / 보유(예비) / 수리 중 / 폐기
  memo          text,
  updated_at    timestamptz not null default now()
);
create index if not exists device_units_batch_idx on device_units (batch_id);
create index if not exists device_units_staff_idx on device_units (staff_id);

create table if not exists inventory_snapshots (
  id              text primary key,
  year            int not null,
  band            int not null,      -- 1=최근1년이내 … 7=최근6년이전
  band_label      text,
  student_lab     int, student_other int, student_laptop int, student_tablet int, student_etc int,
  teacher_desktop int, teacher_laptop int, teacher_tablet int, teacher_etc int,
  staff_desktop   int, staff_laptop int, staff_tablet int, staff_etc int,
  etc_desktop     int, etc_laptop int, etc_tablet int, etc_etc int,
  frozen_on       date,
  frozen_by       text,
  updated_at      timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['devices','device_units','inventory_snapshots']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "approved can read" on %I', t);
    execute format('create policy "approved can read" on %I for select using (public.is_approved())', t);
  end loop;
end $$;
