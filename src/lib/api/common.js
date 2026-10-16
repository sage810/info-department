// 데모·Supabase API 가 같이 쓰는 것: 표 조인(담임 정보·묶음·개별 장비·학급 행), 메뉴얼 첨부파일 공통, 오늘 날짜.
import { classroomKey, homeroomKey, attachmentExt, checkAttachment, cleanFileName, parseAttachments } from '../../../shared/sheet-schema.js';

/**
 * 학급 키("1-2") → 담임 정보. 담임은 학급 표가 아니라 교직원 검색의 "담임" 칸("1-2")을 읽어
 * 역으로 찾는다(같은 반 담임이 둘이면 쉼표로 이음). 반별 TV·태블릿 충전함·사이버지킴이 화면의
 * "함께 볼 데이터"(담임/담임 위치/내선 연락망)가 모두 이 매핑 하나를 같이 쓴다.
 */
export function homeroomInfoByKey(staff) {
  const byKey = {};
  for (const s of staff) {
    const k = homeroomKey(s.homeroom);
    if (k) (byKey[k] ??= []).push(s);
  }
  const out = {};
  for (const [k, list] of Object.entries(byKey)) {
    out[k] = {
      homeroom: list.map((s) => s.name).join(', '),
      homeroom_location: list.map((s) => s.location).filter(Boolean).join(', '),
      homeroom_extension: list.map((s) => s.extension).filter(Boolean).join(', '),
    };
  }
  return out;
}
export const EMPTY_HOMEROOM_INFO = { homeroom: '', homeroom_location: '', homeroom_extension: '' };

/**
 * 전자기기 묶음에 "실제 수량"을 붙인다. 개별 장비가 연결된 묶음은 폐기 아닌 개별 장비 개수가 수량이고
 * (unit_count > 0), 없으면 수량 칸 그대로. 보유 현황 집계표는 effective_quantity 만 읽는다.
 */
export function joinDevices(devices, units, cabinets = []) {
  const countByBatch = {};
  for (const u of units) if (u.status !== '폐기') countByBatch[u.batch_id] = (countByBatch[u.batch_id] ?? 0) + 1;
  const anyByBatch = {};
  for (const u of units) anyByBatch[u.batch_id] = (anyByBatch[u.batch_id] ?? 0) + 1;
  // 태블릿 충전함 묶음: 그 묶음을 가리키는 충전함(태블릿보관함 탭의 줄) 수가 수량이다
  for (const k of cabinets) if (k.batch_id) { countByBatch[k.batch_id] = (countByBatch[k.batch_id] ?? 0) + 1; anyByBatch[k.batch_id] = (anyByBatch[k.batch_id] ?? 0) + 1; }
  return devices.map((d) => {
    const unit_count = anyByBatch[d.id] ?? 0;
    return { ...d, unit_count, effective_quantity: unit_count ? (countByBatch[d.id] ?? 0) : (d.quantity ?? 0) };
  });
}
/** 태블릿 충전함 한 대에 그 묶음(모델)의 제조사·모델명·충전가능대수·취득일자·사용여부·A/S 연락처를 붙인다. 묶음이 없으면 빈 값. */
export function joinCabinets(rows, devices) {
  const byBatch = Object.fromEntries(devices.map((d) => [d.id, d]));
  return rows.map((k) => {
    const b = byBatch[k.batch_id] ?? {};
    return { ...k, manufacturer: b.manufacturer ?? '', model: b.model ?? '', capacity: b.capacity ?? null, purchase_date: b.purchase_date ?? '',
      in_use: b.in_use ?? '', as_contact: b.as_contact ?? '', usb_type: b.usb_type ?? '', reset_method: b.reset_method ?? '', chromebook_ok: b.chromebook_ok ?? '' };
  });
}
/** 개별 장비에 묶음(제조사/모델/분류/용도·충전함 사양, 취득일자·OS 는 비었을 때만)과 사용자(성함/부서/직위)를 붙인다. */
export function joinUnits(units, devices, staff) {
  const byBatch = Object.fromEntries(devices.map((d) => [d.id, d]));
  const byStaff = Object.fromEntries(staff.map((s) => [s.id, s]));
  return units.map((u) => {
    const b = byBatch[u.batch_id] ?? {}; const s = byStaff[u.staff_id] ?? {};
    return {
      ...u,
      manufacturer: b.manufacturer ?? '', model: b.model ?? '', item_category: u.category || b.item_category || '', usage: b.usage ?? '', capacity: b.capacity ?? null, // 종류는 장비에 적힌 것이 먼저(묶음 없는 장비)
      usb_type: b.usb_type ?? '', reset_method: b.reset_method ?? '', chromebook_ok: b.chromebook_ok ?? '',
      purchase_date: u.purchase_date || b.purchase_date || '', os: u.os || b.os || '',
      user_name: s.name ?? '', department: s.department ?? '', position: s.position ?? '',
    };
  });
}

/**
 * 반별 담임 & 사이버지킴이: 학급마다 한 줄(사이버 지킴이가 여럿이면 지킴이마다 한 줄, 없으면 빈 칸 한 줄).
 * 담임 칸에는 학년도가 없으므로 가장 최근 학년도의 학급에만 붙인다.
 */
export function joinClassRows(classrooms, guardians, staff) {
  const year = Math.max(...classrooms.map((c) => c.school_year));
  const infoByKey = homeroomInfoByKey(staff);
  const guardiansByKey = {};
  for (const g of guardians) (guardiansByKey[`${g.school_year}|${classroomKey(g)}`] ??= []).push(g);

  return classrooms
    .filter((c) => c.school_year === year)
    .sort((a, b) => a.grade - b.grade || a.class_no - b.class_no)
    .flatMap((c) => {
      const { homeroom, homeroom_location, homeroom_extension } = infoByKey[classroomKey(c)] ?? EMPTY_HOMEROOM_INFO;
      const list = guardiansByKey[`${c.school_year}|${classroomKey(c)}`] ?? [];
      if (!list.length) return [{ id: `class-${c.id}`, school_year: c.school_year, grade: c.grade, class_no: c.class_no, homeroom, homeroom_location, homeroom_extension, number: null, name: '', student_no: '', has_guardian: false }];
      return list.map((g) => ({ ...g, homeroom, homeroom_location, homeroom_extension, has_guardian: true }));
    });
}

/* ---------------- 메뉴얼 첨부파일 공통 ---------------- */
export const FILE_BUCKET = 'manual-files';
export function newAttachmentId(name) {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return `${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}.${attachmentExt(name)}`;
}
export function fileToAttachment(file) {
  const problem = checkAttachment(file.name, file.size);
  if (problem) throw new Error(problem);
  return { id: newAttachmentId(file.name), name: cleanFileName(file.name), size: file.size };
}
/** 수정 저장 때 목록에서 빠진 첨부파일 id 들 */
export const removedAttachmentIds = (oldText, newList) => {
  const keep = new Set((newList ?? []).map((a) => a.id));
  return parseAttachments(oldText).map((a) => a.id).filter((id) => !keep.has(id));
};

// 오늘 날짜(YYYY-MM-DD). toISOString 은 UTC 라 한국 새벽 0~9시에 하루 전 날짜가 나와서, 이 기기의 지역 날짜로 만든다.
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
