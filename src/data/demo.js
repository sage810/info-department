/**
 * 데모 데이터 (앱 데모 모드 · 데모 시트 · seed.sql 공용)
 * 모든 값은 가짜다. 실제 학교 데이터는 구글 시트에만 두고 동기화한다.
 */
import { SCHOOL_YEAR, studentNo } from '../../shared/sheet-schema.js';

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
  id, department, name, subject, position, location, extension,
}));

const staffByName = Object.fromEntries(staff.map((s) => [s.name, s.id]));

/* ---------------- 학급 ---------------- */
const FLOOR_BY_GRADE = { 1: '7층', 2: '4층', 3: '6층' };
const HOMEROOM = {
  '1-1': '강민준', '1-2': '서지우', '1-3': '임도윤',
  '2-1': '최나무', '2-2': '조서연', '2-3': '배하준',
  '3-1': '신예린', '3-2': '홍시우', '3-3': '문지호',
};
export const classrooms = [];
for (let grade = 1; grade <= 3; grade++) {
  for (let class_no = 1; class_no <= 10; class_no++) {
    const key = `${grade}-${class_no}`;
    classrooms.push({
      id: `cr-${SCHOOL_YEAR}-${key}`,
      school_year: SCHOOL_YEAR,
      grade, class_no,
      location: FLOOR_BY_GRADE[grade],
      homeroom_staff_id: HOMEROOM[key] ? staffByName[HOMEROOM[key]] : null,
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
const TV = [['LG', '75UR340C'], ['삼성', 'BE75C-H'], ['LG', '86UR640S'], ['삼성', 'QB75C']];
export const classroom_tvs = classrooms.map((c, i) => ({
  id: `tv-${c.grade}-${c.class_no}`,
  school_year: SCHOOL_YEAR,
  classroom_id: c.id,
  brand: TV[i % TV.length][0],
  model: TV[i % TV.length][1],
  memo: i % 7 === 3 ? '리모컨 건전지 교체(2026-05)' : '',
}));

/* ---------------- 태블릿 보관함 ---------------- */
const rc = rng(7);
export const tablet_cabinets = classrooms.map((c) => ({
  id: `cab-${c.grade}-${c.class_no}`,
  school_year: SCHOOL_YEAR,
  classroom_id: c.id,
  location: c.location,
  tablet_count: c.grade === 2 && c.class_no === 5 ? 31 : 28 + Math.floor(rc() * 5),
  password: c.grade === 2 && c.class_no === 5 ? '1432' : String(1000 + Math.floor(rc() * 9000)),
  memo: '',
}));
tablet_cabinets.push(
  { id: 'cab-spare-1', school_year: SCHOOL_YEAR, classroom_id: null, location: '4층 정보과학부 창고', tablet_count: 12, password: '2580', memo: '예비 보관함 A (전입생·고장 교체용)' },
  { id: 'cab-spare-2', school_year: SCHOOL_YEAR, classroom_id: null, location: '4층 정보과학부 창고', tablet_count: 0, password: '1379', memo: '예비 보관함 B (비어 있음, 충전 케이블 2개 불량)' },
  { id: 'cab-spare-3', school_year: SCHOOL_YEAR, classroom_id: null, location: '2층 도서관', tablet_count: 10, password: '4680', memo: '도서관 수업용' },
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

/* ---------------- 노트북 IP대장 ---------------- */
export const laptops = [
  ['lt-001', '10.20.4.11', '한나라', '4층 정보과학부', '삼성', '갤럭시북4 Pro', 'SB4P-2401-011', '2024-03-05', ''],
  ['lt-002', '10.20.4.12', '오하늘', '4층 정보과학부', '삼성', '갤럭시북4 Pro', 'SB4P-2401-012', '2024-03-05', ''],
  ['lt-003', '10.20.4.13', '윤재민', '4층 정보과학부', 'LG', '그램 16', 'LG16-2403-013', '2024-03-05', ''],
  ['lt-004', '10.20.7.21', '강민준', '7층 1학년부', 'LG', '그램 16', 'LG16-2403-021', '2024-03-05', ''],
  ['lt-005', '10.20.7.22', '서지우', '7층 1학년부', 'LG', '그램 16', 'LG16-2403-022', '2024-03-05', '키보드 A키 불량 → 교체 예정'],
  ['lt-006', '10.20.4.31', '최나무', '4층 2학년부', '삼성', '갤럭시북3', 'SB3-2303-031', '2023-03-10', ''],
  ['lt-007', '10.20.6.41', '신예린', '6층 3학년부', '삼성', '갤럭시북3', 'SB3-2303-041', '2023-03-10', ''],
  ['lt-008', '10.20.3.51', '박소나무', '3층 교무실', 'LG', '그램 14', 'LG14-2203-051', '2022-03-02', ''],
  ['lt-009', '10.20.4.91', null, '4층 정보과학부 창고', '삼성', '갤럭시북4', 'SB4-2503-091', '2025-03-04', '예비 1'],
  ['lt-010', '10.20.4.92', null, '4층 정보과학부 창고', '삼성', '갤럭시북4', 'SB4-2503-092', '2025-03-04', '예비 2'],
  ['lt-011', '10.20.4.93', null, '4층 정보과학부 창고', 'LG', '그램 14', 'LG14-2203-093', '2022-03-02', '예비 3 (배터리 교체 필요)'],
  ['lt-012', '10.20.2.61', null, '2층 도서관', 'LG', '그램 14', 'LG14-2203-061', '2022-03-02', '도서관 공용'],
].map(([id, ip_address, user, location, manufacturer, model, serial_no, purchase_date, memo]) => ({
  id, ip_address,
  staff_id: user ? staffByName[user] : null,
  position: user ? staff.find((s) => s.name === user).position : '',
  location, manufacturer, model, serial_no, purchase_date, memo,
}));

/* ---------------- 보유 태블릿 ---------------- */
export const tablets = [
  ['tb-001', '4층 정보과학부 창고', '삼성', '갤럭시탭 S9 FE', 'GTS9-2503-001', '2025-03-04', ''],
  ['tb-002', '4층 정보과학부 창고', '삼성', '갤럭시탭 S9 FE', 'GTS9-2503-002', '2025-03-04', ''],
  ['tb-003', '4층 정보과학부 창고', '삼성', '갤럭시탭 S9 FE', 'GTS9-2503-003', '2025-03-04', '화면 보호필름 없음'],
  ['tb-004', '4층 정보과학부 창고', '애플', 'iPad 10세대', 'IPAD10-2403-004', '2024-03-05', ''],
  ['tb-005', '4층 정보과학부 창고', '애플', 'iPad 10세대', 'IPAD10-2403-005', '2024-03-05', ''],
  ['tb-006', '4층 정보과학부 창고', '삼성', '갤럭시탭 A8', 'GTA8-2203-006', '2022-03-02', '충전 불량 → 수리 대기'],
  ['tb-007', '2층 도서관', '삼성', '갤럭시탭 A8', 'GTA8-2203-007', '2022-03-02', '도서관 공용'],
  ['tb-008', '2층 도서관', '삼성', '갤럭시탭 A8', 'GTA8-2203-008', '2022-03-02', '도서관 공용'],
].map(([id, location, manufacturer, model, serial_no, purchase_date, memo]) => ({
  id, location, manufacturer, model, serial_no, purchase_date, memo,
}));

/* ---------------- 대여 기록 ---------------- */
export const rentals = [
  ['rt-001', '태블릿', '최나무', '삼성', '갤럭시탭 S9 FE', '', '2026-03-09', '', '한나라', '수업용 장기 대여'],
  ['rt-002', '태블릿', '조서연', '애플', 'iPad 10세대', '', '2026-03-12', '2026-06-30', '오하늘', ''],
  ['rt-003', '태블릿', '강민준', '삼성', '갤럭시탭 S9 FE', '', '2026-04-01', '', '한나라', ''],
  ['rt-004', '태블릿', '송아린', '삼성', '갤럭시탭 A8', '', '2026-05-20', '2026-05-27', '오하늘', '진로 박람회'],
  ['rt-005', '노트북', '양채원', '삼성', '갤럭시북4', '', '2026-04-14', '2026-04-18', '한나라', '음악회 영상 편집'],
  ['rt-006', '노트북', '노준서', 'LG', '그램 14', '', '2026-06-02', '', '오하늘', ''],
  ['rt-007', '노트북', '권보람', '삼성', '갤럭시북4', '', '2026-09-01', '', '한나라', '보건실 노트북 수리 중 대체'],
  ['rt-008', '소모품', '서지우', '', '', 'HDMI 케이블 2m', '2026-03-16', '2026-03-16', '오하늘', ''],
  ['rt-009', '소모품', '문지호', '', '', 'USB-C 허브', '2026-05-08', '', '한나라', ''],
  ['rt-010', '소모품', '임도윤', '', '', '무선 프레젠터', '2026-09-10', '2026-09-11', '오하늘', ''],
  ['rt-011', '기타', '배하준', '소니', '블루투스 스피커 SRS-XB', '블루투스 스피커', '2026-05-15', '2026-05-16', '한나라', '체육대회'],
  ['rt-012', '기타', '정은하', '캐논', '빔프로젝터 (이동식)', '이동식 빔프로젝터', '2026-09-22', '', '오하늘', '독서 토론회'],
].map(([id, item_type, borrower, manufacturer, model, item_name, rented_on, returned_on, checker, memo]) => ({
  id, item_type,
  borrower_staff_id: staffByName[borrower] ?? null,
  borrower_name: borrower,
  manufacturer, model, item_name,
  rented_on, returned_on: returned_on || null,
  checked_by_staff_id: staffByName[checker] ?? null,
  memo,
}));

/* ---------------- 메뉴얼 ---------------- */
export const manuals = [
  ['WiFi', '교실 WiFi가 안 잡힐 때', '1. 교실 천장의 AP(둥근 흰색 기기) 불빛 확인 — 꺼져 있으면 4층 정보과학부에 연락(내선 739).\n2. 불빛은 켜져 있는데 안 잡히면 기기의 WiFi를 껐다 켜고 "SCHOOL-STAFF" 다시 선택.\n3. 여러 교실이 동시에 안 되면 3층 통신실 스위치 문제 → 정보과학부에 연락.', 1],
  ['WiFi', '학생용 WiFi 비밀번호를 물어볼 때', '학생용 SSID는 "SCHOOL-STUDENT". 비밀번호는 학기 초 담임 선생님께 전달된 안내문 참고. 분실 시 정보과학부에 문의(내선 739).', 2],
  ['노트북', '크롬북에 초기화가 필요한 경우', 'Ctrl + Shift + R 을 눌러 Powerwash 한다. 초기화 후 학교 goedu 계정으로 다시 로그인한다.', 1],
  ['노트북', '교원용 노트북이 학교 인터넷에 안 붙을 때', '1. 노트북 IP가 IP대장과 같은지 확인(전자기기 → 노트북 → 교원용 노트북).\n2. 유선이면 랜선을 다른 포트에 꽂아 본다.\n3. 그래도 안 되면 정보과학부에 IP대장 확인 요청.', 2],
  ['노트북', '노트북을 빌리러 온 선생님이 있을 때', '대여 메뉴 → 노트북 에서 대여자 성함·제조사·대여 날짜를 기록하고, 4층 정보과학부 창고의 예비 노트북(IP대장의 "보유 노트북")을 내어 준다. 반납 시 반납 날짜를 기록.', 3],
  ['태블릿', '학생 태블릿이 켜지지 않을 때', '1. 전원 버튼 10초 이상 길게 눌러 강제 재부팅.\n2. 충전함에 꽂아 30분 충전 후 재시도.\n3. 그래도 안 되면 예비 태블릿(보유 태블릿)으로 교체하고 고장 기기는 정보과학부로 가져온다.', 1],
  ['태블릿', '전입생에게 태블릿을 배부해야 할 때', '1. Goedu 계정이 있는지 확인(Goedu → 학생 가입현황에서 학번 검색).\n2. 계정이 없으면 Goedu → 관리자 메뉴얼의 "goedu 계정이 없는 전입생" zip 파일을 담임 선생님께 드린다.\n3. 예비 보관함(보유 태블릿 보관함)에서 태블릿을 꺼내 반 보관함으로 옮기고 수량을 시트에 반영.', 2],
  ['태블릿 충전함', '충전함 건전지가 다 되어서 안 열릴 경우', '3층 등사실에서 드라이버를 빌리고, 3층 행정실에서 9V 건전지를 빌린 후 해당 반에 가서 건전지를 가져다 대어 비상 충전하여 연다.', 1],
  ['태블릿 충전함', '충전함 비밀번호를 잊었을 때', '반별 관리 → 반별 태블릿과 태블릿 충전함 에서 해당 반의 비번을 확인한다. 비번을 바꿨다면 반드시 시트에 반영.', 2],
  ['태블릿 충전함', '충전함에 꽂아도 충전이 안 될 때', '1. 충전함 뒤쪽 전원 플러그와 멀티탭 스위치 확인.\n2. 특정 칸만 안 되면 케이블 불량 → 예비 케이블(4층 정보과학부 창고)로 교체.', 3],
  ['전자 소모품', '케이블·허브·프레젠터를 빌려줄 때', '교직원별 관리 → 전자기기 소모품 에서 성함·품목·대여 날짜를 기록. 반납되면 반납 날짜를 기록한다.', 1],
  ['전자 소모품', '소모품 재고가 떨어졌을 때', '품의 방법 카테고리를 참고해 품의를 올린다. 케이블류는 최소 5개 이상 남았을 때 미리 주문.', 2],
  ['품의 방법', '전자기기·소모품 품의 올리는 순서', '1. 나이스(K-에듀파인) → 품의 등록.\n2. 품명·규격·수량·단가·업체 견적서 첨부.\n3. 정보과학부장 → 행정실 결재.\n4. 납품 후 검수 사진과 함께 검수 조서 작성.', 1],
  ['품의 방법', '50만 원 이상 품의 시 주의', '2개 이상 업체 견적 비교가 필요하다. 행정실(내선 780)에 사전 문의.', 2],
  ['기타', '교실 TV(전자칠판)가 안 켜질 때', '1. 리모컨 건전지 교체(행정실에서 AAA 건전지 수령).\n2. TV 본체 옆 전원 버튼으로 직접 켜 본다.\n3. 반별 관리 → 반별 TV 브랜드 에서 브랜드를 확인하고 해당 브랜드 A/S에 접수.', 1],
  ['기타', '학교 공용 메일 비밀번호가 필요할 때', 'Goedu → 관리자 메뉴얼 에 정보과학부 관리자만 볼 수 있게 기록되어 있다. 직접 확인 불가 시 정보과학부장에게 문의.', 2],
].map(([category, title, body, sort_order], i) => ({ id: `mn-${String(i + 1).padStart(3, '0')}`, category, title, body, sort_order }));

/* ---------------- 링크 ---------------- */
const SHEET_TABS = ['교직원', '학생', '학급', '반별TV', '태블릿보관함', '사이버지킴이', '교사goedu', '학생goedu', '노트북', '보유태블릿', '대여', '메뉴얼', '링크'];
export const links = [
  ...SHEET_TABS.map((tab, i) => ({
    id: `lk-sheet-${i + 1}`, group_name: '시트', key: `sheet:${tab}`, label: `${tab} 시트`,
    url: sheetUrl(i), memo: '구글 시트 탭으로 이동',
  })),
  { id: 'lk-drive-1', group_name: '드라이브', key: 'drive:transfer-student-zip', label: 'goedu 계정이 없는 전입생의 태블릿 배부 전 담임 선생님께 드릴 파일', url: 'https://drive.google.com/file/d/DEMO_TRANSFER_ZIP/view', memo: 'zip 다운로드' },
  { id: 'lk-drive-2', group_name: '드라이브', key: 'drive:no-account-zip', label: '아직 goedu 계정이 없는 학생의 담임 선생님께 드릴 파일', url: 'https://drive.google.com/file/d/DEMO_NOACCOUNT_ZIP/view', memo: 'zip 다운로드' },
  { id: 'lk-drive-3', group_name: '드라이브', key: 'drive:staff-laptop-sheet', label: '교원용 노트북 관리 시트', url: sheetUrl(8), memo: '교직원별 관리 → 노트북' },
  { id: 'lk-edu-1', group_name: '에듀테크', key: 'edutech:classroom', label: 'Google Classroom', url: 'https://classroom.google.com', memo: 'goedu 계정으로 로그인' },
  { id: 'lk-edu-2', group_name: '에듀테크', key: 'edutech:admin-console', label: 'Google 관리 콘솔', url: 'https://admin.google.com', memo: 'goedu 관리자 계정 필요' },
  { id: 'lk-edu-3', group_name: '에듀테크', key: 'edutech:padlet', label: 'Padlet', url: 'https://padlet.com', memo: '학교 계정 문의: 정보과학부' },
  { id: 'lk-edu-4', group_name: '에듀테크', key: 'edutech:canva', label: 'Canva for Education', url: 'https://www.canva.com/education', memo: '교사 인증 후 무료' },
  { id: 'lk-edu-5', group_name: '에듀테크', key: 'edutech:hiclass', label: '하이클래스', url: 'https://www.hiclass.net', memo: '학급 알림' },
];

/* ---------------- 관리자 전용 메모 (시트에는 넣지 않음, DB admin_notes) ---------------- */
export const admin_notes = [
  { key: 'goedu_admin_email', label: 'Goedu 계정 관리자 메일', value: 'admin@demo-hs.goedu.kr' },
  { key: 'goedu_admin_secret', label: 'Goedu 관리자 비밀번호', value: '(데모) 실제 값은 Supabase admin_notes 에만 저장' },
  { key: 'school_mail_id', label: '학교 공용 메일 아이디', value: 'demo-hs@demo-hs.goedu.kr' },
  { key: 'school_mail_secret', label: '학교 공용 메일 비밀번호', value: '(데모) 실제 값은 Supabase admin_notes 에만 저장' },
];

/* ---------------- 데모 로그인 계정 ---------------- */
export const profiles = [
  { id: 'demo-admin', email: 'hannara@demo-hs.goedu.kr', name: '한나라', role: 'admin', approved: true, staff_id: 'st-005' },
  { id: 'demo-member', email: 'ohaneul@demo-hs.goedu.kr', name: '오하늘', role: 'member', approved: true, staff_id: 'st-006' },
  { id: 'demo-pending', email: 'pending@demo-hs.goedu.kr', name: '대기중', role: 'member', approved: false, staff_id: null },
];

export const db = {
  staff, students, classrooms, classroom_tvs, tablet_cabinets, cyber_guardians,
  goedu_teacher_accounts, goedu_student_accounts, laptops, tablets, rentals, manuals, links,
  admin_notes, profiles,
};
export default db;
