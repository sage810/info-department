-- 태블릿 충전함을 "충전함 한 줄에 모든 정보" 구조로 바꾼다(0015 의 모델 묶음 + 묶음 ID 방식을 걷어 낸다).
--   충전함(tablet_cabinets) 한 줄에 용도·제조사·모델명·충전 가능 대수·취득일자·취득단가·GSMS 등재·A/S 연락처·사용여부·USB·초기화·크롬북
--   현황(모델별 대수)은 앱이 이 줄들을 제조사 + 모델명 + 취득일자로 묶어 센다. 보유_태블릿보관함 탭(묶음)은 더 이상 쓰지 않는다.
-- 실행 순서: 이 SQL(Supabase SQL Editor) → 시트 정리(열 추가·값 옮기기·탭 삭제) → 앱 배포.
alter table tablet_cabinets add column if not exists usage text;
alter table tablet_cabinets add column if not exists manufacturer text;
alter table tablet_cabinets add column if not exists model text;
alter table tablet_cabinets add column if not exists capacity int;
alter table tablet_cabinets add column if not exists purchase_date date;
alter table tablet_cabinets add column if not exists unit_price int;
alter table tablet_cabinets add column if not exists gsms_registered text;
alter table tablet_cabinets add column if not exists as_contact text;
alter table tablet_cabinets add column if not exists in_use text;
alter table tablet_cabinets add column if not exists usb_type text;
alter table tablet_cabinets add column if not exists reset_method text;
alter table tablet_cabinets add column if not exists chromebook_ok text;

-- 지금 연결된 묶음의 값을 충전함 줄로 옮겨 둔다(시트에서도 같은 일을 하므로, 다음 동기화 전까지 화면이 비지 않게)
update tablet_cabinets k set usage = d.usage, manufacturer = d.manufacturer, model = d.model, capacity = d.capacity, purchase_date = d.purchase_date,
  unit_price = d.unit_price, gsms_registered = d.gsms_registered, as_contact = d.as_contact, in_use = d.in_use,
  usb_type = d.usb_type, reset_method = d.reset_method, chromebook_ok = d.chromebook_ok
from devices d where d.id = k.batch_id;

-- 화면용 뷰: 새 칸을 담아 다시 만든다(묶음 ID 는 뺀다)
drop view if exists v_tablet_cabinets;
alter table tablet_cabinets drop column if exists batch_id;
drop index if exists tablet_cabinets_batch_idx;
create view v_tablet_cabinets as
  select k.id, k.school_year, c.grade, c.class_no, coalesce(k.location, c.location) as location,
         k.tablet_count, k.password, k.memo, (k.classroom_id is null) as is_spare,
         k.serial_no, k.usage, k.manufacturer, k.model, k.capacity, k.purchase_date, k.unit_price,
         k.gsms_registered, k.as_contact, k.in_use, k.usb_type, k.reset_method, k.chromebook_ok
  from tablet_cabinets k left join classrooms c on c.id = k.classroom_id;
alter view v_tablet_cabinets set (security_invoker = on);

-- 충전함 묶음(분류 태블릿보관함)과 그 묶음에만 쓰던 칸은 더 이상 쓰지 않는다
delete from devices where item_category = '태블릿보관함';
alter table devices drop column if exists unit_price;
alter table devices drop column if exists gsms_registered;
alter table devices drop column if exists as_contact;
alter table devices drop column if exists in_use;
