// Supabase 모드 API: 0001_schema.sql 의 v_* 뷰를 읽는다. 쓰기(대여·메뉴얼·셀 편집·행 추가/삭제)는 Netlify 함수(시트 먼저, DB 다음).
import { supabase, callFunction } from '../supabase.js';
import { classroomKey } from '../../../shared/sheet-schema.js';
import { homeroomInfoByKey, EMPTY_HOMEROOM_INFO, joinDevices, joinCabinets, joinUnits, joinClassRows, FILE_BUCKET, fileToAttachment, today } from './common.js';

/* ---------------- Supabase ---------------- */
// Supabase 는 한 번에 최대 1000행만 돌려주고 넘는 부분은 오류 없이 잘라 버린다 → 1000행씩 이어서 전부 읽는다.
// 정렬 값이 같은 줄이 쪽 사이에서 겹치거나 빠지지 않게 마지막에 id 로도 정렬한다(모든 표·뷰에 id 가 있다).
const PAGE = 1000;
async function sel(from, order) {
  const rows = [];
  for (let start = 0; ; start += PAGE) {
    let q = supabase.from(from).select('*');
    if (order) for (const o of order) q = q.order(o.col, { ascending: o.asc !== false, nullsFirst: false });
    const { data, error } = await q.order('id').range(start, start + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}
export const supaApi = {
  staff: () => sel('staff', [{ col: 'department' }, { col: 'name' }]),
  students: () => sel('students', [{ col: 'grade' }, { col: 'class_no' }, { col: 'number' }]),
  goeduTeachers: () => sel('v_goedu_teachers', [{ col: 'name' }]),
  goeduStudents: () => sel('v_goedu_students', [{ col: 'school_year', asc: false }, { col: 'student_no' }]),
  classroomTvs: async () => {
    const [rows, staff] = await Promise.all([sel('v_classroom_tvs', [{ col: 'grade' }, { col: 'class_no' }]), sel('staff')]);
    const infoByKey = homeroomInfoByKey(staff);
    return rows.map((r) => ({ ...r, ...(infoByKey[classroomKey(r)] ?? EMPTY_HOMEROOM_INFO) }));
  },
  classroomAs: async () => {
    const [rows, staff] = await Promise.all([sel('v_classroom_as', [{ col: 'grade' }, { col: 'class_no' }]), sel('staff')]);
    const infoByKey = homeroomInfoByKey(staff);
    return rows.map((r) => ({ ...r, ...(infoByKey[classroomKey(r)] ?? EMPTY_HOMEROOM_INFO) }));
  },
  tabletCabinets: async () => {
    const [rows, staff, devices] = await Promise.all([sel('v_tablet_cabinets', [{ col: 'is_spare' }, { col: 'grade' }, { col: 'class_no' }]), sel('staff'), sel('devices')]);
    const infoByKey = homeroomInfoByKey(staff);
    return joinCabinets(rows, devices).map((r) => ({ ...r, ...(r.is_spare ? EMPTY_HOMEROOM_INFO : (infoByKey[classroomKey(r)] ?? EMPTY_HOMEROOM_INFO)) }));
  },
  cyberGuardians: () => sel('v_cyber_guardians', [{ col: 'grade' }, { col: 'class_no' }]),
  classHomerooms: async () => {
    const [classrooms, guardians, staff] = await Promise.all([sel('classrooms'), supaApi.cyberGuardians(), sel('staff')]);
    return joinClassRows(classrooms, guardians, staff);
  },
  devices: async () => {
    const [devices, units, cabinets] = await Promise.all([sel('devices', [{ col: 'purchase_date', asc: false }]), sel('device_units'), sel('tablet_cabinets')]);
    return joinDevices(devices, units, cabinets);
  },
  deviceUnits: async () => {
    const [units, devices, staff] = await Promise.all([sel('device_units', [{ col: 'ip_address' }]), sel('devices'), sel('staff')]);
    return joinUnits(units, devices, staff);
  },
  laptops: async () => (await supaApi.deviceUnits()).filter((u) => u.item_category === '노트북'),
  asLogs: () => sel('v_as_logs'),
  inventorySnapshots: () => sel('inventory_snapshots', [{ col: 'year', asc: false }, { col: 'band' }]),
  rentals: () => sel('v_rentals', [{ col: 'rented_on', asc: false }]),
  manuals: () => sel('manuals', [{ col: 'category' }, { col: 'sort_order' }]),
  addManual: (input) => callFunction('manual', { action: 'add', ...input }).then((r) => r.row),
  updateManual: (id, input) => callFunction('manual', { action: 'update', id, ...input }),
  deleteManual: (id) => callFunction('manual', { action: 'delete', id }),
  // 파일은 브라우저가 Storage 로 바로 올린다(Netlify 함수의 요청 크기 제한을 피하려고). 메뉴얼 저장은 함수가 시트 먼저.
  uploadAttachment: async (file) => {
    const att = fileToAttachment(file);
    const { error } = await supabase.storage.from(FILE_BUCKET).upload(att.id, file, { contentType: file.type || 'application/octet-stream' });
    if (error) throw new Error(`"${att.name}" 업로드 실패: ${error.message}`);
    return att;
  },
  discardAttachments: async (list) => { try { await supabase.storage.from(FILE_BUCKET).remove(list.map((a) => a.id)); } catch { /* ignore */ } },
  attachmentUrl: async (att) => {
    const { data, error } = await supabase.storage.from(FILE_BUCKET).createSignedUrl(att.id, 60, { download: att.name });
    if (error) throw new Error(error.message);
    return data.signedUrl;
  },
  edutechItems: () => sel('edutech_items', [{ col: 'category' }, { col: 'name' }]),
  links: () => sel('links', [{ col: 'group_name' }, { col: 'label' }]),
  addRental: (input) => callFunction('rental', { action: 'add', ...input }).then((r) => r.row),
  returnRental: (id, date = today()) => callFunction('rental', { action: 'return', id, returned_on: date }),
  unreturnRental: (id) => callFunction('rental', { action: 'return', id, returned_on: null }),
  updateCell: (table, id, field, value) => callFunction('cell', { table, id, field, value }),
  addRow: (table, values) => callFunction('row', { action: 'add', table, values }).then((r) => r.row),
  deleteRow: (table, id) => callFunction('row', { action: 'delete', table, id }),
  profiles: () => sel('profiles', [{ col: 'approved' }, { col: 'email' }]),
  setApproved: async (id, approved) => { const { error } = await supabase.from('profiles').update({ approved }).eq('id', id); if (error) throw new Error(error.message); },
  setRole: async (id, role) => { const { error } = await supabase.from('profiles').update({ role }).eq('id', id); if (error) throw new Error(error.message); },
  syncRuns: () => supabase.from('sync_runs').select('*').order('started_at', { ascending: false }).limit(10).then(({ data }) => data ?? []),
  // 가장 최근에 끝난 동기화(상단 "시트 동기화 N분 전"·경고 띠가 읽는다). 없으면 null
  syncStatus: () => supabase.from('sync_runs').select('id,started_at,finished_at,ok,summary').not('finished_at', 'is', null)
    .order('started_at', { ascending: false }).limit(1).then(({ data }) => data?.[0] ?? null),
  // 동기화를 시작만 한다 → { runId } | { throttled: true }. 끝나기를 기다리는 건 syncRun(runId) 를 2초마다 보는 쪽(SyncStatus.jsx waitForSyncRun)
  syncNow: (opts) => callFunction('sync-sheets', opts ?? {}),
  syncRun: (id) => supabase.from('sync_runs').select('id,started_at,finished_at,ok,summary').eq('id', id).maybeSingle().then(({ data }) => data ?? null),
};
