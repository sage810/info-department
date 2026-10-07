-- 개별 장비(노트북): "물품구분"·"물품명" 열 추가. 시트 "전자기기_개별_노트북" 탭 끝에 같은 이름의 열이 생긴다(자유 입력 글자).
-- 다른 종류의 개별 장비 탭에는 이 열이 없고, 그 장비의 값은 비어 있다.
-- 실행 순서: 이 SQL(Supabase SQL Editor) → 시트에 열 추가(npm run setup:sheet) → 앱 배포. 순서가 바뀌면 노트북 동기화가 건너뛰어지거나 저장에 실패한다.
alter table device_units add column if not exists item_kind text;
alter table device_units add column if not exists item_name text;
