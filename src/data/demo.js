/**
 * 데모 데이터 (앱 데모 모드 · 데모 시트 · seed.sql 공용)
 * 모든 값은 가짜다. 실제 학교 데이터는 구글 시트에만 두고 동기화한다.
 */
import { SCHOOL_YEAR, studentNo, UNIT_TABS, DEVICE_TABS } from '../../shared/sheet-schema.js';

// 결정적 난수 (매번 같은 데모 데이터)
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const DEMO_SHEET_ID = 'DEMO_SHEET_ID_REPLACE_ME';
const sheetUrl = (gid) => `https://docs.google.com/spreadsheets/d/${DEMO_SHEET_ID}/edit#gid=${gid}`;

/* ---------------- 교직원 ---------------- */
export const staff = [
  ['st-001', '교장실', '김하늘', '-', '교장', '3층 교장실', '700'],
  ['st-002', '교감실', '이바다', '-', '교감', '3층 교감실', '701'],
  ['st-003', '교무기획부', '박소나무', '수학', '부장', '3층 교무실', '710'],
  ['st-004', '교무기획부', '정은하', '국어', '교사', '3층 교무실', '711'],
  ['st-005', '정보과학부', '한나라', '정보', '부장', '4층 정보과학부', '739'],
  ['st-006', '정보과학부', '오하늘', '정보', '교사', '4층 정보과학부', '738'],
  ['st-007', '정보과학부', '윤재민', '과학', '교사', '4층 정보과학부', '737'],
  ['st-008', '1학년부', '강민준', '영어', '부장', '7층 1학년부', '750'],
  ['st-009', '1학년부', '서지우', '수학', '교사', '7층 1학년부', '751'],
  ['st-010', '1학년부', '임도윤', '사회', '교사', '7층 1학년부', '752'],
  ['st-011', '2학년부', '최나무', '기술가정', '교사', '4층 2학년부', '740'],
  ['st-012', '2학년부', '조서연', '영어', '부장', '4층 2학년부', '741'],
  ['st-013', '2학년부', '배하준', '체육', '교사', '4층 2학년부', '742'],
  ['st-014', '3학년부', '신예린', '국어', '부장', '6층 3학년부', '760'],
  ['st-015', '3학년부', '홍시우', '과학', '교사', '6층 3학년부', '761'],
  ['st-016', '3학년부', '문지호', '역사', '교사', '6층 3학년부', '762'],
  ['st-017', '연구부', '양채원', '음악', '부장', '3층 연구부', '720'],
  ['st-018', '인성생활부', '노준서', '도덕', '부장', '5층 인성생활부', '730'],
  ['st-019', '진로진학부', '송아린', '진로', '부장', '5층 진로진학부', '735'],
  ['st-020', '보건실', '권보람', '보건', '보건교사', '2층 보건실', '770'],
  ['st-021', '행정실', '장우진', '-', '행정실장', '3층 행정실', '780'],
  ['st-022', '행정실', '유가은', '-', '주무관', '3층 행정실', '781'],
  ['st-023', '도서관', '전다은', '-', '사서', '2층 도서관', '775'],
].map(([id, department, name, subject, position, location, extension]) => ({
  id, department, name, subject, position, location, homeroom: '', extension,
}));

const staffByName = Object.fromEntries(staff.map((s) => [s.name, s.id]));

/* ---------------- 학급 ---------------- */
const FLOOR_BY_GRADE = { 1: '7층', 2: '4층', 3: '6층' };
const HOMEROOM = {
  '1-1': '강민준', '1-2': '서지우', '1-3': '임도윤',
  '2-1': '최나무', '2-2': '조서연', '2-3': '배하준',
  '3-1': '신예린', '3-2': '홍시우', '3-3': '문지호',
};
// 교직원 표의 "담임" 열은 위 HOMEROOM 을 거꾸로 뒤집어 채운다 — 두 값이 어긋나지 않게 한곳에서만 정의
for (const [key, name] of Object.entries(HOMEROOM)) {
  const s = staff.find((x) => x.name === name);
  if (s) s.homeroom = key;
}

export const classrooms = [];
for (let grade = 1; grade <= 3; grade++) {
  for (let class_no = 1; class_no <= 10; class_no++) {
    const key = `${grade}-${class_no}`;
    classrooms.push({
      id: `cr-${SCHOOL_YEAR}-${key}`,
      school_year: SCHOOL_YEAR,
      grade, class_no,
      location: FLOOR_BY_GRADE[grade],
    });
  }
}

/* ---------------- 학생 ---------------- */
const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const GIVEN = ['서준', '하은', '도윤', '지우', '시우', '서연', '예준', '하린', '주원', '지민', '민준', '수아', '건우', '지아', '우진', '유나', '현우', '채원', '지호', '다은', '준서', '소율', '은우', '아린', '이준', '나윤', '유준', '시아', '선우', '연우'];
const rs = rng(20260301);
export const students = [];
for (const c of classrooms) {
  for (let number = 1; number <= 5; number++) {
    students.push(mkStudent(c.grade, c.class_no, number));
  }
}
// 검색 예시용 학번(21011 = 2학년 10반 11번)
students.push(mkStudent(2, 10, 11, '한별'));
function mkStudent(grade, class_no, number, name) {
  const s = { id: `stu-${SCHOOL_YEAR}-${grade}${String(class_no).padStart(2, '0')}${String(number).padStart(2, '0')}`,
    school_year: SCHOOL_YEAR, grade, class_no, number,
    name: name ?? SURNAMES[Math.floor(rs() * SURNAMES.length)] + GIVEN[Math.floor(rs() * GIVEN.length)] };
  return s;
}
const studentByNo = Object.fromEntries(students.map((s) => [studentNo(s), s.id]));

