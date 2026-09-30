/**
 * src/data/demo.js → supabase/seed.sql
 * 실행: npm run make:seed
 * 적용: Supabase SQL Editor 에서 0001_schema.sql 실행 후 seed.sql 실행 (또는 `supabase db reset`)
 */
import { writeFileSync } from 'node:fs';
import { TABLES } from '../shared/sheet-schema.js';
import db from '../src/data/demo.js';

const q = (v) => {
  if (v === null || v === undefined || v === '') return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return `'${String(v).replace(/'/g, "''")}'`;
};

const out = ['-- 자동 생성: npm run make:seed (src/data/demo.js 기준). 직접 수정하지 말 것.', 'begin;', ''];

// 시트 탭 순서 = FK 부모 먼저
const tables = TABLES.map((t) => t.table).concat(['admin_notes']);
for (const table of tables.slice().reverse()) out.push(`delete from ${table};`);
out.push('');

for (const table of tables) {
  const rows = db[table];
  if (!rows?.length) continue;
  const cols = Object.keys(rows[0]);
  out.push(`insert into ${table} (${cols.join(', ')}) values`);
  out.push(rows.map((r) => `  (${cols.map((c) => q(r[c])).join(', ')})`).join(',\n') + ';');
  out.push('');
}
out.push('commit;');

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out.join('\n'), 'utf8');
console.log('supabase/seed.sql 생성 완료:', tables.map((t) => `${t}=${db[t]?.length ?? 0}`).join(', '));
