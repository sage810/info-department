/**
 * 시트 탭 ↔ DB 테이블 ↔ 열 정의 (단일 진실 공급원)
 *
 * 이 파일을 읽는 곳:
 *   - scripts/make-demo-sheet.mjs : 구글 시트에 올릴 데모 xlsx 생성
 *   - scripts/make-seed.mjs       : supabase/seed.sql 생성
 *   - netlify/functions/sync-sheets.mts : 시트 → Supabase 동기화
 *   - src/lib/data.js             : 앱 화면의 열 이름
 *
 * 규칙
 *   - 탭 이름(tab)이 곧 구글 시트의 시트 이름이다. 바꾸면 시트도 같이 바꿔야 한다.
 *   - 첫 열은 항상 ID. 사람이 비워 두면 동기화가 행 내용의 해시로 채운다.
 *   - ref 가 있는 열은 시트에는 "성함/학번/학년-반" 같은 자연키로 적고,
 *     동기화 때 부모 테이블의 id 로 바꿔 넣는다.
 *       ref: 'staff'      → 성함으로 staff.id 찾기
 *       ref: 'students'   → 학번(예: 21011) + 같은 행의 학년도로 students.id 찾기
 *       ref: 'classrooms' → "학년-반"(예: 2-5) + 같은 행의 학년도로 classrooms.id 찾기
 *   - derived 열은 시트에만 보이는 참고용(동기화 무시).
 *   - type: 'int' | 'date' | 'text'(기본)
 */

export const SCHOOL_YEAR = 2026;

export const ITEM_TYPES = ['노트북', '태블릿', '소모품', '기타'];
export const MANUAL_CATEGORIES = ['WiFi', '프린터', 'A/S', '교실TV', '전입생', '노트북', '태블릿', '태블릿 충전함', '전자 소모품', '품의 방법', '기타'];
export const LINK_GROUPS = ['시트', '드라이브', '에듀테크'];

const ID = { key: 'id', header: 'ID', note: '비워 두면 자동 생성' };

/** 동기화 순서 = 배열 순서 (부모 테이블이 먼저) */
export const TABLES = [
  {
    table: 'staff', tab: '교직원', label: '교직원 배치 및 연락망',
    columns: [
      ID,
      { key: 'department', header: '부서' },
      { key: 'name', header: '성함' },
      { key: 'subject', header: '과목' },
      { key: 'position', header: '직위' },
      { key: 'location', header: '위치' },
      { key: 'extension', header: '내선연락망' },
    ],
  },
  {
    table: 'students', tab: '학생', label: '학생 명단',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'grade', header: '학년', type: 'int' },
      { key: 'class_no', header: '반', type: 'int' },
      { key: 'number', header: '번호', type: 'int' },
      { key: 'name', header: '이름' },
      { header: '학번(참고)', derived: (r) => studentNo(r) },
    ],
  },
  {
    table: 'classrooms', tab: '학급', label: '학급(교실) 목록',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'grade', header: '학년', type: 'int' },
      { key: 'class_no', header: '반', type: 'int' },
      { key: 'location', header: '위치' },
      { key: 'homeroom_staff_id', header: '담임 성함', ref: 'staff' },
    ],
  },
  {
    table: 'classroom_tvs', tab: '반별TV', label: '반별 TV 브랜드',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'classroom_id', header: '학년-반', ref: 'classrooms' },
      { key: 'brand', header: 'TV브랜드' },
      { key: 'model', header: '모델명' },
      { key: 'memo', header: '비고' },
    ],
  },
  {
    table: 'tablet_cabinets', tab: '태블릿보관함', label: '태블릿 충전함(보관함)',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'classroom_id', header: '학년-반', ref: 'classrooms', note: '보유(예비) 보관함은 비워 둠' },
      { key: 'location', header: '위치' },
      { key: 'tablet_count', header: '태블릿 수량', type: 'int' },
      { key: 'password', header: '비번' },
      { key: 'memo', header: '기타 메모' },
    ],
  },
  {
    table: 'cyber_guardians', tab: '사이버지킴이', label: '반별 사이버 지킴이',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'classroom_id', header: '학년-반', ref: 'classrooms' },
      { key: 'student_id', header: '학번', ref: 'students' },
      { header: '이름(참고)', derived: (r, db) => db.students.find((s) => s.id === r.student_id)?.name ?? '' },
    ],
  },
  {
    table: 'goedu_teacher_accounts', tab: '교사goedu', label: 'Goedu 교사 가입현황',
    columns: [
      ID,
      { key: 'staff_id', header: '성함', ref: 'staff' },
      { key: 'account', header: '계정' },
    ],
  },
  {
    table: 'goedu_student_accounts', tab: '학생goedu', label: 'Goedu 학생 가입현황',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'student_id', header: '학번', ref: 'students' },
      { header: '이름(참고)', derived: (r, db) => db.students.find((s) => s.id === r.student_id)?.name ?? '' },
      { key: 'account', header: '계정' },
    ],
  },
  {
    table: 'laptops', tab: '노트북', label: '노트북 IP대장 (교원용 + 보유)',
    columns: [
      ID,
      { key: 'ip_address', header: 'IP주소' },
      { key: 'staff_id', header: '사용자', ref: 'staff', note: '비어 있으면 보유 노트북' },
      { key: 'position', header: '직위' },
      { key: 'location', header: '보유 위치' },
      { key: 'manufacturer', header: '제조사' },
      { key: 'model', header: '모델명' },
      { key: 'serial_no', header: '일련번호' },
      { key: 'purchase_date', header: '구입일자', type: 'date' },
      { key: 'memo', header: '비고' },
    ],
  },
  {
    table: 'tablets', tab: '보유태블릿', label: '보유 태블릿(예비)',
    columns: [
      ID,
      { key: 'location', header: '위치' },
      { key: 'manufacturer', header: '제조사' },
      { key: 'model', header: '태블릿 기종' },
      { key: 'serial_no', header: '일련번호' },
      { key: 'purchase_date', header: '구입일자', type: 'date' },
      { key: 'memo', header: '비고' },
    ],
  },
  {
    table: 'rentals', tab: '대여', label: '대여 기록 (노트북·태블릿·소모품·기타)',
    columns: [
      ID,
      { key: 'item_type', header: '구분', note: ITEM_TYPES.join(' / ') },
      { key: 'borrower_name', header: '대여자 성함', ref: 'staff', refKey: 'borrower_staff_id', note: '교직원이면 자동으로 연결' },
      { key: 'manufacturer', header: '제조사' },
      { key: 'model', header: '기종' },
      { key: 'item_name', header: '품목(소모품·기타)' },
      { key: 'rented_on', header: '대여 날짜', type: 'date' },
      { key: 'returned_on', header: '반납 날짜', type: 'date' },
      { key: 'checked_by_staff_id', header: '확인자', ref: 'staff' },
      { key: 'memo', header: '비고' },
    ],
  },
  {
    table: 'manuals', tab: '메뉴얼', label: '메뉴얼',
    columns: [
      ID,
      { key: 'category', header: '카테고리', note: MANUAL_CATEGORIES.join(' / ') },
      { key: 'title', header: '상황(제목)' },
      { key: 'body', header: '대처 방법', wide: true },
      { key: 'sort_order', header: '순서', type: 'int' },
    ],
  },
  {
    table: 'links', tab: '링크', label: '바로가기 링크 (시트·드라이브·에듀테크)',
    columns: [
      ID,
      { key: 'group_name', header: '그룹', note: LINK_GROUPS.join(' / ') },
      { key: 'key', header: '키', note: '앱이 참조하는 고정 이름(바꾸지 말 것)' },
      { key: 'label', header: '이름' },
      { key: 'url', header: 'URL', wide: true },
      { key: 'memo', header: '설명' },
    ],
  },
];

