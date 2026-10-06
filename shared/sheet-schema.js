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
 *   - options: 정해진 선택지가 있는 열. 시트 보호 스크립트(scripts/setup-sheet-guards.mjs)가 드롭다운 검증으로 건다.
 *     loose: true 면 목록 밖 값("직접 입력")도 허용하고, 아니면 목록 밖 값을 막는다.
 *   - 탭 이름(tab)이 곧 구글 시트의 시트 이름이다. 바꾸면 시트도 같이 바꿔야 한다.
 *   - 첫 열은 항상 ID. 사람이 비워 두면 동기화가 행 내용의 해시로 채운다.
 *   - ref 가 있는 열은 시트에는 "성함/학번/학년-반" 같은 자연키로 적고,
 *     동기화 때 부모 테이블의 id 로 바꿔 넣는다.
 *       ref: 'staff'      → 성함으로 staff.id 찾기
 *       ref: 'students'   → 학번(예: 21011) + 같은 행의 학년도로 students.id 찾기
 *       ref: 'classrooms' → "학년-반"(예: 2-5) + 같은 행의 학년도로 classrooms.id 찾기
 *   - derived 열은 시트에만 보이는 참고용(동기화 무시).
 *   - 학년도(school_year) 칸이 비어 있으면 동기화가 올해(SCHOOL_YEAR)로 처리한다(앱의 "추가"에서 비우면 올해인 것과 같다).
 *     비어도 되는 표(nullable: true — AS기록의 장비 기록)만 예외.
 *   - type: 'int' | 'date' | 'text'(기본)
 */

export const SCHOOL_YEAR = 2026;

export const ITEM_TYPES = ['노트북', '태블릿', '기타'];
/** 반별 관리 - 반별 TV 브랜드 화면의 TV브랜드 선택지 */
export const TV_BRANDS = ['삼성', 'DW SUMMUS', 'LG'];
/** 전자기기 묶음(보유_* 탭)의 고정 선택지. 화면에선 드롭다운 + "기타(직접 입력)", 집계표의 열은 이 값으로 나눈다. */
export const DEVICE_USAGES = ['학생용', '교원용', '직원용', '기타'];
export const DEVICE_CATEGORIES = ['데스크톱', '노트북', '태블릿', '태블릿보관함', '기타'];
export const DEVICE_PLACES = ['컴퓨터실습실', '컴퓨터실습실 외'];
/** 태블릿 충전함 사양의 선택지(보유_태블릿보관함 탭의 묶음 열) */
export const CHROMEBOOK_OK = ['가능', '불가'];
export const USB_TYPES = ['USB-C', 'Micro USB', 'Lightning'];
export const UNIT_STATUSES = ['사용 중', '보유(예비)', '수리 중', '폐기'];
export const MANUAL_CATEGORIES = ['WiFi', '프린터', 'A/S', '교실TV', '전입생', 'Goedu', '노트북', '태블릿', '태블릿 충전함', '전자 소모품', '품의 방법', '기타'];
/**
 * AS기록 탭의 "항목" 값. 날짜를 붙여 쌓는 기록 칸마다 하나 — 화면의 어느 칸에 묶여 보일지 정한다(src/lib/api/asLogs.js).
 * 학급 기록(학년-반)과 개별 장비 기록(개별 장비 ID) 두 갈래다.
 */
export const AS_LOG_ITEMS = ['TV 비고', '충전함 비고', 'HDMI', 'LAN', '반별 A/S 비고', '장비 A/S'];
export const LINK_GROUPS = ['시트', '드라이브', '에듀테크', '업무 관리'];
/** 에듀테크 표(에듀테크 탭)의 구분 값. 화면의 카테고리(구독 에듀테크 / 기타 에듀테크)가 이 값으로 나뉜다. */
export const EDUTECH_CATEGORIES = ['구독', '기타'];

/* ---------------- 메뉴얼 첨부파일 ----------------
 * 파일 본문은 Supabase Storage(manual-files)에 두고, 메뉴얼 행의 "첨부파일" 칸에는 줄마다
 *   파일ID|파일명|크기(바이트)
 * 로 적는다. 파일ID 는 저장소 안의 이름(한글·공백이 없는 임의 문자열 + 확장자)이고 파일명은 내려받을 때 쓰는 원래 이름이다.
 */
