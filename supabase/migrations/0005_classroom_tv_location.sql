-- 반별 TV: 전용 위치(비우면 학급 위치를 그대로 씀, 태블릿 보관함과 같은 방식) 추가, 모델명 삭제.
-- 뷰가 아직 model 칸을 쓰고 있으므로, 칸을 지우기 전에 뷰부터 지운다(그래야 "다른 객체가 이 칸에 의존" 오류가 안 난다).
drop view if exists v_classroom_tvs;

alter table classroom_tvs add column if not exists location text;
alter table classroom_tvs drop column if exists model;

-- model 칸을 빼면서 뒤 칸들의 자리가 밀리므로 create or replace 대신 새로 만든다(0004 와 같은 이유).
create view v_classroom_tvs as
  select t.id, c.school_year, c.grade, c.class_no, coalesce(t.location, c.location) as location, t.brand, t.memo
  from classroom_tvs t join classrooms c on c.id = t.classroom_id;
alter view v_classroom_tvs set (security_invoker = on);