/* ---------------- 반별 TV ---------------- */
const TV = ['LG', '삼성', 'DW SUMMUS', '삼성'];
export const classroom_tvs = classrooms.map((c, i) => ({
  id: `tv-${c.grade}-${c.class_no}`,
  school_year: SCHOOL_YEAR,
  classroom_id: c.id,
  location: '', // 비워 두면 학급 위치를 그대로 쓴다(태블릿 보관함과 같은 방식)
  brand: TV[i % TV.length],
}));

/* ---------------- 태블릿 보관함 ---------------- */
const rc = rng(7);
/* ---------------- 반별 A/S ----------------
 * 학급마다 한 줄(위치만). HDMI·LAN·비고 기록은 아래 AS기록(as_logs)에 한 줄씩. */
export const classroom_as = classrooms.map((c) => ({
  id: `as-${c.grade}-${c.class_no}`, school_year: SCHOOL_YEAR, classroom_id: c.id, location: '',
}));

export const tablet_cabinets = classrooms.map((c) => ({
  id: `cab-${c.grade}-${c.class_no}`,
  school_year: SCHOOL_YEAR,
  classroom_id: c.id,
  location: c.location,
  tablet_count: c.grade === 2 && c.class_no === 5 ? 31 : 28 + Math.floor(rc() * 5),
  password: c.grade === 2 && c.class_no === 5 ? '1432' : String(1000 + Math.floor(rc() * 9000)),
  memo: '', // 반별 보관함의 비고는 AS기록(항목 충전함 비고)
  // 모델 정보는 충전함 줄마다(전자기기 → 태블릿 충전함 → 현황이 제조사·모델명·취득일자로 묶어 센다)
  usage: '학급용', manufacturer: '에이텍', model: 'TC-30', capacity: 30, purchase_date: '2022-03-02', in_use: 'o', usb_type: 'USB-C', reset_method: '전원 버튼 10초 누름', chromebook_ok: '가능',
}));
tablet_cabinets.push(
  { id: 'cab-spare-1', school_year: SCHOOL_YEAR, classroom_id: null, usage: '기타', manufacturer: '포유디지털', model: 'FD-32', capacity: 32, purchase_date: '2024-03-05', in_use: 'o', usb_type: 'USB-C', reset_method: '뒷면 리셋 버튼', chromebook_ok: '불가', location: '4층 정보과학부 창고', tablet_count: 12, password: '2580', memo: '예비 보관함 A (전입생·고장 교체용)' },
  { id: 'cab-spare-2', school_year: SCHOOL_YEAR, classroom_id: null, usage: '기타', manufacturer: '포유디지털', model: 'FD-32', capacity: 32, purchase_date: '2024-03-05', in_use: 'o', usb_type: 'USB-C', reset_method: '뒷면 리셋 버튼', chromebook_ok: '불가', location: '4층 정보과학부 창고', tablet_count: 0, password: '1379', memo: '예비 보관함 B (비어 있음, 충전 케이블 2개 불량)' },
  { id: 'cab-spare-3', school_year: SCHOOL_YEAR, classroom_id: null, usage: '기타', manufacturer: '포유디지털', model: 'FD-32', capacity: 32, purchase_date: '2024-03-05', in_use: 'o', usb_type: 'USB-C', reset_method: '뒷면 리셋 버튼', chromebook_ok: '불가', location: '2층 도서관', tablet_count: 10, password: '4680', memo: '도서관 수업용' },
);

/* ---------------- 사이버 지킴이 ---------------- */
export const cyber_guardians = classrooms.map((c) => {
  const number = ((c.grade + c.class_no) % 5) + 1;
  return {
    id: `cg-${c.grade}-${c.class_no}`,
    school_year: SCHOOL_YEAR,
    classroom_id: c.id,
    student_id: studentByNo[`${c.grade}${String(c.class_no).padStart(2, '0')}${String(number).padStart(2, '0')}`],
  };
});

/* ---------------- Goedu 계정 ---------------- */
const TEACHER_ACCOUNTS = {
  김하늘: 'principal', 이바다: 'vice', 박소나무: 'sonamu', 정은하: 'eunha', 한나라: 'hannara', 오하늘: 'ohaneul',
  윤재민: 'jaemin', 강민준: 'minjun', 서지우: 'jiwoo', 최나무: 'namu', 조서연: 'seoyeon', 신예린: 'yerin',
  홍시우: 'siwoo', 양채원: 'chaewon', 송아린: 'arin', 전다은: 'daeun',
};
export const goedu_teacher_accounts = Object.entries(TEACHER_ACCOUNTS).map(([name, local], i) => ({
  id: `gt-${String(i + 1).padStart(3, '0')}`,
  staff_id: staffByName[name],
  account: `${local}@demo-hs.goedu.kr`,
}));

