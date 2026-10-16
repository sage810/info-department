-- 전자기기 → 태블릿 충전함 메뉴: "모델 묶음(보유_태블릿보관함 탭) + 충전함 한 대씩(태블릿보관함 탭)" 2단 구조.
--   묶음(devices, 분류 태블릿보관함)에만 쓰는 칸: 취득단가·GSMS 등재·A/S 연락처·사용여부
--   충전함 한 대(tablet_cabinets): 어느 묶음(모델)인지(batch_id) · 분류번호
-- 실행 순서: 이 SQL(Supabase SQL Editor) → npm run setup:sheet(시트에 열 추가) → 앱 배포.
alter table devices add column if not exists unit_price int;
alter table devices add column if not exists gsms_registered text;
alter table devices add column if not exists as_contact text;
alter table devices add column if not exists in_use text;

alter table tablet_cabinets add column if not exists batch_id text;   -- devices.id (시트에 ID 를 그대로 적으므로 FK 는 두지 않는다)
alter table tablet_cabinets add column if not exists serial_no text;  -- 분류번호
create index if not exists tablet_cabinets_batch_idx on tablet_cabinets (batch_id);

-- 화면용 뷰에 새 칸을 끝에 덧붙인다(앞쪽 열 순서는 그대로여야 create or replace 가 된다)
create or replace view v_tablet_cabinets as
  select k.id, k.school_year, c.grade, c.class_no, coalesce(k.location, c.location) as location,
         k.tablet_count, k.password, k.memo, (k.classroom_id is null) as is_spare,
         k.batch_id, k.serial_no
  from tablet_cabinets k left join classrooms c on c.id = k.classroom_id;
alter view v_tablet_cabinets set (security_invoker = on);