export const ATTACHMENT_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'hwpx', 'txt', 'csv', 'zip', '7z', 'png', 'jpg', 'jpeg', 'gif'];
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;

export const attachmentExt = (name) => /\.([A-Za-z0-9]+)$/.exec(String(name ?? ''))?.[1].toLowerCase() ?? '';
export const isAttachmentId = (id) => /^[a-z0-9]{8,40}\.[a-z0-9]{1,5}$/.test(String(id ?? ''));
export const cleanFileName = (name) => String(name ?? '').replace(/[|\r\n]+/g, '_').trim().slice(0, 120);

export function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

/** 올려도 되는 파일이면 '', 아니면 사용자에게 보여줄 이유 */
export function checkAttachment(name, size) {
  const ext = attachmentExt(name);
  if (!ATTACHMENT_EXTS.includes(ext)) return `"${cleanFileName(name)}" 은(는) 첨부할 수 없는 형식입니다. (${ATTACHMENT_EXTS.join(', ')})`;
  if (!(size > 0)) return `"${cleanFileName(name)}" 은(는) 빈 파일입니다.`;
  if (size > MAX_ATTACHMENT_BYTES) return `"${cleanFileName(name)}" 은(는) ${formatFileSize(MAX_ATTACHMENT_BYTES)} 를 넘습니다. (${formatFileSize(size)})`;
  return '';
}

/** 시트/DB 의 "첨부파일" 칸 텍스트 → [{ id, name, size }] */
export function parseAttachments(text) {
  return String(text ?? '').split(/\r?\n/).map((line) => {
    const p = line.split('|');
    if (p.length < 3) return null;
    const id = p[0].trim();
    const size = parseInt(p[p.length - 1], 10);
    const name = p.slice(1, -1).join('|').trim();
    return isAttachmentId(id) && name ? { id, name, size: Number.isNaN(size) ? 0 : size } : null;
  }).filter(Boolean);
}

/** [{ id, name, size }] → 시트/DB 의 "첨부파일" 칸 텍스트 (없으면 null) */
export function formatAttachments(list) {
  const lines = (list ?? []).map((a) => `${a.id}|${cleanFileName(a.name)}|${Number(a.size) || 0}`);
  return lines.length ? lines.join('\n') : null;
}

const ID = { key: 'id', header: 'ID', note: '비워 두면 자동 생성' };

/**
 * 개별 장비 탭: 묶음의 물품 분류명(devices.item_category) → 시트 탭. 개별 장비는 자기 묶음의 분류와 같은 탭에만 적을 수 있다.
 * 앱·서버가 "이 장비는 어느 탭에 있나"를 알 때(unitTab)는 항상 이 표를 거친다 — byTable.device_units.tab 은 쓰지 않는다.
 */
export const UNIT_TABS = {
  데스크톱: '전자기기_개별_데스크톱', // 순서 = 홈 시트 바로가기 칩·시트 탭 순서(보유_* 탭과 같은 순서)
  노트북: '전자기기_개별_노트북',
  태블릿: '전자기기_개별_태블릿',
  태블릿보관함: '전자기기_개별_태블릿보관함',
};
/** 개별 장비가 있는 묶음의 분류가 주어졌을 때 그 장비가 적힌 시트 탭. 개별 장비 탭이 없는 분류면 undefined. */
export const unitTab = (category) => UNIT_TABS[category];

/**
 * 보유 묶음(devices) 탭: 묶음의 물품 분류명 → 시트 탭. 네 분류 밖(기타·직접 입력한 분류)은 모두 보유_기타 탭에 적는다.
 * 묶음은 자기 분류와 같은 탭에만 적을 수 있다. 앱·서버는 "이 묶음은 어느 탭에 있나"를 항상 deviceTab 으로 구한다 — byTable.devices.tab 은 쓰지 않는다.
 */
