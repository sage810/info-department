/**
 * 학년·반·번호 검색어를 풀어서 "그 반·번호의 행"만 찾게 한다(글자 포함 검색은 "1-1" 이 "1-10" 도 잡는 문제가 있다).
 *   "1학년2반", "1학년 2반", "1학년2반3번", "1학년 2반 3번", "1-2", "1-2-3", "10203"(학번: 학년1+반2+번호2),
 *   "1학년", "2반", "3번" 처럼 쓴 검색어 → { grade, class_no, number }(안 쓴 자리는 null). 이 모양이 아니면 null(보통 글자 검색).
 * 쓰는 곳: DataTable 의 classSearch(반별 관리 표, 대여 목록의 학생 대여).
 */
export function parseClassQuery(text) {
  const s = String(text ?? '').replace(/\s+/g, '');
  if (!s) return null;
  let m;
  const q = (grade, class_no, number) => ({ grade: grade == null ? null : +grade, class_no: class_no == null ? null : +class_no, number: number == null ? null : +number });
  if ((m = /^(\d)학년(\d{1,2})반(?:(\d{1,2})번?)?$/.exec(s))) return q(m[1], m[2], m[3]);
  if ((m = /^(\d)학년$/.exec(s))) return q(m[1]);
  if ((m = /^(\d{1,2})반$/.exec(s))) return q(null, m[1]);
  if ((m = /^(\d)-(\d{1,2})(?:-(\d{1,2}))?$/.exec(s))) return q(m[1], m[2], m[3]);
  if ((m = /^(\d)(\d{2})(\d{2})$/.exec(s))) return q(m[1], m[2], m[3]);
  if ((m = /^(\d{1,2})번$/.exec(s))) return q(null, null, m[1]);
  return null;
}

/**
 * 풀린 검색어(cq)가 행에 맞는지. fields 는 행에서 읽을 열 이름(기본 grade·class_no·number).
 * 행에 번호가 없으면(반 단위 표: 반별 TV·보관함 등) 번호는 따지지 않는다 — 단, 번호만 쓴 검색어("3번")는 번호 없는 행에 맞지 않는다.
 */
export function classQueryMatch(cq, row, fields = {}) {
  const f = { grade: 'grade', class_no: 'class_no', number: 'number', ...fields };
  const has = (v) => v !== null && v !== undefined && v !== '';
  if (cq.grade != null && !(has(row[f.grade]) && Number(row[f.grade]) === cq.grade)) return false;
  if (cq.class_no != null && !(has(row[f.class_no]) && Number(row[f.class_no]) === cq.class_no)) return false;
  if (cq.number != null) {
    if (has(row[f.number])) return Number(row[f.number]) === cq.number;
    return cq.grade != null || cq.class_no != null;
  }
  return true;
}
