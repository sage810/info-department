-- A/S 메뉴 → 노트북·태블릿·태블릿 충전함 A/S: 개별 장비마다 A/S 기록(줄마다 "YYYY.MM.DD 내용"). 시트 "전자기기_개별" 탭 끝에 "A/S 기록" 열.
alter table device_units add column if not exists as_log text;