const ra = rng(99);
export const goedu_student_accounts = students
  .filter(() => ra() < 0.8)
  .map((s) => ({
    id: `gs-${studentNo(s)}`,
    school_year: SCHOOL_YEAR,
    student_id: s.id,
    account: `st${studentNo(s)}@demo-hs.goedu.kr`,
  }));
/* ---------------- 전자기기 묶음 (보유 현황) ----------------
 * 용도 × 물품분류 × 제조사 × 모델 × 취득일자 한 줄. 숫자는 2026년 보유 현황표(제출 양식)와 똑같이 맞춰 뒀다:
 * 학생용 1,283 + 교원용 106 + 직원용 14 + 기타 28 = 1,431대. 개별 장비가 연결된 묶음(교원용 노트북 일부)은
 * 수량 칸 대신 개별 장비 개수가 쓰인다. 처분일이 있는 묶음은 보유 현황에서 빠진다(2025년에 폐기한 10대). */
const DEV = [
  // id, 용도, 물품분류, 설치장소, 제조사, 모델, 수량, 보관가능대수, 취득일자, 운영체제, 처분일, 비고
  ['dv-001', '학생용', '데스크톱', '컴퓨터실습실 외', '삼성', 'DM500', 4, null, '2019-03-02', 'Windows 10 Pro', '', '도서관 검색용'],
  ['dv-002', '학생용', '노트북', '', 'LG', '그램 14', 32, null, '2023-03-10', 'Windows 11 Pro', '', '컴퓨터실 2'],
  ['dv-003', '학생용', '노트북', '', '삼성', '갤럭시북2', 160, null, '2021-03-04', 'Windows 10 Pro', '', '이동식 보관함 5대'],
  ['dv-004', '학생용', '노트북', '', '삼성', '갤럭시북', 80, null, '2020-03-03', 'Windows 10 Pro', '', ''],
  ['dv-005', '학생용', '노트북', '', 'LG', '그램 15', 44, null, '2019-03-05', 'Windows 10 Pro', '', ''],
  ['dv-006', '학생용', '태블릿', '', '삼성', '갤럭시탭 S9 FE', 167, null, '2024-03-05', 'Android 14', '', ''],
  ['dv-007', '학생용', '태블릿', '', '삼성', '갤럭시탭 S8', 286, null, '2023-03-10', 'Android 13', '', ''],
  ['dv-008', '학생용', '태블릿', '', '삼성', '갤럭시탭 A8', 439, null, '2022-03-02', 'Android 12', '', ''],
  ['dv-009', '학생용', '태블릿', '', '삼성', '갤럭시탭 A7', 44, null, '2021-03-04', 'Android 11', '', ''],
  ['dv-010', '학생용', '태블릿', '', '애플', 'iPad 7세대', 27, null, '2019-03-05', 'iPadOS 16', '', ''],
  ['dv-011', '교원용', '데스크톱', '', '삼성', 'DM500', 1, null, '2024-03-05', 'Windows 11 Pro', '', '교무실'],
  ['dv-012', '교원용', '데스크톱', '', 'LG', '데스크탑 Z', 1, null, '2020-03-03', 'Windows 10 Pro', '', '행정실 옆'],
  ['dv-013', '교원용', '노트북', '', '삼성', '갤럭시북4', 0, null, '2025-03-04', 'Windows 11 Pro', '', '예비(개별 장비 연결)'],
  ['dv-014', '교원용', '노트북', '', 'LG', '그램 16', 10, null, '2025-03-04', 'Windows 11 Pro', '', ''],
  ['dv-015', '교원용', '노트북', '', '삼성', '갤럭시북4 Pro', 0, null, '2024-03-05', 'Windows 11 Pro', '', '정보과학부(개별 장비 연결)'],
  ['dv-016', '교원용', '노트북', '', 'LG', '그램 16', 0, null, '2024-03-05', 'Windows 11 Pro', '', '개별 장비 연결'],
  ['dv-017', '교원용', '노트북', '', 'LG', '그램 14', 4, null, '2024-03-05', 'Windows 11 Pro', '', ''],
  ['dv-018', '교원용', '노트북', '', '삼성', '갤럭시북3', 0, null, '2023-03-10', 'Windows 10 Pro', '', '개별 장비 연결'],
  ['dv-019', '교원용', '노트북', '', 'LG', '그램 16', 10, null, '2023-03-10', 'Windows 10 Pro', '', ''],
  ['dv-020', '교원용', '노트북', '', 'LG', '그램 14', 0, null, '2022-03-02', 'Windows 10 Pro', '', '개별 장비 연결'],
  ['dv-021', '교원용', '노트북', '', '삼성', '갤럭시북 Pro', 12, null, '2022-03-02', 'Windows 10 Pro', '', ''],
  ['dv-022', '교원용', '노트북', '', '삼성', '갤럭시북', 17, null, '2021-03-04', 'Windows 10 Pro', '', ''],
  ['dv-023', '교원용', '노트북', '', 'LG', '그램 15', 10, null, '2020-03-03', 'Windows 10 Pro', '', ''],
  ['dv-024', '교원용', '노트북', '', '삼성', '노트북9', 29, null, '2019-03-05', 'Windows 10 Pro', '', ''],
  ['dv-025', '직원용', '데스크톱', '', '삼성', 'DM500', 2, null, '2023-03-10', 'Windows 11 Pro', '', '행정실'],
  ['dv-026', '직원용', '데스크톱', '', '삼성', 'DM500', 3, null, '2022-03-02', 'Windows 10 Pro', '', '행정실'],
  ['dv-027', '직원용', '데스크톱', '', 'LG', '데스크탑 Z', 3, null, '2021-03-04', 'Windows 10 Pro', '', ''],
  ['dv-028', '직원용', '데스크톱', '', 'LG', '데스크탑 Z', 2, null, '2020-03-03', 'Windows 10 Pro', '', ''],
  ['dv-029', '직원용', '데스크톱', '', '삼성', 'DM300', 2, null, '2019-03-02', 'Windows 10 Pro', '', ''],
  ['dv-030', '직원용', '노트북', '', 'LG', '그램 15', 2, null, '2019-03-05', 'Windows 10 Pro', '', ''],
  ['dv-031', '기타', '데스크톱', '', '삼성', 'DM300', 11, null, '2019-03-02', 'Windows 10 Pro', '', '방송실·보건실 등'],
  ['dv-032', '기타', '노트북', '', 'LG', '그램 15', 1, null, '2019-03-05', 'Windows 10 Pro', '', '방송실'],
  ['dv-033', '기타', '기타', '', '네이버클라우드', '클라우드 PC', 16, null, '2019-03-02', '', '', '클라우드 PC 계정'],
  ['dv-036', '교원용', '노트북', '', '삼성', '노트북5', 6, null, '2018-03-05', 'Windows 10', '2025-11-20', '2025년 폐기'],
  ['dv-037', '기타', '데스크톱', '', '삼성', 'DM300', 4, null, '2018-03-02', 'Windows 7', '2025-10-15', '2025년 폐기'],
];
export const devices = DEV.map(([id, usage, item_category, place, manufacturer, model, quantity, capacity, purchase_date, os, disposed_on, memo]) => (
  { id, usage, item_category, place, manufacturer, model, quantity, capacity, usb_type: null, reset_method: null, chromebook_ok: null, purchase_date, os, disposed_on, memo }));