export const byTable = Object.fromEntries(TABLES.map((t) => [t.table, t]));

/** 학번 = 학년(1) + 반(2) + 번호(2) → 예: 2학년 10반 11번 = 21011 */
export function studentNo(s) {
  return `${s.grade}${String(s.class_no).padStart(2, '0')}${String(s.number).padStart(2, '0')}`;
}
export function parseStudentNo(no) {
  const m = String(no ?? '').trim().match(/^(\d)(\d{2})(\d{2})$/);
  if (!m) return null;
  return { grade: Number(m[1]), class_no: Number(m[2]), number: Number(m[3]) };
}
export function classroomKey(c) {
  return `${c.grade}-${c.class_no}`;
}

/**
 * 셀 편집: 열 정의(column) 하나를 table+field 로 찾는다. 없거나 id·참고용(derived) 열이면 null
 * (= 편집 불가). 표 화면의 "이 셀을 고칠 수 있나?" 판단과 서버의 검증이 이 함수 하나를 같이 쓴다.
 */
export function findEditableColumn(table, field) {
  const col = byTable[table]?.columns.find((c) => c.key === field);
  if (!col || col.key === 'id' || col.derived) return null;
  return col;
}

/**
 * 자연키 텍스트(성함/학번/학년-반)를 부모 테이블의 id 로 바꾼다. lookups 는 현재 상태의
 * { staff, students, classrooms } 배열(둘 다 최신 편집을 반영한 것이어야 한다). 못 찾으면 null.
 * netlify/functions/cell.mts(서버, Supabase 조회)와 src/lib/data.js(데모, 메모리 배열) 양쪽에서 쓴다.
 */
export function resolveRef(ref, text, year, lookups) {
  const v = String(text ?? '').trim();
  if (!v) return null;
  if (ref === 'staff') return (lookups.staff ?? []).find((s) => s.name === v)?.id ?? null;
  if (ref === 'students') {
    const p = parseStudentNo(v);
    if (!p) return null;
    return (lookups.students ?? []).find((s) => s.school_year === year && s.grade === p.grade && s.class_no === p.class_no && s.number === p.number)?.id ?? null;
  }
  if (ref === 'classrooms') {
    const key = v.replace(/\s/g, '').replace('학년', '-').replace('반', '');
    return (lookups.classrooms ?? []).find((c) => c.school_year === year && classroomKey(c) === key)?.id ?? null;
  }
  return null;
}
