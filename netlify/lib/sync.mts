/**
 * 구글 시트 → Supabase 동기화 (시트가 단일 진실 공급원)
 *
 *  - shared/sheet-schema.js 의 TABLES 순서대로(부모 먼저) 탭을 읽는다.
 *  - 머리글 이름으로 열을 찾는다 (열 순서·추가 열은 자유).
 *  - ref 열은 같은 실행에서 방금 읽은 부모 데이터로 id 를 찾는다.
 *  - ID 가 비면 행 내용 해시로 만든다 → 같은 내용이면 같은 id, 내용이 바뀌면 새 행으로 교체된다.
 *  - 시트에 없는 행은 DB 에서 지운다 (테이블 통째 교체). 그래서 앱이 쓰는 대여 기록도 반드시 시트에 먼저 쓴다.
 */
import { createHash } from 'node:crypto';
import { TABLES, SCHOOL_YEAR, parseStudentNo } from '../../shared/sheet-schema.js';
import { readTab } from './google-sheets.mts';
import { adminClient } from './supabase-admin.mts';

type Row = Record<string, unknown>;

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

export async function runSync() {
  const sb = adminClient();
  const { data: run } = await sb.from('sync_runs').insert({}).select('id').single();
  const summary: Record<string, unknown> = {};
  const problems: string[] = [];

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

  try {
    for (const t of TABLES) {
      const { headers, rows } = await readTab(t.tab);
      const idx = (h: string) => headers.indexOf(h);
      const missing = t.columns.filter((c) => c.key && idx(c.header) < 0).map((c) => c.header);
      if (missing.length) problems.push(`${t.tab}: 머리글 없음 → ${missing.join(', ')}`);

      const out: Row[] = [];
      for (const r of rows) {
        if (r.every((v) => !v)) continue;
        const obj: Row = {};
        const year = toInt(r[idx('학년도')] ?? '') ?? SCHOOL_YEAR;
        for (const c of t.columns) {
          if (!c.key) continue;
          const raw = idx(c.header) >= 0 ? (r[idx(c.header)] ?? '') : '';
          if (c.ref) {
            const id = resolve(c.ref, raw, year);
            if (raw && !id) problems.push(`${t.tab}: "${raw}" 을(를) ${c.ref} 에서 못 찾음 (행 ${out.length + 2})`);
            if (c.refKey) { obj[c.key] = raw; obj[c.refKey] = id; } else obj[c.key] = id;
          } else if (c.type === 'int') obj[c.key] = toInt(raw);
          else if (c.type === 'date') obj[c.key] = toDate(raw);
          else obj[c.key] = raw || null;
        }
        if (!obj.id) obj.id = `${t.table}-${hash(t.columns.map((c) => c.key && c.key !== 'id' ? String(obj[c.key] ?? '') : '').join('|'))}`;
        obj.updated_at = new Date().toISOString();
        out.push(obj);
      }

      // 부모 lookup 갱신
      if (t.table === 'staff') out.forEach((o) => lookup.staff.set(String(o.name), String(o.id)));
      if (t.table === 'students') out.forEach((o) => {
        const no = `${o.grade}${String(o.class_no).padStart(2, '0')}${String(o.number).padStart(2, '0')}`;
        lookup.students.set(`${o.school_year}|${no}`, String(o.id));
      });
      if (t.table === 'classrooms') out.forEach((o) => lookup.classrooms.set(`${o.school_year}|${o.grade}-${o.class_no}`, String(o.id)));

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
      const { data: existing } = await sb.from(t.table).select('id');
      const stale = (existing ?? []).map((e: any) => e.id).filter((id: string) => !keep.has(id));
      for (let i = 0; i < stale.length; i += 200) {
        const { error } = await sb.from(t.table).delete().in('id', stale.slice(i, i + 200));
        if (error) problems.push(`${t.tab}: 삭제 실패 → ${error.message}`);
      }
      summary[t.table] = { rows: out.length, saved: ok, deleted: stale.length };
    }
    summary.problems = problems.slice(0, 50);
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: true, summary }).eq('id', run!.id);
    return { ok: true, summary };
  } catch (e: any) {
    summary.error = e.message; summary.problems = problems.slice(0, 50);
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: false, summary }).eq('id', run!.id);
    throw e;
  }
}

/** 학번 문자열이 유효한지 (앱·함수 공용 검증에 쓰려고 노출) */
export const isStudentNo = (s: string) => !!parseStudentNo(s);
