// 데모 모드 API: src/data/demo.js 를 시작값으로 삼아 표마다 localStorage 에 덮어쓴다(그래야 셀 편집이 남는다).
import { loadDemoProfiles, saveDemoProfiles } from '../auth.jsx';
import demo from '../../data/demo.js';
import { putDemoFile, getDemoFile, deleteDemoFiles } from '../demoFiles.js';
import { studentNo, findEditableColumn, resolveRef, refHint, SCHOOL_YEAR, classroomKey, formatAttachments, parseAttachments, CRUD_TABLES, prepareNewRow } from '../../../shared/sheet-schema.js';
import { homeroomInfoByKey, EMPTY_HOMEROOM_INFO, joinDevices, joinUnits, joinClassRows, fileToAttachment, removedAttachmentIds, today } from './common.js';

/* ---------------- 데모 저장소 ----------------
 * 표마다 localStorage 오버레이 하나. 처음 읽을 때 src/data/demo.js 값으로 채우고,
 * 셀 편집·대여·메뉴얼은 이 오버레이를 고친다. 학생·학급은 이 앱에서 고치는 화면이 없어 정적 그대로 쓴다.
 */
function demoOverlay(key, base) {
  const seenKey = `${key}.seen`; // 지금까지 이 브라우저가 알고 있는 시작 데이터 행 id
  const idOf = (r) => r.id ?? r.key;
  const baseIds = base.map(idOf);
  const read = (k) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

  const baseById = new Map(base.map((r) => [idOf(r), r]));
  // 예전에 저장된 행에는 그 뒤에 새로 생긴 열(예: 교직원 "담임")이 아예 없다 → 없는 키만 시작값으로 채운다.
  // 사용자가 비운 칸은 null 로 남아 있어서(키가 있음) 건드리지 않는다.
  const fillNewFields = (r) => {
    const b = baseById.get(idOf(r));
    const missing = b ? Object.keys(b).filter((k) => !(k in r)) : [];
    return missing.length ? { ...r, ...Object.fromEntries(missing.map((k) => [k, b[k]])) } : r;
  };

  const load = () => {
    const stored = read(key);
    if (!stored) return base.map((r) => ({ ...r }));
    const saved = stored.map(fillNewFields);
    // 예전에 저장된 브라우저에는 그 뒤에 새로 생긴 시작 행(데모 글 등)이 없다 → 한 번만 채워 넣는다.
    // 사용자가 지운 시작 행은 save() 가 seen 에 남겨 두므로 되살아나지 않는다.
    const seen = new Set([...(read(seenKey) ?? []), ...saved.map(idOf)]);
    const fresh = base.filter((r) => !seen.has(idOf(r)));
    if (!fresh.length) return saved;
    const merged = [...saved, ...fresh.map((r) => ({ ...r }))];
    write(key, merged); write(seenKey, [...new Set([...seen, ...baseIds])]);
    return merged;
  };
  const save = (list) => {
    write(key, list);
    write(seenKey, [...new Set([...(read(seenKey) ?? []), ...baseIds])]);
  };
  return { load, save };
}
const overlays = {
  staff: demoOverlay('infodept.demo.staff', demo.staff),
  students: demoOverlay('infodept.demo.students', demo.students),
  classroom_tvs: demoOverlay('infodept.demo.classroom_tvs', demo.classroom_tvs),
  classroom_as: demoOverlay('infodept.demo.classroom_as', demo.classroom_as),
  tablet_cabinets: demoOverlay('infodept.demo.tablet_cabinets', demo.tablet_cabinets),
  cyber_guardians: demoOverlay('infodept.demo.cyber_guardians', demo.cyber_guardians),
  goedu_teacher_accounts: demoOverlay('infodept.demo.goedu_teacher_accounts', demo.goedu_teacher_accounts),
  goedu_student_accounts: demoOverlay('infodept.demo.goedu_student_accounts', demo.goedu_student_accounts),
  devices: demoOverlay('infodept.demo.devices', demo.devices),
  device_units: demoOverlay('infodept.demo.device_units', demo.device_units),
  rentals: demoOverlay('infodept.demo.rentals', demo.rentals),
  manuals: demoOverlay('infodept.demo.manuals', demo.manuals),
  edutech_items: demoOverlay('infodept.demo.edutech_items', demo.edutech_items),
  inventory_snapshots: demoOverlay('infodept.demo.inventory_snapshots', demo.inventory_snapshots),
  as_logs: demoOverlay('infodept.demo.as_logs', demo.as_logs),
};
const demoRentals = overlays.rentals.load, saveDemoRentals = overlays.rentals.save;
const demoManuals = overlays.manuals.load, saveDemoManuals = overlays.manuals.save;