export const DEVICE_TABS = {
  데스크톱: '보유_데스크톱',
  노트북: '보유_노트북',
  태블릿: '보유_태블릿',
  태블릿보관함: '보유_태블릿보관함',
  기타: '보유_기타',
};
export const deviceTab = (category) => DEVICE_TABS[category] ?? DEVICE_TABS.기타;

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
      { key: 'homeroom', header: '담임', note: '담임인 학급의 "학년-반" (예: 1-1, 2-11). 담임이 아니면 비워 둠' },
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
    // 담임은 여기 적지 않는다 — 교직원 탭의 "담임" 칸("학년-반") 하나로만 관리한다(두 곳에 적으면 어긋나서).
    table: 'classrooms', tab: '학급', label: '학급(교실) 목록',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'grade', header: '학년', type: 'int' },
      { key: 'class_no', header: '반', type: 'int' },
      { key: 'location', header: '위치' },
    ],
  },
  {
    table: 'classroom_tvs', tab: '반별TV', label: '반별 TV 브랜드',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'classroom_id', header: '학년-반', ref: 'classrooms' },
      { key: 'location', header: '위치', note: '비워 두면 학급 위치를 그대로 씁니다' },
      { key: 'brand', header: 'TV브랜드', note: TV_BRANDS.join(' / '), options: TV_BRANDS, loose: true },
    ],
  },
  {
    // 반별 A/S: A/S 기록을 볼 학급 목록. HDMI·LAN·비고 기록 자체는 AS기록 탭에 한 줄씩 쌓인다(항목 HDMI / LAN / 반별 A/S 비고).
    table: 'classroom_as', tab: '반별AS', label: '반별 A/S (HDMI·LAN)',
    columns: [
      ID,
      { key: 'school_year', header: '학년도', type: 'int' },
      { key: 'classroom_id', header: '학년-반', ref: 'classrooms' },
      { key: 'location', header: '위치', note: '비워 두면 학급 위치를 그대로 씁니다' },
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
      { key: 'memo', header: '기타 메모', note: '여유(예비) 보관함만. 반별 보관함의 비고는 AS기록 탭(항목: 충전함 비고)' },
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
  // 전자기기 묶음: 용도 × 물품분류 × 제조사 × 모델 × 취득일자 한 줄. "전체 전자기기 보유 현황" 집계표는 이 표만으로 계산한다.
  // 개별 장비(아래 표)가 연결된 묶음은 수량을 그 개수로 자동 계산하고, 없으면 수량 칸을 그대로 쓴다.
  // 분류(물품 분류명)마다 탭이 하나씩이고 열은 모두 같다. DB 표는 devices 하나라서 다섯 항목이 같은 table 을 가리킨다.
  ...Object.entries(DEVICE_TABS).map(([category, tab]) => ({
    table: 'devices', tab, deviceCategory: category, label: `전자기기 보유 묶음 — ${category}`,
    columns: [
      ID,
      { key: 'usage', header: '용도', note: DEVICE_USAGES.join(' / ') + ' (그 외는 직접 입력)', options: DEVICE_USAGES, loose: true },
      category === '기타'
        ? { key: 'item_category', header: '물품 분류명', note: '기타 또는 직접 입력한 분류(예: 프린터). 데스크톱·노트북·태블릿·태블릿보관함은 각자의 탭에 적는다', options: ['기타'], loose: true }
        : { key: 'item_category', header: '물품 분류명', note: `이 탭은 "${category}" 묶음만 적는다. 비우면 "${category}" 로 처리`, options: [category] },
      { key: 'place', header: '설치 장소', note: '데스크톱만: ' + DEVICE_PLACES.join(' / '), options: DEVICE_PLACES },
      { key: 'manufacturer', header: '제조사' },
      { key: 'model', header: '모델명' },
      { key: 'quantity', header: '수량', type: 'int', note: '개별 장비가 연결된 묶음은 자동 계산(이 칸 무시)' },
      { key: 'capacity', header: '보관 가능 대수', type: 'int', note: '태블릿 충전함만' },
      { key: 'usb_type', header: 'USB줄 타입', note: '태블릿 충전함만. 예: USB-C', options: USB_TYPES, loose: true },
      { key: 'reset_method', header: '초기화 방법', note: '태블릿 충전함만' },
      { key: 'chromebook_ok', header: '크롬북 가능 여부', note: '태블릿 충전함만. 가능 / 불가', options: CHROMEBOOK_OK },
      { key: 'purchase_date', header: '취득일자', type: 'date' },
      { key: 'os', header: '운영체제', note: '예: Windows 11 Pro' },
      { key: 'disposed_on', header: '처분일', type: 'date', note: '폐기한 묶음만. 적으면 보유 현황에서 빠짐' },
      { key: 'memo', header: '비고' },
    ],
  })),
  // 개별 장비: 한 대마다 한 줄. 묶음 ID 는 보유_* 탭의 ID 열 값을 그대로 적는다. (예전 "노트북 IP대장")
  // 종류(묶음의 물품 분류명)마다 탭이 하나씩이고 열은 모두 같다. DB 표는 device_units 하나라서 네 항목이 같은 table 을 가리킨다.
  ...Object.entries(UNIT_TABS).map(([category, tab]) => ({
    table: 'device_units', tab, unitCategory: category, label: `전자기기 개별 장비 — ${category}`,
    columns: [
      ID,
      { key: 'batch_id', header: '묶음 ID', note: `보유_${category} 탭의 ID (예: dv-021). 물품 분류명이 "${category}" 인 묶음만 적을 수 있다` },
      { key: 'asset_no', header: '관리번호' },
      { key: 'serial_no', header: '분류번호' },
      { key: 'staff_id', header: '사용자', ref: 'staff', note: '비어 있으면 보유(예비)' },
      { key: 'ip_address', header: 'IP주소' },
      { key: 'location', header: '위치' },
      { key: 'purchase_date', header: '취득일자', type: 'date', note: '비우면 묶음의 취득일자' },
      { key: 'os', header: '운영체제', note: '비우면 묶음의 운영체제' },
      { key: 'status', header: '상태', note: UNIT_STATUSES.join(' / '), options: UNIT_STATUSES },
      { key: 'memo', header: '비고' },
      { key: 'serial_number', header: '시리얼번호', note: '제조사 시리얼(분류번호와 다름)' },
    ],
  })),
  {
    // 날짜 기록: 반별 TV·충전함 비고, 반별 A/S(HDMI·LAN·비고), 장비 A/S 를 한 줄에 하나씩. 앱 화면은 같은 대상·항목의 줄을
    // 날짜순으로 묶어 "2026.10.02 내용" 줄로 보여 준다. 학급 기록은 학년도+학년-반, 장비 기록은 개별 장비 ID 를 적는다.
    table: 'as_logs', tab: 'AS기록', label: 'A/S·비고 날짜 기록',
    columns: [
      ID,
      { key: 'logged_on', header: '날짜', type: 'date', note: '비우면 날짜 없는 기록' },
      { key: 'school_year', header: '학년도', type: 'int', nullable: true, note: '학급 기록만' },
      { key: 'classroom_id', header: '학년-반', ref: 'classrooms', note: '학급 기록만 (예: 2-5)' },
      { key: 'unit_id', header: '개별 장비 ID', note: '장비 A/S 만. 전자기기_개별_* 탭의 ID (예: lt-005)' },
      { key: 'item', header: '항목', note: AS_LOG_ITEMS.join(' / '), options: AS_LOG_ITEMS },
      { key: 'body', header: '내용', wide: true },
    ],
  },
  {
    // 보유 현황 집계표(제출본): 연도마다 구입연도 구간 7줄. 장비 목록(보유_* 탭)과 따로 이 시트에서 관리하며, 앱에서 추가·수정·삭제한다.
    table: 'inventory_snapshots', tab: '보유현황_제출본', label: '전자기기 보유 현황 제출본',
    columns: [
      ID,
      { key: 'year', header: '제출 연도', type: 'int' },
      { key: 'band', header: '구간 순번', type: 'int', note: '1=최근1년이내 … 7=최근6년이전' },
      { key: 'band_label', header: '구입연도', note: '예: 24.1.1~24.12.31' },
      { key: 'student_lab', header: '학생용-실습실', type: 'int' },
      { key: 'student_other', header: '학생용-실습실외', type: 'int' },
      { key: 'student_laptop', header: '학생용-노트북', type: 'int' },
      { key: 'student_tablet', header: '학생용-태블릿', type: 'int' },
      { key: 'student_etc', header: '학생용-기타', type: 'int' },
      { key: 'teacher_desktop', header: '교원용-데스크톱', type: 'int' },
      { key: 'teacher_laptop', header: '교원용-노트북', type: 'int' },
      { key: 'teacher_tablet', header: '교원용-태블릿', type: 'int' },
      { key: 'teacher_etc', header: '교원용-기타', type: 'int' },
      { key: 'staff_desktop', header: '직원용-데스크톱', type: 'int' },
      { key: 'staff_laptop', header: '직원용-노트북', type: 'int' },
      { key: 'staff_tablet', header: '직원용-태블릿', type: 'int' },
      { key: 'staff_etc', header: '직원용-기타', type: 'int' },
      { key: 'etc_desktop', header: '기타-데스크톱', type: 'int' },
      { key: 'etc_laptop', header: '기타-노트북', type: 'int' },
      { key: 'etc_tablet', header: '기타-태블릿', type: 'int' },
      { key: 'etc_etc', header: '기타-기타', type: 'int' },
      { key: 'frozen_on', header: '고정일', type: 'date' },
      { key: 'frozen_by', header: '고정한 사람' },
    ],
  },
  {
    table: 'rentals', tab: '대여', label: '대여 기록 (노트북·태블릿·소모품·기타)',
    columns: [
      ID,
      { key: 'item_type', header: '구분', note: ITEM_TYPES.join(' / '), options: ITEM_TYPES },
      { key: 'borrower_name', header: '대여자 성함', ref: 'staff', refKey: 'borrower_staff_id', note: '교직원이면 자동으로 연결' },
      { key: 'borrower_student_id', header: '대여자 학번', ref: 'students', note: '학생 대여면 학번(예: 21011), 교직원 대여면 비워 둠' },
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
      { key: 'category', header: '카테고리', note: MANUAL_CATEGORIES.join(' / '), options: MANUAL_CATEGORIES },
      { key: 'title', header: '상황(제목)' },
      { key: 'body', header: '대처 방법', wide: true },
      { key: 'sort_order', header: '순서', type: 'int' },
      { key: 'attachments', header: '첨부파일', wide: true, note: '앱에서 올린 첨부파일 목록(줄마다 "파일ID|파일명|크기"). 시트에서 직접 고치지 말 것' },
    ],
  },
  {
    // 에듀테크: 구독(유료)과 기타(무료 등)를 한 표에 두고 구분 열로 나눈다. 공용 아이디·비밀번호는 시트에 그대로 적는다(태블릿 보관함 비번과 같은 방식).
    table: 'edutech_items', tab: '에듀테크', label: '에듀테크 (구독·기타)',
    columns: [
      ID,
      { key: 'category', header: '구분', note: EDUTECH_CATEGORIES.join(' / '), options: EDUTECH_CATEGORIES },
      { key: 'name', header: '에듀테크 이름' },
      { key: 'url', header: '사이트 주소', wide: true, note: '이름을 누르면 이 주소로 이동' },
      { key: 'shared_id', header: '공용 아이디' },
      { key: 'password', header: '비밀번호' },
      { key: 'guide', header: '안내사항', wide: true },
      { key: 'expires_on', header: '사용 기한', type: 'date' },
      { key: 'price', header: '가격' },
      { key: 'memo', header: '기타' },
    ],
  },
  {
    table: 'links', tab: '링크', label: '바로가기 링크 (시트·드라이브·에듀테크)',
    columns: [
      ID,
      { key: 'group_name', header: '그룹', note: LINK_GROUPS.join(' / '), options: LINK_GROUPS },
      { key: 'key', header: '키', note: '앱이 참조하는 고정 이름(바꾸지 말 것)' },
      { key: 'label', header: '이름' },
      { key: 'url', header: 'URL', wide: true },
      { key: 'memo', header: '설명' },
    ],
  },
];

/**
 * 시트 탭을 영역별로 묶은 것 — 탭 색·탭 순서·"안내" 탭의 탭 목차가 이걸 따른다(데모 xlsx: scripts/make-demo-sheet.mjs,
 * 실제 시트: scripts/setup-sheet-guards.mjs). 탭 이름 자체는 앱이 읽는 이름이라 바꾸지 않는다. 새 탭은 여기 한 영역에 넣는다.
 */
export const TAB_GROUPS = [
  { name: '학교 정보', color: '#4285F4', tabs: ['교직원', '학생', '학급', '사이버지킴이'] },
  { name: 'Goedu', color: '#12B5CB', tabs: ['교사goedu', '학생goedu'] },
  { name: '반별 관리', color: '#34A853', tabs: ['반별TV', '반별AS', '태블릿보관함', 'AS기록'] },
  { name: '전자기기', color: '#FA7B17', tabs: [...Object.values(DEVICE_TABS), ...Object.values(UNIT_TABS), '보유현황_제출본'] },
  { name: '운영', color: '#A142F4', tabs: ['대여', '메뉴얼', '에듀테크', '링크'] },
];
export const GUIDE_TAB = '안내';
export const GUIDE_TAB_COLOR = '#9AA0A6';
/** "안내" 탭에서 탭 목차 블록의 시작을 알리는 칸(A열) 글자 */
export const GUIDE_MARKER = '탭 목차';

// 같은 표를 가리키는 탭이 여럿이면(device_units) 첫 탭의 정의가 들어간다 — 열은 같지만 .tab 은 믿지 말고 unitTab 을 쓴다.
export const byTable = Object.fromEntries(TABLES.slice().reverse().map((t) => [t.table, t]));

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
/** 교직원의 "담임" 칸("1-2", "1학년 2반" 등)을 학급 키("1-2")로 맞춘다. 비었으면 '' */
export function homeroomKey(text) {
  return String(text ?? '').replace(/\s/g, '').replace('학년', '-').replace('반', '');
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

/** resolveRef 가 못 찾았을 때 사용자에게 보여줄 형식 안내. 데모(src/lib/data.js)와 서버(netlify/functions/cell.mts)가 같이 쓴다. */
export function refHint(ref) {
  if (ref === 'staff') return '교직원 탭의 성함과 똑같이 입력해 주세요.';
  if (ref === 'students') return '학번(학년+반 2자리+번호 2자리, 예: 21011)으로 입력해 주세요.';
  if (ref === 'classrooms') return '"학년-반" 형식(예: 2-5)으로 입력해 주세요.';
  return '';
}

/**
 * 표 화면의 "추가 / 삭제" 를 허용하는 표와 규칙. (셀 하나 고치기는 findEditableColumn 이 따로 맡는다.)
 * 새 표에 이 기능을 열려면 여기에 한 줄을 더하고, 삭제 때 따라 지워질 것이 있으면 서버(netlify/functions/row.mts)와
 * 데모(src/lib/data.js deleteRow) 양쪽의 연쇄 처리도 같이 맞춘다.
 *   prefix: 새 행 id 접두사
 *   required: 꼭 있어야 하는 열 key (참조 열은 "찾아져야" 한다)
 *   unique: 겹치면 안 되는 열 묶음의 목록. [['name']] = 성함 하나, [['school_year','classroom_id']] = 둘이 같이 같으면 겹침.
 *           묶음 안 값이 하나라도 비어 있으면 검사하지 않는다(예: 반에 배정 안 된 보관함).
 *   defaults: 비워서 보내면 채울 값
 * required 는 "서버가 최소한 지킬 것"이다. 화면(예: 반별 보관함 vs 보유 보관함)마다 더 엄격하게 요구하는 건 crud.required 로 따로 건다.
 */
export const CRUD_TABLES = {
  classroom_as: { prefix: 'as', required: ['classroom_id'], unique: [['school_year', 'classroom_id']] },
  students: { prefix: 'sd', required: ['grade', 'class_no', 'number', 'name'], unique: [['school_year', 'grade', 'class_no', 'number']] },
  staff: { prefix: 'st', required: ['name'], unique: [['name']] },
  goedu_teacher_accounts: { prefix: 'gt', required: ['staff_id', 'account'], unique: [['staff_id'], ['account']] },
  goedu_student_accounts: { prefix: 'gs', required: ['student_id', 'account'], unique: [['school_year', 'student_id'], ['account']] },
  classroom_tvs: { prefix: 'tv', required: ['classroom_id'], unique: [['school_year', 'classroom_id']] },
  tablet_cabinets: { prefix: 'tc', required: [], unique: [['school_year', 'classroom_id']], defaults: { tablet_count: 0 } },
  cyber_guardians: { prefix: 'cg', required: ['classroom_id', 'student_id'], unique: [['school_year', 'classroom_id', 'student_id']] },
  devices: { prefix: 'dv', required: ['item_category', 'quantity'] },
  device_units: { prefix: 'un', required: ['batch_id'], unique: [['asset_no']] },
  edutech_items: { prefix: 'ed', required: ['name'], unique: [['name']], defaults: { category: '구독' } },
  inventory_snapshots: { prefix: 'snap', required: ['year', 'band'], unique: [['year', 'band']] },
  as_logs: { prefix: 'log', required: ['item', 'body'] },
};

/**
 * 추가 폼에서 받은 { 열 key: 입력 문자열 } 을 새 행으로 다듬는다. 서버(row.mts)와 데모(data.js)가 같이 쓴다.
 *   existing: 지금 그 표의 행 목록(중복 검사용)
 *   lookups:  { staff, students, classrooms } — 참조 열(성함·학번·학년-반)을 id 로 바꿀 때 쓴다
 * 반환: { row, sheet } 또는 { error }.
 *   row   = DB 에 넣을 값(참조 열은 부모 id)
 *   sheet = { 시트 머리글: 시트에 적을 값 } (참조 열은 사람이 적은 자연키 그대로 — 동기화가 다시 id 로 바꾼다)
 */
let newRowSeq = 0;
export function prepareNewRow(table, values, existing = [], lookups = {}) {
  const rule = CRUD_TABLES[table], t = byTable[table];
  if (!rule || !t) return { error: '이 표는 행을 추가할 수 없습니다.' };
  const head = (k) => t.columns.find((c) => c.key === k)?.header ?? k;
  const row = { id: `${rule.prefix}-${Date.now().toString(36)}${(newRowSeq++ % 1296).toString(36).padStart(2, '0')}` };
  const sheet = { [head('id')]: row.id };

  // 학년도는 참조(학번·학년-반)를 풀 때 쓰므로 먼저 정한다. 비우면 올해.
  let year = SCHOOL_YEAR;
  if (t.columns.some((c) => c.key === 'school_year')) {
    const yt = String(values?.school_year ?? '').trim();
    if (yt) { year = parseInt(yt.replace(/[^\d]/g, ''), 10); if (Number.isNaN(year)) return { error: '학년도: 숫자만 입력하세요.' }; }
    row.school_year = year; sheet[head('school_year')] = year;
  }

  for (const c of t.columns) {
    if (!c.key || c.key === 'id' || c.key === 'school_year' || c.derived) continue;
    const text = String(values?.[c.key] ?? '').trim();
    if (c.ref) {
      if (c.refKey) return { error: '이 표에는 아직 추가를 지원하지 않는 참조 열이 있습니다.' };
      const id = text ? resolveRef(c.ref, text, year, lookups) : null;
      if (text && !id) return { error: `${c.header}: "${text}" 을(를) 찾지 못했습니다. ${refHint(c.ref)}` };
      row[c.key] = id; sheet[c.header] = text;
    } else if (c.type === 'int') {
      let n = text === '' ? null : parseInt(text.replace(/[^\d-]/g, ''), 10);
      if (text !== '' && Number.isNaN(n)) return { error: `${c.header}: 숫자만 입력하세요.` };
      if (n == null && rule.defaults && c.key in rule.defaults) n = rule.defaults[c.key];
      row[c.key] = n; sheet[c.header] = n ?? '';
    } else if (c.type === 'date') {
      if (text && !/^\d{4}-\d{2}-\d{2}$/.test(text)) return { error: `${c.header}: 날짜는 YYYY-MM-DD 형식으로 입력하세요.` };
      row[c.key] = text || null; sheet[c.header] = text;
    } else {
      row[c.key] = text || null; sheet[c.header] = text;
    }
  }

  for (const k of rule.required ?? []) {
    if (row[k] == null || row[k] === '') return { error: `${head(k)} 을(를) 입력하세요.` };
  }
  for (const keys of rule.unique ?? []) {
    if (keys.some((k) => row[k] == null || row[k] === '')) continue;
    if (existing.some((r) => keys.every((k) => r[k] === row[k]))) {
      const names = keys.filter((k) => k !== 'school_year').map(head).join('·');
      return { error: `이미 같은 ${names} 이(가) 있습니다.` };
    }
  }
  return { row, sheet };
}
