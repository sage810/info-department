/**
 * 구글 시트 → Supabase 동기화 (시트가 단일 진실 공급원)
 *
 *  - shared/sheet-schema.js 의 TABLES 순서대로(부모 먼저) 탭을 읽는다.
 *  - 머리글 이름으로 열을 찾는다 (열 순서·추가 열은 자유).
 *  - ref 열은 같은 실행에서 방금 읽은 부모 데이터로 id 를 찾는다.
 *  - 학년도 칸이 비면 올해로 처리한다(앱의 "추가"와 같은 규칙). 비어도 되는 칸(nullable)만 예외.
 *  - ID 가 비면 행 내용 해시로 만들고, 그 ID 를 시트의 ID 칸에도 적어 둔다 → 이후 내용을 고쳐도 같은 행으로 남는다.
 *  - 시트에 없는 행은 DB 에서 지운다 (테이블 통째 교체). 그래서 앱이 쓰는 기록도 반드시 시트에 먼저 쓴다.
 *
 * 시트를 잘못 고쳤을 때 DB 가 비워지지 않게, 아래 경우엔 그 탭만 건너뛰고(skipped) 나머지는 계속한다.
 *   read: 탭을 못 읽음(탭 이름이 바뀜·없음) / headers: 필요한 머리글이 없음 / shrink: 행이 갑자기 크게 줄거나 비었음(force 로 무시)
 * 건너뛴 부모 탭(교직원·학생·학급)은 DB 의 기존 행으로 자연키 조회를 대신한다.
 * 보유 묶음(devices)과 개별 장비(device_units)는 분류별 탭 여러 개가 한 DB 표를 채운다. 탭마다 따로 검사한다:
 *   묶음 탭: 물품 분류명이 그 탭의 분류와 다른 줄은 건너뛴다(비어 있으면 그 탭의 분류로 처리). 네 분류 밖은 보유_기타 탭.
 *   장비 탭: 그 탭의 종류(묶음의 물품 분류명)와 다른 묶음을 적은 줄·묶음을 못 찾은 줄은 건너뛴다.
 *   두 가지 모두 다른 탭과 ID 가 겹친 줄은 건너뛰고, 건너뛴 줄은 problems 에 남긴다.
 *   "시트에 없는 행 삭제"와 "줄어듦" 판정도 그 탭의 분류 안에서만 한다. 모든 개별 장비 탭이 정상으로 읽혔을 때만,
 *   어느 탭에도 없는 장비(묶음이 사라진 장비 등)를 마지막에 정리한다.
 * 시트는 요청 두 번(탭 목록 + values:batchGet)으로 한꺼번에 읽고, DB 에는 **바뀐 행만** 쓴다(기존 행을 전체 열로 읽어 시트 값과 비교).
 * 안 바뀐 행은 updated_at 도 건드리지 않는다. 매 10분 1,400행을 통째로 다시 쓰던 것을 없앤 것.
 * 동시에 두 번 돌지 않는다: 중단된 기록(STALE_MS 넘게 안 끝남)은 먼저 닫고, 그래도 도는 기록이 있으면 거절(409).
 * 보통은 시작 함수가 sync_runs 행을 먼저 만들고(runId) 백그라운드 함수가 이 함수를 부른다. runId 없이 부르면(로컬 스크립트) 여기서 만든다.
 */
import { createHash } from 'node:crypto';
import { TABLES, SCHOOL_YEAR, UNIT_TABS, deviceTab, CRUD_TABLES } from '../../shared/sheet-schema.js';
import { readTab, readTabs, fillIds, type TabData } from './google-sheets.mts';
import { adminClient, selectAll, closeStaleRuns, runningSync } from './supabase-admin.mts';

