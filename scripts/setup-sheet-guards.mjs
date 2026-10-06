/**
 * 구글 시트를 여러 사람이 직접 고쳐도 앱 동기화가 깨지지 않게 시트에 안전장치를 건다. 여러 번 돌려도 같은 결과(다시 덮어씀).
 *
 *   node --env-file=.env scripts/setup-sheet-guards.mjs            # 실제 시트에 적용
 *   node scripts/setup-sheet-guards.mjs --dry-run                  # 시트에 연결하지 않고 무엇을 할지만 출력
 *
 * 환경변수(앱의 Netlify 와 같은 값): GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 *   SHEET_ADMIN_EMAILS (선택, 쉼표로 구분): 적으면 머리글·ID 열을 "이 사람들과 서비스 계정만" 고칠 수 있게 잠그고,
 *                                           안 적으면 고치려 할 때 경고만 띄운다(막지는 않음).
 *
 * 하는 일(탭마다)
 *   1. 없는 탭은 만들고, 시트에 없는 머리글은 머리글 줄 끝에 덧붙인다(스키마가 바뀌었을 때 동기화가 "머리글 없음"으로 건너뛰지 않게).
 *   2. 머리글 줄 고정(스크롤해도 보임), ID 열 회색 표시.
 *   3. 머리글 줄·ID 열 보호 — ID 는 비워 두면 동기화가 알아서 채우므로 사람이 만질 일이 없다.
 *   4. 탭 색·탭 순서를 영역별로(shared/sheet-schema.js 의 TAB_GROUPS), "안내" 탭 맨 위에 영역별 탭 목차(탭 이동 링크).
 *      링크 탭에 `sheet:안내` 줄이 없으면 한 줄 추가한다(앱 상단 "구글 시트" 버튼이 이 주소로 안내 탭을 연다).
 *   5. 열마다 입력 검증: 정해진 선택지는 드롭다운(shared/sheet-schema.js 의 options), 날짜는 날짜만(표시 yyyy-mm-dd),
 *      숫자 열은 숫자만, 성함 참조는 교직원 탭의 성함 목록에서만, 학번은 5자리 숫자, 학년-반은 "2-5" 모양.
 * 검증은 "새로 입력하는 값"에만 걸린다. 이미 들어 있는 값은 고치지 않는다.
 */
import { pathToFileURL } from 'node:url';
import { TABLES, TAB_GROUPS, GUIDE_TAB, GUIDE_TAB_COLOR, GUIDE_MARKER } from '../shared/sheet-schema.js';

const MARK = '정보부앱:'; // 이 스크립트가 만든 보호 범위의 설명 앞머리(다시 돌릴 때 이것만 지우고 새로 만든다)
const GREY = { red: 0.94, green: 0.94, blue: 0.95 };
const INT_MAX = 2147483647;

const colLetter = (i) => { let s = ''; for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) s = String.fromCharCode(65 + (n % 26)) + s; return s; };
const a1Tab = (tab) => `'${tab.replace(/'/g, "''")}'`;

/**
 * 순수 함수: 시트의 현재 모양(tabs)으로 batchUpdate 요청 목록을 만든다.
 *   tabs: { [탭 이름]: { sheetId, headers: string[], oldProtectedIds: number[] } }
 *   adminEmails/serviceAccount: 잠글 때 편집을 허용할 사람(둘 다 없으면 경고만 하는 보호)
 */
