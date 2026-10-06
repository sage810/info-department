/**
 * 시트 → Supabase 동기화를 내 컴퓨터에서 한 번 돌린다(Netlify 에 올리기 전 첫 데이터 채우기·연결 확인용).
 * 배포된 앱이 10분마다 하는 일과 같다: 시트의 모든 탭을 읽어 DB 표를 시트 내용으로 맞춘다(시트에 없는 행은 DB 에서 지움).
 * 시트의 ID 칸이 비어 있던 줄에는 만든 ID 를 시트에도 적는다. 키 값은 출력하지 않는다.
 *
 *   npm run sync:local        (= node --env-file=.env scripts/sync-now.mjs)
 *   npm run sync:local -- --force   행이 크게 줄어든 표도 그대로 반영(일부러 지운 게 맞을 때만)
 *
 * 필요한 환경변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 */
const need = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON'];
const miss = need.filter((k) => !process.env[k]);
if (miss.length) { console.error(`.env 에 비어 있는 값: ${miss.join(', ')}`); process.exit(1); }
try { new URL(process.env.SUPABASE_URL); } catch { console.error('SUPABASE_URL 이 주소 형식이 아닙니다.'); process.exit(1); }
if (new URL(process.env.SUPABASE_URL).pathname.replace(/\/$/, '')) {
  console.error(`SUPABASE_URL 에 경로(${new URL(process.env.SUPABASE_URL).pathname})가 붙어 있습니다 — "https://<프로젝트>.supabase.co" 까지만 적어야 합니다.`);
  process.exit(1);
}

const { runSync } = await import('../netlify/lib/sync.mts');
const t0 = Date.now();
console.log('시트를 읽어 Supabase 에 반영하는 중…\n');
let result;
try { result = await runSync({ force: process.argv.includes('--force') }); }
catch (e) { console.error(`동기화 실패: ${e.message}`); process.exit(1); }

const { summary } = result;
for (const [table, v] of Object.entries(summary)) {
  if (['skipped', 'problems', 'error'].includes(table)) continue;
  if (v.skipped) { console.log(`⚠  ${table.padEnd(24)} 건너뜀(${v.skipped})`); continue; }
  console.log(`✓  ${table.padEnd(24)} 행 ${String(v.rows).padStart(4)}  저장 ${String(v.saved).padStart(4)}  삭제 ${String(v.deleted).padStart(3)}${v.idsFilled ? `  시트 ID 채움 ${v.idsFilled}` : ''}${v.yearFilled ? `  학년도 빈칸→올해 ${v.yearFilled}` : ''}`);
}
if (summary.skipped?.length) { console.log('\n건너뛴 탭:'); for (const s of summary.skipped) console.log(`  - ${s.tab}: ${s.detail}`); }
if (summary.problems?.length) { console.log(`\n확인할 것 ${summary.problems.length}건:`); for (const p of summary.problems.slice(0, 40)) console.log(`  - ${p}`); if (summary.problems.length > 40) console.log(`  … 외 ${summary.problems.length - 40}건 (최대 50건까지 기록됨)`); }
console.log(`\n끝 (${((Date.now() - t0) / 1000).toFixed(1)}초)${summary.skipped?.length || summary.problems?.length ? ' — 위 항목을 확인하세요.' : ' — 문제 없음.'}`);
