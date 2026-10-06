-- 보유 태블릿(예비) 재고를 개별 일련번호 단위가 아니라 "물품분류/운영체제/제조사/모델명/보유 수량/물품취득일자/비고"
-- 단위(모델·취득일별 묶음 + 수량)로 관리하도록 바꾼다. 위치·일련번호는 더 이상 쓰지 않는다.
alter table tablets add column if not exists item_category text;
alter table tablets add column if not exists os text;
alter table tablets add column if not exists quantity int;
alter table tablets drop column if exists location;
alter table tablets drop column if exists serial_no;
