-- 개별 장비: "일련번호" 열의 이름이 "분류번호"로 바뀌고(키 serial_no 그대로), 제조사 시리얼을 적는 "시리얼번호" 열을 새로 둔다.
-- 시트 "전자기기_개별" 탭: 머리글 "일련번호" → "분류번호" 로 바꾸고, 끝에 "시리얼번호" 열 추가.
alter table device_units add column if not exists serial_number text;