// 학급은 이 앱에서 고치지 않으므로 정적 배열 그대로. 교직원·학생은 편집되므로 매번 오버레이를 다시 읽는다.
const classById = Object.fromEntries(demo.classrooms.map((c) => [c.id, c]));
const studentByIdFresh = () => Object.fromEntries(overlays.students.load().map((s) => [s.id, s]));
const staffByIdFresh = () => Object.fromEntries(overlays.staff.load().map((s) => [s.id, s]));

export const demoApi = {
  staff: async () => overlays.staff.load(),
  // 학생 명단(학교 정보 → 학생). 대여의 "학생 대여" 학번 자동완성에도 쓴다.
  students: async () => overlays.students.load().slice().sort((a, b) => a.grade - b.grade || a.class_no - b.class_no || a.number - b.number),
  goeduTeachers: async () => {
    const staffById = staffByIdFresh();
    return overlays.goedu_teacher_accounts.load().map((a) => {
      const s = staffById[a.staff_id] ?? {};
      return { id: a.id, account: a.account, staff_id: a.staff_id, name: s.name ?? '', department: s.department ?? '', subject: s.subject ?? '', location: s.location ?? '', extension: s.extension ?? '' };
    });
  },
  goeduStudents: async () => { const studentById = studentByIdFresh(); return overlays.goedu_student_accounts.load().map((a) => {
    const s = studentById[a.student_id] ?? {};
    return { id: a.id, school_year: a.school_year, grade: s.grade ?? null, class_no: s.class_no ?? null, number: s.number ?? null, student_no: s ? studentNo(s) : '', name: s.name ?? '', account: a.account };
  }); },
  classroomTvs: async () => {
    const infoByKey = homeroomInfoByKey(overlays.staff.load());
    return overlays.classroom_tvs.load().map((t) => {
      const c = classById[t.classroom_id] ?? {};
      return {
        id: t.id, school_year: t.school_year, grade: c.grade ?? null, class_no: c.class_no ?? null,
        location: t.location || c.location || '', brand: t.brand,
        ...(infoByKey[classroomKey(c)] ?? EMPTY_HOMEROOM_INFO),
      };
    });
  },
  classroomAs: async () => {
    const infoByKey = homeroomInfoByKey(overlays.staff.load());
    return overlays.classroom_as.load().map((a) => {
      const c = classById[a.classroom_id] ?? {};
      return {
        id: a.id, school_year: a.school_year, grade: c.grade ?? null, class_no: c.class_no ?? null,
        location: a.location || c.location || '',
        ...(infoByKey[classroomKey(c)] ?? EMPTY_HOMEROOM_INFO),
      };
    }).sort((x, y) => x.grade - y.grade || x.class_no - y.class_no);
  },
  tabletCabinets: async () => {
    const infoByKey = homeroomInfoByKey(overlays.staff.load());
    return overlays.tablet_cabinets.load().map((k) => {
      const c = k.classroom_id ? classById[k.classroom_id] : null;
      return {
        id: k.id, school_year: k.school_year, grade: c?.grade ?? null, class_no: c?.class_no ?? null,
        location: k.location ?? c?.location ?? '', tablet_count: k.tablet_count, password: k.password, memo: k.memo, is_spare: !c,
        ...(c ? (infoByKey[classroomKey(c)] ?? EMPTY_HOMEROOM_INFO) : EMPTY_HOMEROOM_INFO),
      };
    });
  },
  cyberGuardians: async () => { const studentById = studentByIdFresh(); return overlays.cyber_guardians.load().map((g) => {
    const c = classById[g.classroom_id] ?? {}; const s = studentById[g.student_id] ?? {};
    return { id: g.id, school_year: c.school_year ?? null, grade: c.grade ?? null, class_no: c.class_no ?? null, number: s.number ?? null, name: s.name ?? '', student_no: s.grade ? studentNo(s) : '' };
  }); },
  classHomerooms: async () => joinClassRows(demo.classrooms, await demoApi.cyberGuardians(), overlays.staff.load()),
  devices: async () => joinDevices(overlays.devices.load(), overlays.device_units.load()),
  deviceUnits: async () => joinUnits(overlays.device_units.load(), overlays.devices.load(), overlays.staff.load()),
  laptops: async () => (await demoApi.deviceUnits()).filter((u) => u.item_category === '노트북'),
  // AS기록(날짜 기록 한 줄씩). 학급 기록에는 학년·반을 붙인다 — 화면 칸으로 묶는 건 asLogs.js
  asLogs: async () => overlays.as_logs.load().map((l) => {
    const c = l.classroom_id ? classById[l.classroom_id] : null;
    return { ...l, grade: c?.grade ?? null, class_no: c?.class_no ?? null };
  }),
  inventorySnapshots: async () => overlays.inventory_snapshots.load().slice().sort((a, b) => b.year - a.year || a.band - b.band),
  rentals: async () => {
    const staffById = staffByIdFresh(); const studentById = studentByIdFresh();
    return demoRentals().map((r) => {
      const s = r.borrower_student_id ? studentById[r.borrower_student_id] : null;
      return {
        ...r, checked_by_name: staffById[r.checked_by_staff_id]?.name ?? '',
        borrower_grade: s?.grade ?? null, borrower_class_no: s?.class_no ?? null, borrower_number: s?.number ?? null,
      };
    });
  },
  manuals: async () => demoManuals(),
  addManual: async (input) => {
    const list = demoManuals();
    const row = {
      id: `mn-${Date.now().toString(36)}`,
      category: input.category, title: input.title.trim(), body: input.body.trim(),
      sort_order: Math.max(0, ...list.filter((m) => m.category === input.category).map((m) => m.sort_order)) + 1,
      attachments: formatAttachments(input.attachments),
    };
    list.push(row); saveDemoManuals(list);
    return row;
  },
  updateManual: async (id, input) => {
    const list = demoManuals();
    const row = list.find((m) => m.id === id);
    if (!row) throw new Error('메뉴얼을 찾지 못했습니다.');
    row.category = input.category; row.title = input.title.trim(); row.body = input.body.trim();
    if (input.attachments) {
      await deleteDemoFiles(removedAttachmentIds(row.attachments, input.attachments));
      row.attachments = formatAttachments(input.attachments);
    }
    saveDemoManuals(list);
    return row;
  },
  deleteManual: async (id) => {
    const list = demoManuals();
    const row = list.find((m) => m.id === id);
    if (row) await deleteDemoFiles(parseAttachments(row.attachments).map((a) => a.id));
    saveDemoManuals(list.filter((m) => m.id !== id));
  },
  /** 파일 하나를 올리고 { id, name, size } 를 돌려준다. 메뉴얼 저장 때 이 목록을 함께 보낸다. */
  uploadAttachment: async (file) => {
    const att = fileToAttachment(file);
    await putDemoFile(att.id, file);
    return att;
  },
  /** 저장하지 않고 취소된 업로드 정리(실패해도 무시) */
  discardAttachments: async (list) => { try { await deleteDemoFiles(list.map((a) => a.id)); } catch { /* ignore */ } },
  /** 내려받을 주소. 데모에서는 브라우저 안의 임시 주소라 쓴 뒤 URL.revokeObjectURL 로 치운다. */
  attachmentUrl: async (att) => {
    const blob = await getDemoFile(att.id);
    if (!blob) throw new Error('파일을 찾지 못했습니다.');
    return URL.createObjectURL(blob);
  },
  edutechItems: async () => overlays.edutech_items.load(),
  links: async () => demo.links,

  /** input.borrower_student_no(학번) 가 있으면 학생 대여, 없으면 input.borrower_name 으로 교직원 대여(자동 연결은 이름이 맞을 때만). */
  addRental: async (input) => {
    const list = demoRentals();
    let borrower_staff_id = null, borrower_student_id = null, borrower_name = '';
    const studentNo = String(input.borrower_student_no ?? '').trim();
    if (studentNo) {
      borrower_student_id = resolveRef('students', studentNo, SCHOOL_YEAR, { students: overlays.students.load() });
      if (!borrower_student_id) throw new Error(`학번 "${studentNo}" 학생을 찾지 못했습니다. 학번(예: 21011)을 다시 확인해 주세요.`);
      borrower_name = studentByIdFresh()[borrower_student_id]?.name ?? '';
    } else {
      borrower_name = String(input.borrower_name ?? '').trim();
      borrower_staff_id = overlays.staff.load().find((s) => s.name === borrower_name)?.id ?? null;
    }
    const row = {
      id: `rt-${Date.now().toString(36)}`,
      item_type: input.item_type,
      borrower_staff_id, borrower_student_id, borrower_name,
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
  unreturnRental: async (id) => {
    const list = demoRentals();
    const r = list.find((x) => x.id === id); if (r) r.returned_on = null;
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
      const lookups = { staff: overlays.staff.load(), students: overlays.students.load(), classrooms: demo.classrooms };
      const resolvedId = resolveRef(col.ref, text, year, lookups);
      if (col.refKey) {
        row[col.key] = text || null;
        row[col.refKey] = resolvedId;
      } else {
        if (text && !resolvedId) throw new Error(`"${text}" 을(를) 찾지 못했습니다. ${refHint(col.ref)}`);
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

  /** 표 화면의 "추가"(서버 row.mts 와 같은 규칙: shared 의 prepareNewRow). */
  addRow: async (table, values) => {
    const ov = overlays[table];
    if (!ov || !CRUD_TABLES[table]) throw new Error('이 표는 추가를 지원하지 않습니다.');
    const list = ov.load();
    const lookups = { staff: overlays.staff.load(), students: overlays.students.load(), classrooms: demo.classrooms };
    const { row, error } = prepareNewRow(table, values, list, lookups);
    if (error) throw new Error(error);
    if (table === 'device_units') { // 서버 row.mts 와 같게: 종류는 묶음의 분류, 묶음이 없으면 화면이 보낸 종류
      const b = row.batch_id ? overlays.devices.load().find((d) => d.id === row.batch_id) : null;
      if (row.batch_id && !b) throw new Error(`묶음 "${row.batch_id}" 을(를) 찾지 못했습니다.`);
      row.category = b?.item_category ?? values.category ?? null;
    }
    ov.save([...list, row]);
    return row;
  },
  /** 표 화면의 "삭제". DB 의 on delete 규칙처럼 교직원은 Goedu 교사 계정을, 학생은 Goedu 학생 계정·사이버 지킴이 지정을 같이 지우고, 다른 표의 연결은 끊는다. */
  deleteRow: async (table, id) => {
    const ov = overlays[table];
    if (!ov || !CRUD_TABLES[table]) throw new Error('이 표는 삭제를 지원하지 않습니다.');
    const list = ov.load();
    if (!list.some((r) => r.id === id)) throw new Error('행을 찾지 못했습니다.');
    if (table === 'devices') {
      const n = overlays.device_units.load().filter((u) => u.batch_id === id).length;
      if (n) throw new Error(`이 묶음에 개별 장비가 ${n}대 연결돼 있어 지울 수 없습니다. 개별 장비를 먼저 삭제하세요.`);
    }
    if (table === 'students') {
      for (const t of ['goedu_student_accounts', 'cyber_guardians']) overlays[t].save(overlays[t].load().filter((r) => r.student_id !== id));
      const rows = overlays.rentals.load();
      if (rows.some((r) => r.borrower_student_id === id)) overlays.rentals.save(rows.map((r) => (r.borrower_student_id === id ? { ...r, borrower_student_id: null } : r)));
    }
    if (table === 'staff') {
      overlays.goedu_teacher_accounts.save(overlays.goedu_teacher_accounts.load().filter((a) => a.staff_id !== id));
      for (const [t, f] of [['device_units', 'staff_id'], ['rentals', 'borrower_staff_id'], ['rentals', 'checked_by_staff_id']]) {
        const rows = overlays[t].load();
        if (rows.some((r) => r[f] === id)) overlays[t].save(rows.map((r) => (r[f] === id ? { ...r, [f]: null } : r)));
      }
    }
    ov.save(list.filter((r) => r.id !== id));
  },

  profiles: async () => loadDemoProfiles(),
  setApproved: async (id, approved) => {
    const list = loadDemoProfiles(); const p = list.find((x) => x.id === id); if (p) p.approved = approved; saveDemoProfiles(list);
  },
  setRole: async (id, role) => {
    const list = loadDemoProfiles(); const p = list.find((x) => x.id === id); if (p) p.role = role; saveDemoProfiles(list);
  },
  syncRuns: async () => [],
  syncStatus: async () => null,
  syncRun: async () => null,
  syncNow: async () => { throw new Error('데모 모드에서는 시트 동기화를 할 수 없습니다.'); },
};
