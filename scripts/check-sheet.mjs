/**
 * 구글 시트 연결 점검 — 동기화(Netlify)를 올리기 전에 로컬에서 "서비스 계정이 시트를 읽을 수 있는지, 탭·머리글이 맞는지"를 본다.
 * 키 값은 출력하지 않는다(읽은 탭 이름·머리글·행 수만 보여 준다). 시트는 읽기만 하고 아무것도 고치지 않는다.
 *
 *   npm run check:sheet        (= node --env-file=.env scripts/check-sheet.mjs)
 *
 * 필요한 환경변수: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 */
import { TABLES } from '../shared/sheet-schema.js';

if (!process.env.GOOGLE_SHEET_ID) { console.error('GOOGLE_SHEET_ID 가 비어 있습니다 (.env 확인).'); process.exit(1); }
let sa;
try { sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? ''); }
catch { console.error('GOOGLE_SERVICE_ACCOUNT_JSON 이 비었거나 JSON 한 줄 형식이 아닙니다 (.env 확인).'); process.exit(1); }
if (!sa.client_email || !sa.private_key) { console.error('서비스 계정 JSON 에 client_email / private_key 가 없습니다.'); process.exit(1); }

const { readTab } = await import('../netlify/lib/google-sheets.mts');
console.log(`서비스 계정: ${sa.client_email}`);
console.log(`시트 ID   : ${process.env.GOOGLE_SHEET_ID}\n`);

let ok = 0, warn = 0, bad = 0, fatal = null;
for (const t of TABLES) {
  try {
    const { headers, rows } = await readTab(t.tab);
    const want = t.columns.filter((c) => c.key).map((c) => c.header);
    const missing = want.filter((h) => !headers.includes(h));
    const n = rows.filter((r) => r.some((v) => v)).length;
    if (missing.length) { warn++; console.log(`⚠  ${t.tab.padEnd(12)} 머리글 없음 → ${missing.join(', ')}  (행 ${n})`); }
    else { ok++; console.log(`✓  ${t.tab.padEnd(12)} 행 ${n}`); }
  } catch (e) {
    const msg = String(e.message ?? e);
    bad++;
    if (/403|PERMISSION/i.test(msg)) { fatal = '권한이 없습니다 — 구글 시트의 "공유"에서 서비스 계정 이메일을 "편집자"로 추가했는지 확인하세요.'; console.log(`✗  ${t.tab.padEnd(12)} 권한 없음`); break; }
    if (/404|not found|Unable to parse range/i.test(msg)) { console.log(`✗  ${t.tab.padEnd(12)} 탭이 없습니다 (탭 이름 확인)`); continue; }
    if (/invalid_grant|토큰|JWT|private key/i.test(msg)) { fatal = `서비스 계정 키를 쓸 수 없습니다: ${msg}`; console.log(`✗  ${t.tab.padEnd(12)} 인증 실패`); break; }
    console.log(`✗  ${t.tab.padEnd(12)} ${msg.slice(0, 120)}`); fatal ??= null;
  }
}

console.log(`\n정상 ${ok} · 머리글 확인 필요 ${warn} · 탭 없음/오류 ${bad}`);
if (fatal) console.log(`\n${fatal}`);
if (!fatal && bad === TABLES.length) console.log('\n모든 탭이 안 읽힙니다 — 시트 ID 가 맞는지, 시트가 "구글 시트"(xlsx 가 아닌)인지 확인하세요.');
if (!fatal && warn + bad > 0) console.log('\n탭·머리글은 `npm run setup:sheet` 가 빠진 것을 채워 줍니다(먼저 `node scripts/setup-sheet-guards.mjs --dry-run` 으로 확인).');
process.exit(fatal || bad ? 1 : 0);
