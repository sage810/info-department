/**
 * Google Sheets API v4 — 서비스 계정으로 읽기/쓰기 (외부 라이브러리 없이 node:crypto 로 JWT 서명)
 * 준비: GCP 서비스 계정 만들기 → 키(JSON) 발급 → 그 client_email 에 시트를 "편집자"로 공유
 * env: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON (JSON 한 줄)
 */
import { createSign } from 'node:crypto';

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID!;
const API = 'https://sheets.googleapis.com/v4/spreadsheets';
/** Google 요청 하나가 이보다 오래 걸리면 끊는다 — 응답이 안 오는 요청 하나가 동기화 전체를 붙잡아 두지 않게 */
const TIMEOUT_MS = 30_000;

let cached: { token: string; exp: number } | null = null;
let inflight: Promise<string> | null = null;

/** 동시에 여러 번 불려도 토큰은 한 번만 받는다(탭을 한꺼번에 읽을 때 토큰 요청이 겹치지 않게). */
export function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return Promise.resolve(cached.token);
  inflight ??= fetchToken().finally(() => { inflight = null; });
  return inflight;
}

async function fetchToken(): Promise<string> {
  const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '{}');
  if (!sa.client_email || !sa.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON 이 없거나 형식이 틀립니다.');
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`Google 토큰 발급 실패: ${json.error_description ?? res.status}`);
  cached = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

/** suffix 는 '/', ':', '?' 로 시작하는 그대로의 경로 (예: '/values:batchUpdate', ':batchUpdate', '?fields=...') */
export async function call(suffix: string, init: RequestInit = {}) {
  const token = await accessToken();
  const res = await fetch(`${API}/${SHEET_ID()}${suffix}`, {
    ...init, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Sheets API 오류 (${res.status}): ${json.error?.message ?? suffix}`);
  return json;
}

/** 시트 이름을 A1 표기(따옴표 처리)로. cell 을 주면 '탭'!C5 형태 */
export const a1 = (tab: string, cell?: string) => `'${tab.replace(/'/g, "''")}'${cell ? `!${cell}` : ''}`;
/** URL 경로에 넣을 때는 인코딩까지 */
const rangePath = (tab: string, cell?: string) => encodeURIComponent(a1(tab, cell));

export type TabData = { headers: string[]; rows: string[][] };
const parseValues = (values: string[][] = []): TabData => {
  const [headers = [], ...rows] = values;
  return { headers: headers.map((h) => String(h ?? '').trim()), rows: rows.map((r) => r.map((v) => String(v ?? '').trim())) };
};

/** 탭 전체를 읽어 { headers, rows } 로. rows 는 표시된 문자열 그대로. */
export async function readTab(tab: string): Promise<TabData> {
  const json = await call(`/values/${rangePath(tab)}?valueRenderOption=FORMATTED_VALUE`);
  return parseValues(json.values);
}

/**
 * 탭 여러 개를 요청 두 번으로 읽는다(탭 목록 1번 + values:batchGet 1번). 동기화가 24개 탭을 따로따로 부르던 것을 줄인 것.
 * batchGet 은 없는 탭이 하나라도 섞이면 전체가 실패하므로, 먼저 탭 목록을 보고 있는 탭만 묻는다. 없는 탭은 { error } 로 돌려준다.
 */
export async function readTabs(tabs: string[]): Promise<Map<string, TabData | { error: Error }>> {
  const meta = await call('?fields=sheets.properties.title');
  const titles = new Set<string>((meta.sheets ?? []).map((s: any) => s.properties.title));
  const out = new Map<string, TabData | { error: Error }>();
  const present = tabs.filter((t) => titles.has(t));
  for (const t of tabs) if (!titles.has(t)) out.set(t, { error: new Error('시트에 이 탭이 없습니다') });
  if (present.length) {
    const json = await call(`/values:batchGet?${present.map((t) => `ranges=${rangePath(t)}`).join('&')}&valueRenderOption=FORMATTED_VALUE`);
    (json.valueRanges ?? []).forEach((vr: any, i: number) => out.set(present[i], parseValues(vr.values)));
  }
  return out;
}

/** 머리글 이름 → 값 맵을 받아 탭 끝에 한 줄 추가 (열 순서는 시트의 머리글 순서를 따른다) */
export async function appendRow(tab: string, byHeader: Record<string, unknown>) {
  const { headers } = await readTab(tab);
  const values = headers.map((h) => (byHeader[h] ?? '') as string);
  await call(`/values/${rangePath(tab, 'A1')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST', body: JSON.stringify({ values: [values] }),
  });
  return values;
}

/** ID 열(A열)로 행을 찾아, 머리글 이름의 셀 하나를 바꾼다. 못 찾으면 false. */
export async function updateCellById(tab: string, id: string, header: string, value: unknown): Promise<boolean> {
  const { headers, rows } = await readTab(tab);
  const col = headers.indexOf(header);
  const rowIdx = rows.findIndex((r) => r[0] === id);
  if (col < 0 || rowIdx < 0) return false;
  await call(`/values/${rangePath(tab, `${colLetter(col)}${rowIdx + 2}`)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT', body: JSON.stringify({ values: [[value ?? '']] }),
  });
  return true;
}

/** ID 열(A열)로 행을 찾아, 여러 머리글의 셀을 한 번에 바꾼다. 못 찾으면 false. */
export async function updateFieldsById(tab: string, id: string, byHeader: Record<string, unknown>): Promise<boolean> {
  const { headers, rows } = await readTab(tab);
  const rowIdx = rows.findIndex((r) => r[0] === id);
  if (rowIdx < 0) return false;
  const data = Object.entries(byHeader)
    .map(([h, v]) => [headers.indexOf(h), v] as const)
    .filter(([col]) => col >= 0)
    .map(([col, v]) => ({ range: a1(tab, `${colLetter(col)}${rowIdx + 2}`), values: [[v ?? '']] }));
  if (!data.length) return true;
  await call('/values:batchUpdate', { method: 'POST', body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data }) });
  return true;
}

