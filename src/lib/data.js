/**
 * 데이터 API — 화면은 여기만 부른다.
 *  - 데모 모드: src/data/demo.js 를 시작값으로 삼아 표마다 localStorage 에 덮어쓴다(그래야 셀 편집이 남는다).
 *    학생·학급만 이 앱에서 직접 고치는 화면이 없어 정적 값을 그대로 쓴다.
 *  - Supabase 모드: 0001_schema.sql 의 v_* 뷰를 읽는다. 쓰기(대여·메뉴얼·셀 편집)는 Netlify 함수(시트 먼저, DB 다음).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase, isDemo, callFunction } from './supabase.js';
import { loadDemoProfiles, saveDemoProfiles } from './auth.jsx';
import demo from '../data/demo.js';
import { studentNo, findEditableColumn, resolveRef, SCHOOL_YEAR } from '../../shared/sheet-schema.js';

/* ---------------- 공용 훅 ---------------- */
export function useQuery(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export const today = () => new Date().toISOString().slice(0, 10);

/* ---------------- 데모 저장소 ----------------
 * 표마다 localStorage 오버레이 하나. 처음 읽을 때 src/data/demo.js 값으로 채우고,
 * 셀 편집·대여·메뉴얼은 이 오버레이를 고친다. 학생·학급은 이 앱에서 고치는 화면이 없어 정적 그대로 쓴다.
 */
function demoOverlay(key, base) {
  const load = () => { try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch { /* ignore */ } return base.map((r) => ({ ...r })); };
  const save = (list) => { try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* ignore */ } };
  return { load, save };
}
const overlays = {
  staff: demoOverlay('infodept.demo.staff', demo.staff),
  classroom_tvs: demoOverlay('infodept.demo.classroom_tvs', demo.classroom_tvs),
  tablet_cabinets: demoOverlay('infodept.demo.tablet_cabinets', demo.tablet_cabinets),
  cyber_guardians: demoOverlay('infodept.demo.cyber_guardians', demo.cyber_guardians),
  goedu_teacher_accounts: demoOverlay('infodept.demo.goedu_teacher_accounts', demo.goedu_teacher_accounts),
  goedu_student_accounts: demoOverlay('infodept.demo.goedu_student_accounts', demo.goedu_student_accounts),
  laptops: demoOverlay('infodept.demo.laptops', demo.laptops),
  tablets: demoOverlay('infodept.demo.tablets', demo.tablets),
  rentals: demoOverlay('infodept.demo.rentals', demo.rentals),
  manuals: demoOverlay('infodept.demo.manuals', demo.manuals),
};
const demoRentals = overlays.rentals.load, saveDemoRentals = overlays.rentals.save;
const demoManuals = overlays.manuals.load, saveDemoManuals = overlays.manuals.save;

// 학생·학급은 이 앱에서 고치지 않으므로 정적 배열 그대로. 교직원은 편집되므로 매번 오버레이를 다시 읽는다.
const classById = Object.fromEntries(demo.classrooms.map((c) => [c.id, c]));
const studentById = Object.fromEntries(demo.students.map((s) => [s.id, s]));
const staffByIdFresh = () => Object.fromEntries(overlays.staff.load().map((s) => [s.id, s]));