type Row = Record<string, unknown>;
export type Skipped = { tab: string; reason: 'read' | 'headers' | 'shrink'; detail: string };
export type SyncDeps = {
  sb?: any; fill?: typeof fillIds; force?: boolean;
  readAll?: ReadAll; read?: typeof readTab;        // read 는 시험용(탭마다 따로 읽는 옛 방식)
  runId?: number;                                   // 시작 함수가 미리 만든 sync_runs 행
  trigger?: 'button' | 'schedule' | 'local';        // 요약에 남길 "누가 시작했나"
};
type ReadAll = (tabs: string[]) => Promise<Map<string, TabData | { error: Error }>>;
const perTab = (read: typeof readTab): ReadAll => async (tabs) =>
  new Map(await Promise.all(tabs.map(async (tab): Promise<[string, TabData | { error: Error }]> => [tab, await read(tab).catch((error: Error) => ({ error }))])));

/** 시트 행(obj)과 DB 행(e)이 시트가 관리하는 열에서 같은가. 비교는 문자열로(숫자·날짜도 양쪽 다 같은 표기), null 과 '' 는 같게 본다. */
const norm = (v: unknown) => (v == null ? '' : String(v));
function sameRow(t: { columns: any[] }, obj: Row, e: Row): boolean {
  for (const c of t.columns) {
    if (!c.key || c.key === 'id') continue;
    if (norm(obj[c.key]) !== norm(e[c.key])) return false;
    if (c.refKey && norm(obj[c.refKey]) !== norm(e[c.refKey])) return false;
  }
  return true;
}

const hash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

/**
 * 날짜 칸을 YYYY-MM-DD 로. 사람이 적은 여러 형식을 받는다 — 숫자 뒤의 "구입" 같은 글자는 무시한다.
 *   2026-03-02 / 2026.3.2 / 2026/03/02 / 2026년 3월 2일 / 2022.8.23구입 / 23년6월22일 구입(두 자리 연도 → 20xx)
 *   연·월만 있으면(2026.04 구입 / 2024.9월구입) 그 달 1일.
 * 못 읽으면 null.
 */
export function toDate(v: string): string | null {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const ok = (y: number, mo: number, d: number) => { const t = new Date(Date.UTC(y, mo - 1, d)); return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d; }; // 4월 31일 같은 없는 날짜는 거른다
  const fmt = (y: number, mo: number, d: number) => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const year = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y));
  const ymd = s.match(/^(\d{4}|\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?/);
  if (ymd && ok(year(ymd[1]), +ymd[2], +ymd[3])) return fmt(year(ymd[1]), +ymd[2], +ymd[3]);
  const ym = s.match(/^(\d{4}|\d{2})\s*[.\-/년]\s*(\d{1,2})\s*월?(?!\s*[.\-/]?\s*\d)/); // 뒤에 일(숫자)이 이어지면 연·월만으로 보지 않는다
  if (ym && ok(year(ym[1]), +ym[2], 1)) return fmt(year(ym[1]), +ym[2], 1);
  // 셀 서식이 숫자라 시트가 날짜 일련번호(1899-12-30 부터 센 날 수)로 보여 준 값. 1960~2100 년 범위만
  if (/^\d{5}$/.test(s) && +s >= 21916 && +s <= 73415) return new Date(Date.UTC(1899, 11, 30) + +s * 86_400_000).toISOString().slice(0, 10);
  // ISO 시각(2026-03-02T10:00:00Z)만 더 받는다. 다른 형식을 new Date 로 풀면 없는 날짜를 옆 날짜로 바꾸거나(4/31→4/30)
  // 시간대 때문에 하루 당겨지는(3/2/2026→3/1) 일이 있어, 차라리 못 읽음으로 두고 원문을 비고에 남긴다.
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) { const d = new Date(s); if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10); }
  return null;
}
const toInt = (v: string) => { const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10); return Number.isNaN(n) ? null : n; };

/** 행이 이만큼 이상 있던 표가 절반 아래로 줄면 실수로 본다. 작은 표는 "완전히 빈 경우"만 막는다. */
const SHRINK_MIN_EXISTING = 6;