let sheetIdCache: Record<string, number> | null = null;
async function tabSheetId(tab: string): Promise<number> {
  if (!sheetIdCache) {
    const json = await call('?fields=sheets.properties');
    sheetIdCache = {};
    for (const s of json.sheets ?? []) sheetIdCache[s.properties.title] = s.properties.sheetId;
  }
  const id = sheetIdCache[tab];
  if (id === undefined) throw new Error(`시트에서 "${tab}" 탭을 찾지 못했습니다.`);
  return id;
}

/** ID 열(A열)로 행을 찾아 그 줄을 통째로 지운다(아래 행이 한 칸씩 올라온다). 못 찾으면 false. */
export async function deleteRowById(tab: string, id: string): Promise<boolean> {
  const { rows } = await readTab(tab);
  const rowIdx = rows.findIndex((r) => r[0] === id);
  if (rowIdx < 0) return false;
  const sheetId = await tabSheetId(tab);
  await call(':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIdx + 1, endIndex: rowIdx + 2 } } }] }),
  });
  return true;
}

/**
 * 비어 있던 ID 칸을 채운다. pending 은 동기화가 읽을 때의 { 행 위치(0부터, 머리글 제외), 만든 id, 그 행의 원래 값 }.
 * 읽은 뒤 앱이 줄을 지우거나 끼워 넣었을 수 있어서(행 위치가 밀림), 쓰기 직전에 다시 읽어 그 위치의 줄이 처음 읽은 것과 같을 때만 쓴다.
 * 쓴 개수를 돌려준다.
 */
export async function fillIds(tab: string, idCol: number, pending: { rowIdx: number; id: string; raw: string[] }[]): Promise<number> {
  if (!pending.length || idCol < 0) return 0;
  const { rows } = await readTab(tab);
  const trim = (r: string[] = []) => { const c = r.slice(); while (c.length && !c[c.length - 1]) c.pop(); return JSON.stringify(c); };
  const data = pending
    .filter((p) => trim(rows[p.rowIdx]) === trim(p.raw))
    .map((p) => ({ range: a1(tab, `${colLetter(idCol)}${p.rowIdx + 2}`), values: [[p.id]] }));
  if (!data.length) return 0;
  await call('/values:batchUpdate', { method: 'POST', body: JSON.stringify({ valueInputOption: 'RAW', data }) });
  return data.length;
}

export function colLetter(i: number) {
  let s = '';
  for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) s = String.fromCharCode(65 + (n % 26)) + s;
  return s;
}
