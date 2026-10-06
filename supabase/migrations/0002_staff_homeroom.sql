-- 교직원(staff)에 "담임" 열 추가. 학년-반 텍스트(예: "1-1", "2-11")를 사람이 직접 적어 두는 값이고,
-- classrooms.homeroom_staff_id(학급 → 담임 교직원) 와는 별개다 — 이 열은 자동으로 그 관계를 만들지 않는다.
alter table staff add column if not exists homeroom text;