export function buildGuardRequests({ tables = TABLES, tabs, adminEmails = [], serviceAccount = '' }) {
  const requests = [];
  const editors = [...new Set([serviceAccount, ...adminEmails].filter(Boolean))];
  const locked = adminEmails.length > 0;
  const protect = (sheetId, range, description) => ({
    addProtectedRange: { protectedRange: { range: { sheetId, ...range }, description: `${MARK} ${description}`, ...(locked ? { editors: { users: editors } } : { warningOnly: true }) } },
  });
  const validation = (sheetId, col, rule) => ({
    setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: col, endColumnIndex: col + 1 }, rule },
  });
  const staffTab = tabs['교직원'];
  const staffNameCol = staffTab ? staffTab.headers.indexOf('성함') : -1;

  for (const t of tables) {
    const tab = tabs[t.tab];
    if (!tab) continue;
    const { sheetId, headers } = tab;

    for (const id of tab.oldProtectedIds ?? []) requests.push({ deleteProtectedRange: { protectedRangeId: id } });
    requests.push({ updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } });
    requests.push(protect(sheetId, { startRowIndex: 0, endRowIndex: 1 }, `${t.tab} 머리글 줄 — 이름을 바꾸면 그 열이 동기화되지 않습니다`));

    const idCol = headers.indexOf('ID');
    if (idCol >= 0) {
      requests.push(protect(sheetId, { startRowIndex: 1, startColumnIndex: idCol, endColumnIndex: idCol + 1 }, `${t.tab} ID 열 — 비워 두면 동기화가 채웁니다`));
      requests.push({ repeatCell: {
        range: { sheetId, startRowIndex: 1, startColumnIndex: idCol, endColumnIndex: idCol + 1 },
        cell: { userEnteredFormat: { backgroundColor: GREY } }, fields: 'userEnteredFormat.backgroundColor',
      } });
    }

    for (const c of t.columns) {
      if (!c.key || c.key === 'id' || c.derived) continue;
      const col = headers.indexOf(c.header);
      if (col < 0) continue;
      const msg = c.note ? c.note.slice(0, 200) : undefined;
      const rule = (condition, strict = true, extra = {}) => ({ condition, strict, inputMessage: msg, ...extra });

      if (c.options) {
        requests.push(validation(sheetId, col, rule({ type: 'ONE_OF_LIST', values: c.options.map((v) => ({ userEnteredValue: v })) }, !c.loose, { showCustomUi: true })));
      } else if (c.type === 'date') {
        requests.push(validation(sheetId, col, rule({ type: 'DATE_IS_VALID' })));
        requests.push({ repeatCell: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: col, endColumnIndex: col + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat.numberFormat',
        } });
      } else if (c.type === 'int') {
        requests.push(validation(sheetId, col, rule({ type: 'NUMBER_BETWEEN', values: [{ userEnteredValue: String(-INT_MAX) }, { userEnteredValue: String(INT_MAX) }] })));
      } else if (c.ref === 'staff' && !c.refKey && staffNameCol >= 0) {
        const L = colLetter(staffNameCol);
        requests.push(validation(sheetId, col, rule({ type: 'ONE_OF_RANGE', values: [{ userEnteredValue: `=${a1Tab('교직원')}!$${L}$2:$${L}` }] }, true, { showCustomUi: true })));
      } else if (c.ref === 'students' || c.ref === 'classrooms') {
        const re = c.ref === 'students' ? '^[0-9]{5}$' : '^[0-9]+-[0-9]+$';
        requests.push(validation(sheetId, col, rule({ type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: `=REGEXMATCH(TO_TEXT(${colLetter(col)}2),"${re}")` }] })));
      }
    }
  }
  return requests;
}

const hexToRgb = (hex) => ({ red: parseInt(hex.slice(1, 3), 16) / 255, green: parseInt(hex.slice(3, 5), 16) / 255, blue: parseInt(hex.slice(5, 7), 16) / 255 });
const tintRgb = (hex, k = 0.2) => { const c = hexToRgb(hex); return { red: 1 - (1 - c.red) * k, green: 1 - (1 - c.green) * k, blue: 1 - (1 - c.blue) * k }; };

/** 순수 함수: 탭 색과 탭 순서(안내 → 영역 순서대로, 모르는 탭은 뒤). sheets: { [탭 이름]: sheetId } */
export function buildLayoutRequests({ sheets, groups = TAB_GROUPS }) {
  const colorOf = { [GUIDE_TAB]: GUIDE_TAB_COLOR, ...Object.fromEntries(groups.flatMap((g) => g.tabs.map((tab) => [tab, g.color]))) };
  const requests = [];
  let index = 0;
  for (const title of [GUIDE_TAB, ...groups.flatMap((g) => g.tabs)]) {
    if (sheets[title] === undefined) continue;
    requests.push({ updateSheetProperties: { properties: { sheetId: sheets[title], index: index++, tabColorStyle: { rgbColor: hexToRgb(colorOf[title]) } }, fields: 'index,tabColorStyle' } });
  }
  return requests;
}

