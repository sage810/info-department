-- 개별 장비의 종류(노트북·태블릿·태블릿보관함·데스크톱)를 장비 행에 직접 둔다.
-- 묶음 ID 가 선택 사항이 되어(비워도 됨), 종류를 묶음에서만 알 수 있던 방식으로는 묶음 없는 장비가 어느 탭(종류)인지 알 수 없기 때문.
-- 값은 동기화가 "그 장비가 적힌 탭의 종류"로 채운다(시트에는 열이 없다). 앱에서 추가할 때는 화면의 종류로 채운다.
-- 실행 순서: 이 SQL(Supabase SQL Editor) → 앱 배포. 순서가 바뀌면 개별 장비 저장이 실패한다.
alter table device_units add column if not exists category text;
update device_units u set category = d.item_category from devices d where d.id = u.batch_id and u.category is null;
create index if not exists device_units_category_idx on device_units (category);