/* ---------------- 전자기기 개별 장비 (노트북 IP대장) ----------------
 * 묶음 ID 로 위 표에 연결된다. 사용자가 비어 있으면 보유(예비). */
export const device_units = [
  // id, 묶음, 관리번호, 일련번호, 사용자, IP, 위치, 취득일자, OS, 상태, 비고
  ['lt-001', 'dv-015', '2024-NB-001', 'SB4P-2401-011', '한나라', '10.20.4.11', '4층 정보과학부', '2024-03-05', 'Windows 11 Pro', '사용 중', ''],
  ['lt-002', 'dv-015', '2024-NB-002', 'SB4P-2401-012', '오하늘', '10.20.4.12', '4층 정보과학부', '2024-03-05', 'Windows 11 Pro', '사용 중', ''],
  ['lt-003', 'dv-016', '2024-NB-003', 'LG16-2403-013', '윤재민', '10.20.4.13', '4층 정보과학부', '2024-03-05', 'Windows 11 Pro', '사용 중', ''],
  ['lt-004', 'dv-016', '2024-NB-004', 'LG16-2403-021', '강민준', '10.20.7.21', '7층 1학년부', '2024-03-05', 'Windows 11 Pro', '사용 중', ''],
  ['lt-005', 'dv-016', '2024-NB-005', 'LG16-2403-022', '서지우', '10.20.7.22', '7층 1학년부', '2024-03-05', 'Windows 11 Pro', '수리 중', '키보드 A키 불량 → 교체 예정'],
  ['lt-006', 'dv-018', '2023-NB-001', 'SB3-2303-031', '최나무', '10.20.4.31', '4층 2학년부', '2023-03-10', 'Windows 10 Pro', '사용 중', ''],
  ['lt-007', 'dv-018', '2023-NB-002', 'SB3-2303-041', '신예린', '10.20.6.41', '6층 3학년부', '2023-03-10', 'Windows 10 Pro', '사용 중', ''],
  ['lt-008', 'dv-020', '2022-NB-001', 'LG14-2203-051', '박소나무', '10.20.3.51', '3층 교무실', '2022-03-02', 'Windows 10 Pro', '사용 중', ''],
  ['lt-009', 'dv-013', '2025-NB-001', 'SB4-2503-091', null, '10.20.4.91', '4층 정보과학부 창고', '2025-03-04', 'Windows 11 Pro', '보유(예비)', '예비 1'],
  ['lt-010', 'dv-013', '2025-NB-002', 'SB4-2503-092', null, '10.20.4.92', '4층 정보과학부 창고', '2025-03-04', 'Windows 11 Pro', '보유(예비)', '예비 2'],
  ['lt-011', 'dv-020', '2022-NB-002', 'LG14-2203-093', null, '10.20.4.93', '4층 정보과학부 창고', '2022-03-02', 'Windows 10 Pro', '보유(예비)', '예비 3 (배터리 교체 필요)'],
  ['lt-012', 'dv-020', '2022-NB-003', 'LG14-2203-061', null, '10.20.2.61', '2층 도서관', '2022-03-02', 'Windows 10 Pro', '사용 중', '도서관 공용'],
].map(([id, batch_id, asset_no, serial_no, user, ip_address, location, purchase_date, os, status, memo]) => ({
  id, batch_id, asset_no, serial_no, staff_id: user ? staffByName[user] : null, ip_address, location, purchase_date, os, status, memo,
}));