const demoApi = {
  staff: async () => overlays.staff.load(),
  goeduTeachers: async () => {
    const staffById = staffByIdFresh();
    return overlays.goedu_teacher_accounts.load().map((a) => {
      const s = staffById[a.staff_id] ?? {};
      return { id: a.id, account: a.account, staff_id: a.staff_id, name: s.name ?? '', department: s.department ?? '', subject: s.subject ?? '', location: s.location ?? '', extension: s.extension ?? '' };
    });
  },
  goeduStudents: async () => overlays.goedu_student_accounts.load().map((a) => {
    const s = studentById[a.student_id] ?? {};
    return { id: a.id, school_year: a.school_year, grade: s.grade ?? null, class_no: s.class_no ?? null, number: s.number ?? null, student_no: s ? studentNo(s) : '', name: s.name ?? '', account: a.account };
  }),
  classroomTvs: async () => overlays.classroom_tvs.load().map((t) => {
    const c = classById[t.classroom_id] ?? {};
    return { id: t.id, school_year: t.school_year, grade: c.grade ?? null, class_no: c.class_no ?? null, location: c.location ?? '', brand: t.brand, model: t.model, memo: t.memo };
  }),
  tabletCabinets: async () => overlays.tablet_cabinets.load().map((k) => {
    const c = k.classroom_id ? classById[k.classroom_id] : null;
    return { id: k.id, school_year: k.school_year, grade: c?.grade ?? null, class_no: c?.class_no ?? null, location: k.location ?? c?.location ?? '', tablet_count: k.tablet_count, password: k.password, memo: k.memo, is_spare: !c };
  }),
  cyberGuardians: async () => overlays.cyber_guardians.load().map((g) => {
    const c = classById[g.classroom_id] ?? {}; const s = studentById[g.student_id] ?? {};
    return { id: g.id, school_year: c.school_year ?? null, grade: c.grade ?? null, class_no: c.class_no ?? null, number: s.number ?? null, name: s.name ?? '', student_no: s.grade ? studentNo(s) : '' };
  }),
  laptops: async () => {
    const staffById = staffByIdFresh();
    return overlays.laptops.load().map((l) => ({ ...l, user_name: staffById[l.staff_id]?.name ?? '', department: staffById[l.staff_id]?.department ?? '' }));
  },
  tablets: async () => overlays.tablets.load(),
  rentals: async () => {
    const staffById = staffByIdFresh();
    return demoRentals().map((r) => ({ ...r, checked_by_name: staffById[r.checked_by_staff_id]?.name ?? '' }));
  },
  manuals: async () => demoManuals(),
  addManual: async (input) => {
    const list = demoManuals();
    const row = {
      id: `mn-${Date.now().toString(36)}`,
      category: input.category, title: input.title.trim(), body: input.body.trim(),
      sort_order: Math.max(0, ...list.filter((m) => m.category === input.category).map((m) => m.sort_order)) + 1,
    };
    list.push(row); saveDemoManuals(list);
    return row;
  },
  updateManual: async (id, input) => {
    const list = demoManuals();
    const row = list.find((m) => m.id === id);
    if (!row) throw new Error('메뉴얼을 찾지 못했습니다.');
    row.category = input.category; row.title = input.title.trim(); row.body = input.body.trim();
    saveDemoManuals(list);
    return row;
  },
  deleteManual: async (id) => {
    const list = demoManuals();
    saveDemoManuals(list.filter((m) => m.id !== id));
  },
  links: async () => demo.links,
  adminNotes: async () => demo.admin_notes,

  addRental: async (input) => {
    const list = demoRentals();
    const staff = overlays.staff.load().find((s) => s.name === input.borrower_name.trim());
    const row = {
      id: `rt-${Date.now().toString(36)}`,
      item_type: input.item_type,
      borrower_staff_id: staff?.id ?? null,
      borrower_name: input.borrower_name.trim(),
      manufacturer: input.manufacturer ?? '', model: input.model ?? '', item_name: input.item_name ?? '',
      rented_on: input.rented_on || today(), returned_on: null,
      checked_by_staff_id: input.checked_by_staff_id || null, memo: input.memo ?? '',
    };
    list.unshift(row); saveDemoRentals(list);
    return row;
  },
  returnRental: async (id, date = today()) => {
    const list = demoRentals();
    const r = list.find((x) => x.id === id); if (r) r.returned_on = date;
    saveDemoRentals(list);
  },

  /** 셀 편집(모든 표 공용). shared/sheet-schema.js 의 정의를 그대로 따른다(서버의 cell.mts 와 같은 규칙). */
  updateCell: async (table, id, field, value) => {
    const ov = overlays[table];
    const col = findEditableColumn(table, field);
    if (!ov || !col) throw new Error('이 셀은 고칠 수 없습니다.');
    const list = ov.load();
    const row = list.find((r) => r.id === id);
    if (!row) throw new Error('행을 찾지 못했습니다.');
    const text = String(value ?? '').trim();

    if (col.ref) {
      const year = row.school_year ?? SCHOOL_YEAR;
      const lookups = { staff: overlays.staff.load(), students: demo.students, classrooms: demo.classrooms };
      const resolvedId = resolveRef(col.ref, text, year, lookups);
      if (col.refKey) {
        row[col.key] = text || null;
        row[col.refKey] = resolvedId;
      } else {
        if (text && !resolvedId) throw new Error(`"${text}" 을(를) 찾지 못했습니다.`);
        row[col.key] = resolvedId;
      }
      ov.save(list);
      return { value: text };
    }
    if (col.type === 'int') {
      const n = text === '' ? null : parseInt(text.replace(/[^\d-]/g, ''), 10);
      if (text !== '' && Number.isNaN(n)) throw new Error('숫자만 입력하세요.');
      row[col.key] = n; ov.save(list); return { value: n };
    }
    row[col.key] = text || null;
    ov.save(list);
    return { value: text };
  },

  profiles: async () => loadDemoProfiles(),
  setApproved: async (id, approved) => {
    const list = loadDemoProfiles(); const p = list.find((x) => x.id === id); if (p) p.approved = approved; saveDemoProfiles(list);
  },
  setRole: async (id, role) => {
    const list = loadDemoProfiles(); const p = list.find((x) => x.id === id); if (p) p.role = role; saveDemoProfiles(list);
  },
  syncRuns: async () => [],
  syncNow: async () => { throw new Error('데모 모드에서는 시트 동기화를 할 수 없습니다.'); },
};