/**
 * 순수 함수: "안내" 탭 맨 위(제목 줄 아래)에 영역별 탭 목차 블록을 넣는 계획.
 *   colA: 안내 탭 A열 값(표시된 글자). gids: { 탭 이름: sheetId }, labels: { 탭 이름: 설명 }
 * 이미 목차("탭 목차") 또는 예전 데모의 "탭 목록" 블록이 있으면 그 블록(다음 빈 줄까지)을 지우고 새로 넣어서, 몇 번을 돌려도 하나만 남는다.
 * 반환: structure(줄 삭제·삽입) → format(서식) → write(값, USER_ENTERED) 순서로 적용한다.
 */
export function planGuideBlock({ sheetId, colA, gids, labels, groups = TAB_GROUPS }) {
  const rows = [[GUIDE_MARKER, '탭 이름을 누르면 그 탭으로 이동합니다. 탭 색은 영역별입니다.']];
  const groupRows = [];
  for (const g of groups) {
    groupRows.push({ at: rows.length, color: g.color });
    rows.push([g.name, '']);
    for (const tab of g.tabs) rows.push([gids[tab] !== undefined ? `=HYPERLINK("#gid=${gids[tab]}","${tab}")` : tab, labels[tab] ?? '']);
  }
  rows.push(['', '']); // 다음 내용과의 구분 빈 줄

  const found = colA.findIndex((v) => v === GUIDE_MARKER || v === '탭 목록');
  let oldLen = 0;
  if (found >= 0) {
    let e = found + 1;
    while (e < colA.length && (colA[e] ?? '') !== '') e++;
    oldLen = e - found + (e < colA.length ? 1 : 0); // 블록 + 뒤의 빈 줄
  }
  const insertAt = found >= 0 ? Math.min(2, found) : 2;
  const rowsRange = (r0, r1) => ({ sheetId, startRowIndex: insertAt + r0, endRowIndex: insertAt + r1, startColumnIndex: 0, endColumnIndex: 2 });
  const fmt = (r0, r1, userEnteredFormat, fields) => ({ repeatCell: { range: rowsRange(r0, r1), cell: { userEnteredFormat }, fields } });

  const structure = [];
  if (found >= 0) structure.push({ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: found, endIndex: found + oldLen } } });
  structure.push({ insertDimension: { range: { sheetId, dimension: 'ROWS', startIndex: insertAt, endIndex: insertAt + rows.length }, inheritFromBefore: false } });
  const format = [
    fmt(0, rows.length, { backgroundColor: { red: 1, green: 1, blue: 1 }, textFormat: { bold: false } }, 'userEnteredFormat(backgroundColor,textFormat)'),
    fmt(0, 1, { textFormat: { bold: true } }, 'userEnteredFormat.textFormat'),
    ...groupRows.map((g) => fmt(g.at, g.at + 1, { backgroundColor: tintRgb(g.color), textFormat: { bold: true } }, 'userEnteredFormat(backgroundColor,textFormat)')),
  ];
  return { structure, format, write: { startRow: insertAt, rows }, insertAt, oldLen };
}