/* ---------------- AS기록 ----------------
 * 반별 TV·충전함 비고, 반별 A/S(HDMI·LAN·비고), 장비 A/S 를 한 줄에 하나씩(날짜·대상·항목·내용). */
const classId = (key) => `cr-${SCHOOL_YEAR}-${key}`;
export const as_logs = [
  // id, 날짜, 학년-반, 개별 장비 ID, 항목, 내용
  ['log-001', '2026-05-12', '1-4', null, 'TV 비고', '리모컨 건전지 교체'],
  ['log-002', '2026-05-12', '2-1', null, 'TV 비고', '리모컨 건전지 교체'],
  ['log-003', '2026-05-12', '2-8', null, 'TV 비고', '리모컨 건전지 교체'],
  ['log-004', '2026-05-12', '3-5', null, 'TV 비고', '리모컨 건전지 교체'],
  ['log-005', '2026-09-08', '1-3', null, 'HDMI', '화면 안 나옴, 케이블 교체'],
  ['log-006', '2026-09-21', '2-5', null, 'LAN', '인터넷 끊김, 벽 단자 점검 요청'],
  ['log-007', '2026-09-28', '2-5', null, 'LAN', '단자 교체 완료'],
  ['log-008', '2026-10-01', '3-2', null, 'HDMI', 'HDMI 단자 헐거움'],
  ['log-009', '2026-10-01', '3-2', null, '반별 A/S 비고', 'A/S 업체 방문 예정'],
  ['log-010', '2026-09-24', null, 'lt-005', '장비 A/S', '키보드 A키 불량 접수'],
  ['log-011', '2026-09-30', null, 'lt-005', '장비 A/S', '제조사 A/S 센터 입고'],
  ['log-012', '2026-08-29', null, 'lt-011', '장비 A/S', '배터리 부풀음 확인, 교체 요청'],
].map(([id, logged_on, cls, unit_id, item, body]) => ({
  id, logged_on, school_year: cls ? SCHOOL_YEAR : null, classroom_id: cls ? classId(cls) : null, unit_id, item, body,
}));

/* ---------------- 보유 현황 제출본 ----------------
 * 2025년에 제출한 집계표 숫자 그대로(구입연도 구간 7줄). 이후 데이터가 바뀌어도 이 숫자는 안 바뀐다. */