/* ---------------- Supabase ---------------- */
async function sel(from, order) {
  let q = supabase.from(from).select('*');
  if (order) for (const o of order) q = q.order(o.col, { ascending: o.asc !== false, nullsFirst: false });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}
const supaApi = {
  staff: () => sel('staff', [{ col: 'department' }, { col: 'name' }]),
  goeduTeachers: () => sel('v_goedu_teachers', [{ col: 'name' }]),
  goeduStudents: () => sel('v_goedu_students', [{ col: 'school_year', asc: false }, { col: 'student_no' }]),
  classroomTvs: () => sel('v_classroom_tvs', [{ col: 'grade' }, { col: 'class_no' }]),
  tabletCabinets: () => sel('v_tablet_cabinets', [{ col: 'is_spare' }, { col: 'grade' }, { col: 'class_no' }]),
  cyberGuardians: () => sel('v_cyber_guardians', [{ col: 'grade' }, { col: 'class_no' }]),
  laptops: () => sel('v_laptops', [{ col: 'ip_address' }]),
  tablets: () => sel('tablets', [{ col: 'location' }, { col: 'purchase_date' }]),
  rentals: () => sel('v_rentals', [{ col: 'rented_on', asc: false }]),
  manuals: () => sel('manuals', [{ col: 'category' }, { col: 'sort_order' }]),
  addManual: (input) => callFunction('manual', { action: 'add', ...input }).then((r) => r.row),
  updateManual: (id, input) => callFunction('manual', { action: 'update', id, ...input }),
  deleteManual: (id) => callFunction('manual', { action: 'delete', id }),
  links: () => sel('links', [{ col: 'group_name' }, { col: 'label' }]),
  adminNotes: () => sel('admin_notes', [{ col: 'key' }]),
  addRental: (input) => callFunction('rental', { action: 'add', ...input }).then((r) => r.row),
  returnRental: (id, date = today()) => callFunction('rental', { action: 'return', id, returned_on: date }),
  updateCell: (table, id, field, value) => callFunction('cell', { table, id, field, value }),
  profiles: () => sel('profiles', [{ col: 'approved' }, { col: 'email' }]),
  setApproved: async (id, approved) => { const { error } = await supabase.from('profiles').update({ approved }).eq('id', id); if (error) throw new Error(error.message); },
  setRole: async (id, role) => { const { error } = await supabase.from('profiles').update({ role }).eq('id', id); if (error) throw new Error(error.message); },
  syncRuns: () => supabase.from('sync_runs').select('*').order('started_at', { ascending: false }).limit(10).then(({ data }) => data ?? []),
  syncNow: () => callFunction('sync-sheets', {}),
};

export const api = isDemo ? demoApi : supaApi;

/* ---------------- 링크 헬퍼 ---------------- */
export function useLinks() {
  const q = useQuery(api.links);
  const byKey = Object.fromEntries((q.data ?? []).map((l) => [l.key, l]));
  return { ...q, byKey, link: (key) => byKey[key] ?? null };
}