export async function runSync(deps: SyncDeps = {}) {
  const sb = deps.sb ?? adminClient();
  const readAll: ReadAll = deps.readAll ?? (deps.read ? perTab(deps.read) : readTabs);
  const fill = deps.fill ?? fillIds;
  const trigger = deps.trigger ?? 'local';
  const t0 = Date.now();

  // 기록: 시작 함수가 만들어 준 행이 있으면 그걸 쓰고, 없으면(로컬 스크립트) 여기서 만든다. 동시에 두 번 돌지 않게 중단된 기록은 닫고 확인한다.
  let runId = deps.runId;
  if (runId == null) {
    await closeStaleRuns(sb);
    if (await runningSync(sb)) throw Object.assign(new Error('이미 동기화가 진행 중입니다. 잠시 뒤에 다시 해 주세요.'), { status: 409 });
    const { data: run, error } = await sb.from('sync_runs').insert({ summary: { trigger } }).select('id').single();
    if (error || !run) throw new Error(`동기화 기록을 만들지 못했습니다: ${error?.message ?? ''}`);
    runId = run.id;
  }
  const summary: Record<string, unknown> = {};
  // "확인할 것": 유형(kind)별로 세고, 기록에는 실패(저장·삭제·ID 채우기)를 앞에 두어 50건 제한에 가려지지 않게 한다
  const problems: { kind: string; text: string }[] = [];
  const problemCounts: Record<string, number> = {};
  const problem = (kind: string, text: string) => { problems.push({ kind, text }); problemCounts[kind] = (problemCounts[kind] ?? 0) + 1; };
  const problemLines = () => [...problems.filter((x) => x.kind.endsWith('실패')), ...problems.filter((x) => !x.kind.endsWith('실패'))].map((x) => x.text).slice(0, 50);
  const skipped: Skipped[] = [];
  const seenByTable = new Map<string, Set<string>>(); // 같은 표를 채우는 탭들이 ID 를 같이 쓰지 못하게(개별 장비)
  const unitKeep = new Set<string>(); // 개별 장비 탭들에서 살아남은 ID
  let unitTabsDone = 0;

  // 자연키 → id
  const lookup = { staff: new Map<string, string>(), students: new Map<string, string>(), classrooms: new Map<string, string>(), batchCategory: new Map<string, string>() };
  const resolve = (ref: string, raw: string, year: number): string | null => {
    const v = raw.trim();
    if (!v) return null;
    if (ref === 'staff') return lookup.staff.get(v) ?? null;
    if (ref === 'students') return lookup.students.get(`${year}|${v}`) ?? null;
    if (ref === 'classrooms') return lookup.classrooms.get(`${year}|${v.replace(/\s/g, '').replace('학년', '-').replace('반', '')}`) ?? null;
    return null;
  };
  const addLookup = (table: string, list: Row[]) => {
    if (table === 'staff') list.forEach((o) => lookup.staff.set(String(o.name), String(o.id)));
    if (table === 'students') list.forEach((o) => {
      const no = `${o.grade}${String(o.class_no).padStart(2, '0')}${String(o.number).padStart(2, '0')}`;
      lookup.students.set(`${o.school_year}|${no}`, String(o.id));
    });
    if (table === 'classrooms') list.forEach((o) => lookup.classrooms.set(`${o.school_year}|${o.grade}-${o.class_no}`, String(o.id)));
    if (table === 'devices') list.forEach((o) => lookup.batchCategory.set(String(o.id), String(o.item_category ?? '')));
  };
  // DB 에 있는 행이 이 탭에 속하나(탭이 분류별로 나뉜 표만 의미가 있다). 장비는 묶음의 분류로, 묶음은 자기 분류로 정한다.
  type TabDef = { tab: string; table: string; unitCategory?: string; deviceCategory?: string };
  const inTab = (t: TabDef, r: any) => t.unitCategory ? (r.category ?? lookup.batchCategory.get(String(r.batch_id))) === t.unitCategory
    : t.deviceCategory ? deviceTab(String(r.item_category ?? '')) === t.tab : true;
  // 건너뛴 부모 탭: DB 에 있는 행으로 조회를 대신한다(자식 탭의 참조가 끊기지 않게)
  const lookupFromDb = async (t: TabDef) => {
    const table = t.table;
    const cols = { staff: 'id,name', students: 'id,school_year,grade,class_no,number', classrooms: 'id,school_year,grade,class_no', devices: 'id,item_category' }[table];
    if (!cols) return;
    addLookup(table, (await selectAll(sb, table, cols)).filter((r: any) => inTab(t, r))); // 묶음은 이 탭 분류 것만(다른 탭은 자기 차례에 채운다)
  };
  const summaryKey = (t: TabDef) => (t.unitCategory || t.deviceCategory ? `${t.table}:${t.unitCategory ?? t.deviceCategory}` : t.table); // 분류별 탭은 탭마다 따로
  const skip = async (t: TabDef, reason: Skipped['reason'], detail: string) => {
    skipped.push({ tab: t.tab, reason, detail });
    summary[summaryKey(t)] = { skipped: reason };
    await lookupFromDb(t);
  };

  try {
    // 시트는 요청 두 번으로 한꺼번에 읽는다. 없는 탭은 { error } 로 와서 그 탭만 건너뛴다.
    // 읽기 자체가 실패하면(할당량·네트워크) 여기서 던져 전체가 실패한다 — DB 는 아직 손대지 않은 상태라 안전하다.
    const sheets = await readAll(TABLES.map((t) => t.tab));
    for (const t of TABLES) {
      const got = sheets.get(t.tab);
      if (!got || 'error' in got) { await skip(t, 'read', `탭을 읽지 못했습니다: ${got ? got.error.message : '응답에 없음'}`); continue; }
      const { headers, rows } = got;
      const idx = (h: string) => headers.indexOf(h);

      const missing = t.columns.filter((c) => c.key && idx(c.header) < 0).map((c) => c.header);
      if (missing.length) { await skip(t, 'headers', `머리글 없음 → ${missing.join(', ')}`); continue; }

      const out: Row[] = [];
      const pendingIds: { rowIdx: number; id: string; raw: string[] }[] = [];
      const seen = seenByTable.get(t.table) ?? new Set<string>();
      seenByTable.set(t.table, seen);
      const yearCol = t.columns.find((c) => c.key === 'school_year' && !c.nullable);
      let yearFilled = 0; // 학년도 칸이 비어 올해로 채운 줄 수
      rows.forEach((r, rowIdx) => {
        if (r.every((v) => !v)) return;
        const obj: Row = {};
        const badDates: string[] = []; // 날짜로 못 읽은 칸의 원문
        const year = toInt(r[idx('학년도')] ?? '') ?? SCHOOL_YEAR;
        for (const c of t.columns) {
          if (!c.key) continue;
          const raw = idx(c.header) >= 0 ? (r[idx(c.header)] ?? '') : '';
          if (c.ref) {
            const id = resolve(c.ref, raw, year);
            if (raw && !id) problem('참조 못 찾음', `${t.tab}: "${raw}" 을(를) ${c.ref} 에서 못 찾음 (행 ${rowIdx + 2})`);
            if (c.refKey) { obj[c.key] = raw; obj[c.refKey] = id; } else obj[c.key] = id;
          } else if (c.type === 'int') obj[c.key] = toInt(raw);
          else if (c.type === 'date') { obj[c.key] = toDate(raw); if (raw && !obj[c.key]) badDates.push(`${c.header}: ${raw}`); }
          else obj[c.key] = raw || null;
        }
        if (badDates.length) {
          const note = `(${badDates.join(', ')})`;
          if (t.columns.some((c) => c.key === 'memo')) { const m = String(obj.memo ?? ''); if (!m.includes(note)) obj.memo = m ? `${m} ${note}` : note; }
          problem('날짜 못 읽음', `${t.tab}: 행 ${rowIdx + 2} 날짜로 못 읽어 ${t.columns.some((c) => c.key === 'memo') ? '비고에 원문을 붙임' : '비워 둠'} — ${badDates.join(', ')}`);
        }
        // 앱의 "추가"와 같은 기본값(예: 보관함 수량 0). 비워 둔 칸을 null 로 넣으면 not-null 제약에 걸려 그 줄이 매번 저장에 실패한다
        for (const [k, v] of Object.entries(CRUD_TABLES[t.table]?.defaults ?? {})) if (obj[k] == null) obj[k] = v;
        if (yearCol && obj.school_year == null) { obj.school_year = year; yearFilled++; }
        if (t.deviceCategory) {
          if (!obj.item_category) obj.item_category = t.deviceCategory; // 분류 칸이 비면 이 탭의 분류(앱의 "추가"는 항상 채워 보낸다)
          if (deviceTab(String(obj.item_category)) !== t.tab) {
            problem('분류 불일치', `${t.tab}: 행 ${rowIdx + 2} 는 건너뜀 — 물품 분류명 "${obj.item_category}" 은(는) 이 탭이 아니라 ${deviceTab(String(obj.item_category))} 탭에 적어야 합니다`);
            return;
          }
        }
        if (t.unitCategory) {
          obj.category = t.unitCategory; // 종류는 탭이 정한다(묶음 ID 는 비워도 된다)
          const cat = obj.batch_id ? lookup.batchCategory.get(String(obj.batch_id)) : t.unitCategory;
          if (cat !== t.unitCategory) {
            problem('묶음 없음/불일치', `${t.tab}: 행 ${rowIdx + 2} 는 건너뜀 — 묶음 "${obj.batch_id ?? ''}" ${cat ? `은(는) "${cat}" 묶음이라 이 탭(${t.unitCategory})에 둘 수 없습니다 (${UNIT_TABS[cat] ?? '개별 장비 탭 없음'} 탭으로 옮기세요)` : '을(를) 보유_* 탭에서 찾지 못했습니다'}`);
            return;
          }
        }
        if (!obj.id) {
          const base = `${t.table}-${hash(t.columns.map((c) => c.key && c.key !== 'id' ? String(obj[c.key] ?? '') : '').join('|'))}`;
          let id = base;
          for (let n = 2; seen.has(id); n++) id = `${base}-${n}`; // 같은 내용의 줄이 둘이어도 id 가 겹치지 않게
          obj.id = id;
          pendingIds.push({ rowIdx, id, raw: r });
        } else if (seen.has(String(obj.id))) {
          problem('ID 겹침', `${t.tab}: ID "${obj.id}" 가 겹칩니다 — 행 ${rowIdx + 2} 는 건너뜀 (복사한 줄이면 ID 칸을 비우세요)`);
          return;
        }
        seen.add(String(obj.id));
        out.push(obj);
      });

      // 실수로 행이 크게 줄었거나 탭이 비었으면 DB 를 비우지 않는다
      // 기존 행을 전체 열로 읽는다(바뀐 행 판정용). 1000행이 넘어도 전부(안 그러면 시트에서 지운 행이 DB 에 남고 줄어듦 판정도 틀어진다)
      let existing = await selectAll(sb, t.table, '*');
      if (t.unitCategory || t.deviceCategory) existing = existing.filter((r: any) => inTab(t, r)); // 이 탭 분류의 행만
      const have = existing.length;
      if (!deps.force && ((have > 0 && out.length === 0) || (have >= SHRINK_MIN_EXISTING && out.length < have * 0.5))) {
        await skip(t, 'shrink', `시트 ${out.length}행 / 지금 DB ${have}행 — 실수로 지워진 건 아닌지 확인하세요`);
        continue;
      }

      addLookup(t.table, out);

      // 바뀐 행(새 행 포함)만 upsert. 덩어리 실패 시 한 줄씩 재시도해 문제 행만 건너뜀
      const byId = new Map(existing.map((e: any) => [String(e.id), e]));
      const changed = out.filter((o) => { const e: any = byId.get(String(o.id)); return !e || !sameRow(t, o, e) || (t.unitCategory && e.category !== o.category); });
      const now = new Date().toISOString();
      changed.forEach((o) => { o.updated_at = now; });
      let ok = 0;
      for (let i = 0; i < changed.length; i += 200) {
        const chunk = changed.slice(i, i + 200);
        const { error } = await sb.from(t.table).upsert(chunk, { onConflict: 'id' });
        if (!error) { ok += chunk.length; continue; }
        for (const row of chunk) {
          const { error: e1 } = await sb.from(t.table).upsert(row, { onConflict: 'id' });
          if (e1) problem('저장 실패', `${t.tab}: 저장 실패 id=${row.id} → ${e1.message}`); else ok++;
        }
      }

      // 시트에 없는 행 삭제
      const keep = new Set(out.map((o) => String(o.id)));
      if (t.unitCategory) { out.forEach((o) => unitKeep.add(String(o.id))); unitTabsDone++; }
      const stale = existing.map((e: any) => e.id).filter((id: string) => !keep.has(id));
      for (let i = 0; i < stale.length; i += 200) {
        const { error } = await sb.from(t.table).delete().in('id', stale.slice(i, i + 200));
        if (error) problem('삭제 실패', `${t.tab}: 삭제 실패 → ${error.message}`);
      }

      // 비어 있던 ID 칸을 시트에도 적는다(DB 반영이 끝난 뒤라, 실패해도 다음에 같은 내용이면 같은 ID 가 다시 만들어진다)
      let idsFilled = 0;
      if (pendingIds.length) {
        try { idsFilled = await fill(t.tab, idx('ID'), pendingIds); }
        catch (e: any) { problem('ID 채우기 실패', `${t.tab}: ID 칸 채우기 실패 → ${e.message}`); }
      }
      summary[summaryKey(t)] = { rows: out.length, changed: changed.length, saved: ok, unchanged: out.length - changed.length, deleted: stale.length, ...(idsFilled ? { idsFilled } : {}), ...(yearFilled ? { yearFilled } : {}) };
    }
    // 개별 장비 탭이 모두 정상으로 읽혔다면, 어느 탭에도 없는 장비(묶음이 지워진 장비 등)를 정리한다
    if (unitTabsDone === TABLES.filter((t) => t.unitCategory).length) {
      const all = await selectAll(sb, 'device_units', 'id');
      const orphans = all.map((u: any) => String(u.id)).filter((id: string) => !unitKeep.has(id));
      for (let i = 0; i < orphans.length; i += 200) {
        const { error } = await sb.from('device_units').delete().in('id', orphans.slice(i, i + 200));
        if (error) problem('삭제 실패', `개별 장비 정리 실패 → ${error.message}`);
      }
      if (orphans.length) summary.device_units_orphans_deleted = orphans.length;
    }
    summary.skipped = skipped;
    summary.problems = problemLines(); summary.problems_total = problems.length; summary.problem_counts = problemCounts;
    summary.trigger = trigger; summary.elapsed_ms = Date.now() - t0;
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: true, summary }).eq('id', runId);
    return { ok: true, summary };
  } catch (e: any) {
    summary.error = e.message; summary.skipped = skipped; summary.problems = problemLines(); summary.problems_total = problems.length; summary.problem_counts = problemCounts;
    summary.trigger = trigger; summary.elapsed_ms = Date.now() - t0;
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: false, summary }).eq('id', runId);
    throw e;
  }
}