/** 링크 탭에 넣을 "안내 탭" 링크 한 줄(순수). { 머리글: 값 } — 앱 상단 "구글 시트" 버튼이 key 로 찾는다. */
export function guideLinkRow({ spreadsheetId, gid, tables = TABLES }) {
  const col = Object.fromEntries(tables.find((t) => t.table === 'links').columns.map((c) => [c.key, c.header]));
  return {
    [col.group_name]: '시트', [col.key]: `sheet:${GUIDE_TAB}`, [col.label]: `${GUIDE_TAB} 시트`,
    [col.url]: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${gid}`, [col.memo]: '구글 시트의 안내 탭으로 이동',
  };
}

/** 시트에 없는 탭·머리글 계산(순수). current: { [탭]: headers[] | null(탭 없음) } → { createTabs, addHeaders: { [탭]: 덧붙일 머리글[] } } */
export function planStructure(current, tables = TABLES) {
  const createTabs = [], addHeaders = {};
  for (const t of tables) {
    const want = t.columns.filter((c) => !c.derived).map((c) => c.header);
    const have = current[t.tab];
    if (!have) { createTabs.push(t.tab); addHeaders[t.tab] = want; continue; }
    const missing = want.filter((h) => !have.includes(h));
    if (missing.length) addHeaders[t.tab] = missing;
  }
  return { createTabs, addHeaders };
}

function summarizeLayout(layout, guide) {
  return `탭 색·순서 ${layout.length}개 탭, 안내 탭 목차 ${guide.write.rows.length - 1}줄(${guide.oldLen ? `기존 ${guide.oldLen}줄 교체` : '새로 추가'})`;
}

function summarize(requests) {
  const n = (k) => requests.filter((r) => r[k]).length;
  const v = requests.filter((r) => r.setDataValidation).map((r) => r.setDataValidation.rule.condition.type);
  const count = (t) => v.filter((x) => x === t).length;
  return `머리글 고정 ${n('updateSheetProperties')}, 보호 범위 ${n('addProtectedRange')}(기존 ${n('deleteProtectedRange')}개 교체), 드롭다운 ${count('ONE_OF_LIST')}, 날짜 검증 ${count('DATE_IS_VALID')}, 숫자 검증 ${count('NUMBER_BETWEEN')}, 성함 목록 검증 ${count('ONE_OF_RANGE')}, 학번·학년-반 형식 검증 ${count('CUSTOM_FORMULA')}`;
}

async function main() {
  const dry = process.argv.includes('--dry-run');
  const adminEmails = (process.env.SHEET_ADMIN_EMAILS ?? '').split(',').map((x) => x.trim()).filter(Boolean);

  if (dry) {
    const tabs = Object.fromEntries(TABLES.map((t, i) => [t.tab, { sheetId: i + 1, headers: t.columns.filter((c) => !c.derived).map((c) => c.header), oldProtectedIds: [] }]));
    const reqs = buildGuardRequests({ tabs, adminEmails, serviceAccount: 'sync@example.iam.gserviceaccount.com' });
    console.log(`[dry-run] 탭 ${TABLES.length}개 / 요청 ${reqs.length}개`);
    console.log(summarize(reqs));
    const gids = Object.fromEntries(TABLES.map((t, i) => [t.tab, i + 1]));
    const layout = buildLayoutRequests({ sheets: { [GUIDE_TAB]: 0, ...gids } });
    const guide = planGuideBlock({ sheetId: 0, colA: ['정보부 업무 관리 시스템 — 데이터 시트'], gids, labels: Object.fromEntries(TABLES.map((t) => [t.tab, t.label])) });
    console.log(summarizeLayout(layout, guide));
    console.log('링크 탭에 추가할 줄(없을 때만):', JSON.stringify(guideLinkRow({ spreadsheetId: '<시트 ID>', gid: 0 })));
    console.log(adminEmails.length ? `보호: ${adminEmails.length}명 + 서비스 계정만 편집` : '보호: 경고만(SHEET_ADMIN_EMAILS 를 적으면 잠금)');
    if (process.argv.includes('--json')) console.log(JSON.stringify(reqs, null, 1));
    return;
  }

  if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) throw new Error('GOOGLE_SHEET_ID / GOOGLE_SERVICE_ACCOUNT_JSON 이 필요합니다. (node --env-file=.env ...)');
  const { call, readTab, a1, appendRow } = await import('../netlify/lib/google-sheets.mts');
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).client_email;
  const meta = () => call('?fields=sheets(properties(sheetId,title),protectedRanges(protectedRangeId,description))');

  // 1. 탭·머리글 맞추기
  let { sheets } = await meta();
  const exists = new Set(sheets.map((s) => s.properties.title));
  const current = {};
  for (const t of TABLES) current[t.tab] = exists.has(t.tab) ? (await readTab(t.tab)).headers.filter(Boolean) : null;
  const plan = planStructure(current);
  const needGuide = !exists.has(GUIDE_TAB);
  if (needGuide) plan.createTabs.push(GUIDE_TAB);
  if (plan.createTabs.length) {
    await call(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: plan.createTabs.map((title) => ({ addSheet: { properties: { title } } })) }) });
    console.log(`탭 만듦: ${plan.createTabs.join(', ')}`);
  }
  if (needGuide) {
    await call('/values/' + encodeURIComponent(a1(GUIDE_TAB, 'A1')) + '?valueInputOption=RAW', { method: 'PUT', body: JSON.stringify({ values: [['정보부 업무 관리 시스템 — 데이터 시트']] }) });
  }
  const data = Object.entries(plan.addHeaders).map(([tab, hs]) => ({ range: a1(tab, `${colLetter((current[tab] ?? []).length)}1`), values: [hs] }));
  if (data.length) {
    await call('/values:batchUpdate', { method: 'POST', body: JSON.stringify({ valueInputOption: 'RAW', data }) });
    for (const [tab, hs] of Object.entries(plan.addHeaders)) if (current[tab]) console.log(`머리글 덧붙임 [${tab}]: ${hs.join(', ')}`);
  }

  // 2. 안전장치
  ({ sheets } = await meta());
  const tabs = {};
  const sheetIds = {};
  for (const s of sheets) sheetIds[s.properties.title] = s.properties.sheetId;
  for (const s of sheets) {
    const title = s.properties.title;
    if (!TABLES.some((t) => t.tab === title)) continue;
    const headers = (await readTab(title)).headers;
    const oldProtectedIds = (s.protectedRanges ?? []).filter((p) => (p.description ?? '').startsWith(MARK)).map((p) => p.protectedRangeId);
    tabs[title] = { sheetId: s.properties.sheetId, headers, oldProtectedIds };
  }
  const requests = buildGuardRequests({ tabs, adminEmails, serviceAccount });
  for (let i = 0; i < requests.length; i += 200) {
    await call(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: requests.slice(i, i + 200) }) });
  }
  console.log(`적용 완료: ${summarize(requests)}`);

  // 3. 탭 색·순서 + 안내 탭의 탭 목차
  const layout = buildLayoutRequests({ sheets: sheetIds });
  await call(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: layout }) });
  const colA = ((await call('/values/' + encodeURIComponent(a1(GUIDE_TAB, 'A:A')))).values ?? []).map((r) => r[0] ?? '');
  const guide = planGuideBlock({ sheetId: sheetIds[GUIDE_TAB], colA, gids: sheetIds, labels: Object.fromEntries(TABLES.map((t) => [t.tab, t.label])) });
  await call(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: [...guide.structure, ...guide.format] }) });
  await call('/values:batchUpdate', { method: 'POST', body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: [{ range: a1(GUIDE_TAB, `A${guide.write.startRow + 1}`), values: guide.write.rows }] }) });
  console.log(`적용 완료: ${summarizeLayout(layout, guide)}`);

  // 4. 링크 탭에 안내 탭 링크(상단 "구글 시트" 버튼용)
  const links = await readTab('링크');
  const linkRow = guideLinkRow({ spreadsheetId: process.env.GOOGLE_SHEET_ID, gid: sheetIds[GUIDE_TAB] });
  const keyCol = links.headers.indexOf(Object.keys(linkRow)[1]);
  if (keyCol >= 0 && !links.rows.some((r) => r[keyCol] === `sheet:${GUIDE_TAB}`)) {
    await appendRow('링크', linkRow);
    console.log('링크 탭에 안내 탭 링크를 추가했습니다(ID 칸은 다음 동기화가 채웁니다).');
  } else console.log('링크 탭에 안내 탭 링크가 이미 있습니다.');
  console.log(adminEmails.length ? `보호: ${adminEmails.join(', ')} 와 서비스 계정(${serviceAccount})만 머리글·ID 열을 고칠 수 있습니다.` : '보호: 경고만 띄웁니다(SHEET_ADMIN_EMAILS 를 적고 다시 돌리면 잠깁니다).');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
