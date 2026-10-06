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
 * 동시에 두 번 돌지 않는다: 2분 안에 시작해 아직 안 끝난 기록이 있으면 거절(409).
 */
import { createHash } from 'node:crypto';
import { TABLES, SCHOOL_YEAR } from '../../shared/sheet-schema.js';
import { readTab, fillIds } from './google-sheets.mts';
import { adminClient, selectAll } from './supabase-admin.mts';

type Row = Record<string, unknown>;
export type Skipped = { tab: string; reason: 'read' | 'headers' | 'shrink'; detail: string };
export type SyncDeps = { sb?: any; read?: typeof readTab; fill?: typeof fillIds; force?: boolean };

const hash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

export function toDate(v: string): string | null {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})[.일]?\s*$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
const toInt = (v: string) => { const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10); return Number.isNaN(n) ? null : n; };

/** 행이 이만큼 이상 있던 표가 절반 아래로 줄면 실수로 본다. 작은 표는 "완전히 빈 경우"만 막는다. */
const SHRINK_MIN_EXISTING = 6;

export async function runSync(deps: SyncDeps = {}) {
  const sb = deps.sb ?? adminClient();
  const read = deps.read ?? readTab;
  const fill = deps.fill ?? fillIds;

  // 동시에 두 번 돌지 않게: 아직 안 끝난 최근 기록이 있으면 거절
  const { data: running } = await sb.from('sync_runs').select('id').is('finished_at', null)
    .gte('started_at', new Date(Date.now() - 2 * 60_000).toISOString()).limit(1);
  if (running?.length) throw Object.assign(new Error('이미 동기화가 진행 중입니다. 잠시 뒤에 다시 해 주세요.'), { status: 409 });

  const { data: run } = await sb.from('sync_runs').insert({}).select('id').single();
  const summary: Record<string, unknown> = {};
  const problems: string[] = [];
  const skipped: Skipped[] = [];

  // 자연키 → id
  const lookup = { staff: new Map<string, string>(), students: new Map<string, string>(), classrooms: new Map<string, string>() };
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
  };
  // 건너뛴 부모 탭: DB 에 있는 행으로 조회를 대신한다(자식 탭의 참조가 끊기지 않게)
  const lookupFromDb = async (table: string) => {
    const cols = { staff: 'id,name', students: 'id,school_year,grade,class_no,number', classrooms: 'id,school_year,grade,class_no' }[table];
    if (!cols) return;
    addLookup(table, await selectAll(sb, table, cols));
  };
  const skip = async (t: { tab: string; table: string }, reason: Skipped['reason'], detail: string) => {
    skipped.push({ tab: t.tab, reason, detail });
    summary[t.table] = { skipped: reason };
    await lookupFromDb(t.table);
  };

  try {
    // 시트 읽기는 서로 상관없어서 한꺼번에 시작한다(하나씩 읽으면 17개 탭에 20초 넘게 걸려 Netlify 함수 제한 시간을 넘는다).
    // 읽기 실패는 여기서 던지지 않고 담아 두었다가, 아래 반복에서 그 탭만 건너뛴다.
    const reads = new Map(TABLES.map((t) => [t.tab, read(t.tab).then((v) => ({ v }), (e: any) => ({ e }))]));
    for (const t of TABLES) {
      const got: any = await reads.get(t.tab);
      if (got.e) { await skip(t, 'read', `탭을 읽지 못했습니다: ${got.e.message}`); continue; }
      const sheet: { headers: string[]; rows: string[][] } = got.v;
      const { headers, rows } = sheet;
      const idx = (h: string) => headers.indexOf(h);

      const missing = t.columns.filter((c) => c.key && idx(c.header) < 0).map((c) => c.header);
      if (missing.length) { await skip(t, 'headers', `머리글 없음 → ${missing.join(', ')}`); continue; }

      const out: Row[] = [];
      const pendingIds: { rowIdx: number; id: string; raw: string[] }[] = [];
      const seen = new Set<string>();
      const yearCol = t.columns.find((c) => c.key === 'school_year' && !c.nullable);
      let yearFilled = 0; // 학년도 칸이 비어 올해로 채운 줄 수
      rows.forEach((r, rowIdx) => {
        if (r.every((v) => !v)) return;
        const obj: Row = {};
        const year = toInt(r[idx('학년도')] ?? '') ?? SCHOOL_YEAR;
        for (const c of t.columns) {
          if (!c.key) continue;
          const raw = idx(c.header) >= 0 ? (r[idx(c.header)] ?? '') : '';
          if (c.ref) {
            const id = resolve(c.ref, raw, year);
            if (raw && !id) problems.push(`${t.tab}: "${raw}" 을(를) ${c.ref} 에서 못 찾음 (행 ${rowIdx + 2})`);
            if (c.refKey) { obj[c.key] = raw; obj[c.refKey] = id; } else obj[c.key] = id;
          } else if (c.type === 'int') obj[c.key] = toInt(raw);
          else if (c.type === 'date') obj[c.key] = toDate(raw);
          else obj[c.key] = raw || null;
        }
        if (yearCol && obj.school_year == null) { obj.school_year = year; yearFilled++; }
        if (!obj.id) {
          const base = `${t.table}-${hash(t.columns.map((c) => c.key && c.key !== 'id' ? String(obj[c.key] ?? '') : '').join('|'))}`;
          let id = base;
          for (let n = 2; seen.has(id); n++) id = `${base}-${n}`; // 같은 내용의 줄이 둘이어도 id 가 겹치지 않게
          obj.id = id;
          pendingIds.push({ rowIdx, id, raw: r });
        } else if (seen.has(String(obj.id))) {
          problems.push(`${t.tab}: ID "${obj.id}" 가 겹칩니다 — 행 ${rowIdx + 2} 는 건너뜀 (복사한 줄이면 ID 칸을 비우세요)`);
          return;
        }
        seen.add(String(obj.id));
        obj.updated_at = new Date().toISOString();
        out.push(obj);
      });

      // 실수로 행이 크게 줄었거나 탭이 비었으면 DB 를 비우지 않는다
      const existing = await selectAll(sb, t.table, 'id'); // 1000행이 넘어도 전부(안 그러면 시트에서 지운 행이 DB 에 남고 줄어듦 판정도 틀어진다)
      const have = existing.length;
      if (!deps.force && ((have > 0 && out.length === 0) || (have >= SHRINK_MIN_EXISTING && out.length < have * 0.5))) {
        await skip(t, 'shrink', `시트 ${out.length}행 / 지금 DB ${have}행 — 실수로 지워진 건 아닌지 확인하세요`);
        continue;
      }

      addLookup(t.table, out);

      // upsert (덩어리 실패 시 한 줄씩 재시도해 문제 행만 건너뜀)
      let ok = 0;
      for (let i = 0; i < out.length; i += 200) {
        const chunk = out.slice(i, i + 200);
        const { error } = await sb.from(t.table).upsert(chunk, { onConflict: 'id' });
        if (!error) { ok += chunk.length; continue; }
        for (const row of chunk) {
          const { error: e1 } = await sb.from(t.table).upsert(row, { onConflict: 'id' });
          if (e1) problems.push(`${t.tab}: 저장 실패 id=${row.id} → ${e1.message}`); else ok++;
        }
      }

      // 시트에 없는 행 삭제
      const keep = new Set(out.map((o) => String(o.id)));
      const stale = existing.map((e: any) => e.id).filter((id: string) => !keep.has(id));
      for (let i = 0; i < stale.length; i += 200) {
        const { error } = await sb.from(t.table).delete().in('id', stale.slice(i, i + 200));
        if (error) problems.push(`${t.tab}: 삭제 실패 → ${error.message}`);
      }

      // 비어 있던 ID 칸을 시트에도 적는다(DB 반영이 끝난 뒤라, 실패해도 다음에 같은 내용이면 같은 ID 가 다시 만들어진다)
      let idsFilled = 0;
      if (pendingIds.length) {
        try { idsFilled = await fill(t.tab, idx('ID'), pendingIds); }
        catch (e: any) { problems.push(`${t.tab}: ID 칸 채우기 실패 → ${e.message}`); }
      }
      summary[t.table] = { rows: out.length, saved: ok, deleted: stale.length, ...(idsFilled ? { idsFilled } : {}), ...(yearFilled ? { yearFilled } : {}) };
    }
    summary.skipped = skipped;
    summary.problems = problems.slice(0, 50);
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: true, summary }).eq('id', run!.id);
    return { ok: true, summary };
  } catch (e: any) {
    summary.error = e.message; summary.skipped = skipped; summary.problems = problems.slice(0, 50);
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: false, summary }).eq('id', run!.id);
    throw e;
  }
}