const SNAP_2025 = [
  // 구간순번, 구입연도, 학생[실습실,실습실외,노트북,태블릿,기타], 교원[데,노,태,기], 직원[데,노,태,기], 기타[데,노,태,기]
  [1, '24.1.1~24.12.31', [0, 0, 0, 167, 0], [1, 9, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
  [2, '23.1.1~23.12.31', [0, 0, 32, 286, 0], [0, 12, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0]],
  [3, '22.1.1~22.12.31', [0, 0, 0, 439, 0], [0, 15, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
  [4, '21.1.1~21.12.31', [0, 0, 160, 44, 0], [0, 17, 0, 0], [3, 0, 0, 0], [0, 0, 0, 0]],
  [5, '20.1.1~20.12.31', [0, 0, 80, 0, 0], [1, 10, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0]],
  [6, '19.1.1~19.12.31', [0, 2, 44, 27, 0], [0, 13, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
  [7, '~18.12.31', [0, 2, 0, 0, 0], [0, 22, 0, 0], [1, 1, 0, 0], [15, 1, 0, 16]],
];
export const inventory_snapshots = SNAP_2025.map(([band, band_label, s, t, f, e]) => ({
  id: `snap-2025-${band}`, year: 2025, band, band_label,
  student_lab: s[0], student_other: s[1], student_laptop: s[2], student_tablet: s[3], student_etc: s[4],
  teacher_desktop: t[0], teacher_laptop: t[1], teacher_tablet: t[2], teacher_etc: t[3],
  staff_desktop: f[0], staff_laptop: f[1], staff_tablet: f[2], staff_etc: f[3],
  etc_desktop: e[0], etc_laptop: e[1], etc_tablet: e[2], etc_etc: e[3],
  frozen_on: '2025-12-18', frozen_by: '한나라',
}));

/* ---------------- 대여 기록 ----------------
 * borrower: 교직원 대여면 성함, 학생 대여면 빈칸으로 두고 studentNo 에 학번(예: 21011)을 적는다.
 * 태블릿의 manufacturer 는 이제 삼성/레노버/포유디지털/기타 중 하나만 쓴다(대여 화면 드롭다운과 맞춤).
 * 기타(item_name 있는 행)는 화면에서 제조사·모델을 더는 안 보여주므로 비워 둔다. */
export const rentals = [
  ['rt-001', '태블릿', '최나무', '', '삼성', '갤럭시탭 S9 FE', '', '2026-03-09', '', '한나라', '수업용 장기 대여'],
  ['rt-002', '태블릿', '조서연', '', '기타', 'iPad 10세대', '', '2026-03-12', '2026-06-30', '오하늘', ''],
  ['rt-003', '태블릿', '강민준', '', '삼성', '갤럭시탭 S9 FE', '', '2026-04-01', '', '한나라', ''],
  ['rt-004', '태블릿', '송아린', '', '삼성', '갤럭시탭 A8', '', '2026-05-20', '2026-05-27', '오하늘', '진로 박람회'],
  ['rt-005', '노트북', '양채원', '', '삼성', '갤럭시북4', '', '2026-04-14', '2026-04-18', '한나라', '음악회 영상 편집'],
  ['rt-006', '노트북', '노준서', '', 'LG', '그램 14', '', '2026-06-02', '', '오하늘', ''],
  ['rt-007', '노트북', '권보람', '', '삼성', '갤럭시북4', '', '2026-09-01', '', '한나라', '보건실 노트북 수리 중 대체'],
  ['rt-011', '기타', '배하준', '', '', '', '블루투스 스피커', '2026-05-15', '2026-05-16', '한나라', '체육대회'],
  ['rt-012', '기타', '정은하', '', '', '', '이동식 빔프로젝터', '2026-09-22', '', '오하늘', '독서 토론회'],
  // 학생 대여(태블릿)
  ['rt-013', '태블릿', '', '10101', '삼성', '갤럭시탭 S9 FE', '', '2026-04-10', '', '오하늘', ''],
  ['rt-014', '태블릿', '', '20302', '레노버', '탭 M10', '', '2026-05-02', '2026-05-20', '윤재민', '수업 발표용'],
  ['rt-015', '태블릿', '', '30105', '포유디지털', '포유탭 프로', '', '2026-09-05', '', '한나라', ''],
  // 학생 대여(기타)
  ['rt-016', '기타', '', '10203', '', '', '계산기', '2026-03-20', '2026-03-21', '윤재민', ''],
  ['rt-017', '기타', '', '20504', '', '', '보조배터리', '2026-06-01', '', '오하늘', ''],
].map(([id, item_type, borrower, studentNoText, manufacturer, model, item_name, rented_on, returned_on, checker, memo]) => {
  const borrowerStudentId = studentNoText ? studentByNo[studentNoText] : null;
  const borrowerStudent = borrowerStudentId ? students.find((s) => s.id === borrowerStudentId) : null;
  return {
    id, item_type,
    borrower_staff_id: borrower ? (staffByName[borrower] ?? null) : null,
    borrower_student_id: borrowerStudentId,
    borrower_name: borrower || borrowerStudent?.name || '',
    manufacturer, model, item_name,
    rented_on, returned_on: returned_on || null,
    checked_by_staff_id: staffByName[checker] ?? null,
    memo,
  };
});

/* ---------------- 메뉴얼 ---------------- */
export const manuals = [
  ['WiFi', '교실 WiFi가 안 잡힐 때', '1. 교실 천장의 AP(둥근 흰색 기기) 불빛 확인 — 꺼져 있으면 4층 정보과학부에 연락(내선 739).\n2. 불빛은 켜져 있는데 안 잡히면 기기의 WiFi를 껐다 켜고 "SCHOOL-STAFF" 다시 선택.\n3. 여러 교실이 동시에 안 되면 3층 통신실 스위치 문제 → 정보과학부에 연락.', 1],
  ['WiFi', '학생용 WiFi 비밀번호를 물어볼 때', '학생용 SSID는 "SCHOOL-STUDENT". 비밀번호는 학기 초 담임 선생님께 전달된 안내문 참고. 분실 시 정보과학부에 문의(내선 739).', 2],
  ['노트북', '크롬북에 초기화가 필요한 경우', 'Ctrl + Shift + R 을 눌러 Powerwash 한다. 초기화 후 학교 goedu 계정으로 다시 로그인한다.', 1],
  ['노트북', '교원용 노트북이 학교 인터넷에 안 붙을 때', '1. 노트북 IP가 IP대장과 같은지 확인(전자기기 → 노트북 → 교원용 노트북).\n2. 유선이면 랜선을 다른 포트에 꽂아 본다.\n3. 그래도 안 되면 정보과학부에 IP대장 확인 요청.', 2],
  ['노트북', '노트북을 빌리러 온 선생님이 있을 때', '대여 메뉴 → 노트북 에서 대여자 성함·제조사·대여 날짜를 기록하고, 4층 정보과학부 창고의 예비 노트북(IP대장의 "보유 노트북")을 내어 준다. 반납 시 반납 날짜를 기록.', 3],
  ['태블릿', '학생 태블릿이 켜지지 않을 때', '1. 전원 버튼 10초 이상 길게 눌러 강제 재부팅.\n2. 충전함에 꽂아 30분 충전 후 재시도.\n3. 그래도 안 되면 예비 태블릿(보유 태블릿)으로 교체하고 고장 기기는 정보과학부로 가져온다.', 1],
  ['태블릿', '전입생에게 태블릿을 배부해야 할 때', '1. Goedu 계정이 있는지 확인(Goedu → 학생 가입현황에서 학번 검색).\n2. 계정이 없으면 Goedu → 관리자 메뉴얼(메뉴얼의 Goedu 카테고리) "담임 선생님께 드릴 파일" 글의 첫 번째 zip 링크를 담임 선생님께 드린다.\n3. 예비 보관함(보유 태블릿 보관함)에서 태블릿을 꺼내 반 보관함으로 옮기고 수량을 시트에 반영.', 2],
  ['태블릿 충전함', '충전함 건전지가 다 되어서 안 열릴 경우', '3층 등사실에서 드라이버를 빌리고, 3층 행정실에서 9V 건전지를 빌린 후 해당 반에 가서 건전지를 가져다 대어 비상 충전하여 연다.', 1],
  ['태블릿 충전함', '충전함 비밀번호를 잊었을 때', '반별 관리 → 반별 태블릿과 태블릿 충전함 에서 해당 반의 비번을 확인한다. 비번을 바꿨다면 반드시 시트에 반영.', 2],
  ['태블릿 충전함', '충전함에 꽂아도 충전이 안 될 때', '1. 충전함 뒤쪽 전원 플러그와 멀티탭 스위치 확인.\n2. 특정 칸만 안 되면 케이블 불량 → 예비 케이블(4층 정보과학부 창고)로 교체.', 3],
  ['전자 소모품', '케이블·허브·프레젠터를 빌려줄 때', '대여 메뉴 → 기타 전자기기 에서 성함·품목·대여 날짜를 기록. 반납되면 반납 여부를 "반납 완료"로 바꾼다.', 1],
  ['전자 소모품', '소모품 재고가 떨어졌을 때', '품의 방법 카테고리를 참고해 품의를 올린다. 케이블류는 최소 5개 이상 남았을 때 미리 주문.', 2],
  ['품의 방법', '전자기기·소모품 품의 올리는 순서', '1. 나이스(K-에듀파인) → 품의 등록.\n2. 품명·규격·수량·단가·업체 견적서 첨부.\n3. 정보과학부장 → 행정실 결재.\n4. 납품 후 검수 사진과 함께 검수 조서 작성.', 1],
  ['품의 방법', '50만 원 이상 품의 시 주의', '2개 이상 업체 견적 비교가 필요하다. 행정실(내선 780)에 사전 문의.', 2],
  ['기타', '교실 TV(전자칠판)가 안 켜질 때', '1. 리모컨 건전지 교체(행정실에서 AAA 건전지 수령).\n2. TV 본체 옆 전원 버튼으로 직접 켜 본다.\n3. 반별 관리 → 반별 TV 브랜드 에서 브랜드를 확인하고 해당 브랜드 A/S에 접수.', 1],
  ['기타', '학교 공용 메일 비밀번호가 필요할 때', '메뉴얼 → Goedu 카테고리의 "관리자 계정 · 학교 공용 메일" 글에 기록되어 있다. 직접 확인 불가 시 정보과학부장에게 문의.', 2],
  ['Goedu', 'Goedu 계정 비밀번호 초기화 요청이 왔을 때', '1. Google 관리 콘솔(admin.google.com)에 goedu 관리자 계정으로 접속한다.\n2. 사용자 목록에서 해당 계정을 찾아 비밀번호를 재설정한다.\n3. 임시 비밀번호는 본인에게만 전달하고, 첫 로그인 때 바꾸도록 안내한다.', 2],
  ['Goedu', '학생/교사가 본인의 Goedu 계정을 모를 때', '1. goedu 계정 관리자로 크롬에 접속한다 (시크릿 창 권장).\n2. 관리 콘솔에 들어간다.\n3. (이후 절차는 추후 보강)', 1],
  ['Goedu', '관리자 계정 · 학교 공용 메일', 'Goedu 계정 관리자 메일: admin@demo-hs.goedu.kr\nGoedu 관리자 비밀번호: (데모 값)\n학교 공용 메일 아이디: demo-hs@demo-hs.goedu.kr\n학교 공용 메일 비밀번호: (데모 값)', 0],
  ['Goedu', '담임 선생님께 드릴 파일', '1. goedu 계정이 없는 전입생의 태블릿 배부 전 담임 선생님께 드릴 파일 (zip)\nhttps://drive.google.com/file/d/DEMO_TRANSFER_ZIP/view\n\n2. 아직 goedu 계정이 없는 학생의 담임 선생님께 드릴 파일 (zip)\nhttps://drive.google.com/file/d/DEMO_NOACCOUNT_ZIP/view', 3],
].map(([category, title, body, sort_order], i) => ({ id: `mn-${String(i + 1).padStart(3, '0')}`, category, title, body, sort_order }));

/* ---------------- 에듀테크 (데모 값: 아이디·비밀번호·주소는 모두 가짜) ---------------- */
export const edutech_items = [
  ['ed-001', '구독', 'Padlet 학교 플랜', 'https://padlet.com', 'info-demo@demo-hs.goedu.kr', 'Padlet!2026', '수업 담벼락용. 학년 초에 학급별 보드를 만들어 안내', '2027-02-28', '연 480,000원', '담당 정보과학부'],
  ['ed-002', '구독', 'Kahoot! 교사 플랜', 'https://kahoot.com', 'kahoot-demo@demo-hs.goedu.kr', 'Kahoot!2026', '퀴즈 수업용. 동시 접속 50명까지', '2026-12-31', '연 360,000원', ''],
  ['ed-003', '구독', '클래스카드 학교 라이선스', 'https://www.classcard.net', 'classcard-demo', 'Cc!2026', '영어 단어 학습. 학생 계정은 자동으로 만들어짐', '2027-01-31', '연 600,000원', '영어과 요청'],
  ['ed-004', '기타', 'Google Classroom', 'https://classroom.google.com', '', '', 'goedu 계정으로 로그인', '', '무료', ''],
  ['ed-005', '기타', 'Canva for Education', 'https://www.canva.com/education', '', '', '교사 인증 후 무료로 사용', '', '무료', ''],
  ['ed-006', '기타', '하이클래스', 'https://www.hiclass.net', '', '', '학급 알림장', '', '무료', ''],
].map(([id, category, name, url, shared_id, password, guide, expires_on, price, memo]) => ({ id, category, name, url, shared_id, password, guide, expires_on: expires_on || null, price, memo }));

/* ---------------- 링크 ---------------- */
const SHEET_TABS = ['교직원', '학생', '학급', '반별TV', '태블릿보관함', '사이버지킴이', '교사goedu', '학생goedu', '노트북', '보유태블릿', '대여', '메뉴얼', '링크', ...Object.values(DEVICE_TABS), ...Object.values(UNIT_TABS), '에듀테크', '보유현황_제출본', '반별AS', 'AS기록', '안내'];
export const links = [
  ...SHEET_TABS.map((tab, i) => ({
    id: `lk-sheet-${i + 1}`, group_name: '시트', key: `sheet:${tab}`, label: `${tab} 시트`,
    url: sheetUrl(i), memo: '구글 시트 탭으로 이동',
  })),
  // 홈의 "업무 관리 사이트 바로가기". 주소는 시트의 링크 탭에서 바꾼다(MDM·GSMS 주소는 데모용 가짜).
  { id: 'lk-work-1', group_name: '업무 관리', key: 'work:google-admin', label: 'Google 관리자 콘솔', url: 'https://admin.google.com', memo: 'goedu 관리자 계정으로 로그인' },
  { id: 'lk-work-2', group_name: '업무 관리', key: 'work:mdm', label: 'MDM 관리 시스템', url: 'https://example.com/mdm', memo: '태블릿 원격 관리 (주소는 링크 탭에서 바꾸세요)' },
  { id: 'lk-work-3', group_name: '업무 관리', key: 'work:gsms', label: 'GSMS', url: 'https://example.com/gsms', memo: '(주소는 링크 탭에서 바꾸세요)' },
  { id: 'lk-drive-3', group_name: '드라이브', key: 'drive:staff-laptop-sheet', label: '교원용 노트북 관리 시트', url: sheetUrl(8), memo: '교원용 노트북 관리용 구글 시트 원본 (앱 화면에는 링크 없음)' },
  { id: 'lk-edu-1', group_name: '에듀테크', key: 'edutech:classroom', label: 'Google Classroom', url: 'https://classroom.google.com', memo: 'goedu 계정으로 로그인' },
  { id: 'lk-edu-2', group_name: '에듀테크', key: 'edutech:admin-console', label: 'Google 관리 콘솔', url: 'https://admin.google.com', memo: 'goedu 관리자 계정 필요' },
  { id: 'lk-edu-3', group_name: '에듀테크', key: 'edutech:padlet', label: 'Padlet', url: 'https://padlet.com', memo: '학교 계정 문의: 정보과학부' },
  { id: 'lk-edu-4', group_name: '에듀테크', key: 'edutech:canva', label: 'Canva for Education', url: 'https://www.canva.com/education', memo: '교사 인증 후 무료' },
  { id: 'lk-edu-5', group_name: '에듀테크', key: 'edutech:hiclass', label: '하이클래스', url: 'https://www.hiclass.net', memo: '학급 알림' },
];

/* ---------------- 데모 로그인 계정 ---------------- */
export const profiles = [
  { id: 'demo-admin', email: 'hannara@demo-hs.goedu.kr', name: '한나라', role: 'admin', approved: true, staff_id: 'st-005' },
  { id: 'demo-member', email: 'ohaneul@demo-hs.goedu.kr', name: '오하늘', role: 'member', approved: true, staff_id: 'st-006' },
  { id: 'demo-pending', email: 'pending@demo-hs.goedu.kr', name: '대기중', role: 'member', approved: false, staff_id: null },
];

export const db = {
  staff, students, classrooms, classroom_tvs, classroom_as, tablet_cabinets, cyber_guardians,
  goedu_teacher_accounts, goedu_student_accounts, devices, device_units, as_logs, inventory_snapshots, rentals, manuals, edutech_items, links,
  profiles,
};
export default db;
