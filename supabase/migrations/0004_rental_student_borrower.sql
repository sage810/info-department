-- 대여 기록에 "학생 대여" 지원 추가. borrower_staff_id(교직원)와는 별개로 borrower_student_id 를 둔다.
-- 한 행은 둘 중 하나만 채워진다(교직원 대여면 staff_id, 학생 대여면 student_id) — borrower_name 은 두 경우 모두
-- 사람이 읽을 이름을 담아 검색·표시에 그대로 쓴다(학생 대여면 학생 이름을 복사해 넣는다).
alter table rentals add column if not exists borrower_student_id text references students(id) on delete set null;
create index if not exists rentals_student_idx on rentals (borrower_student_id);

-- v_rentals 에 학생 정보(학년·반·번호·이름) 조인 추가 — 대여 화면의 "학생 대여" 표가 그대로 쓴다.
-- r.* 사이에 새 칸(borrower_student_id)이 끼어들어 기존 칸 순서가 밀리므로, create or replace 대신 지우고 다시 만든다
-- (PostgreSQL은 이미 있는 뷰 칸의 이름이 바뀌는 걸 create or replace 로 허용하지 않는다).
drop view if exists v_rentals;
create view v_rentals as
  select r.*, c.name as checked_by_name,
    st.grade as borrower_grade, st.class_no as borrower_class_no, st.number as borrower_number
  from rentals r
  left join staff c on c.id = r.checked_by_staff_id
  left join students st on st.id = r.borrower_student_id;
alter view v_rentals set (security_invoker = on);
