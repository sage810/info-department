/**
 * Google Sheets API v4 — 서비스 계정으로 읽기/쓰기 (외부 라이브러리 없이 node:crypto 로 JWT 서명)
 * 준비: GCP 서비스 계정 만들기 → 키(JSON) 발급 → 그 client_email 에 시트를 "편집자"로 공유
 * env: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON (JSON 한 줄)
 */
import { createSign } from 'node:crypto';

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID!;
const API = 'https://sheets.googleapis.com/v4/spreadsheets';

let cached: { token: string; exp: number } | null = null;

export async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
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
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`Google 토큰 발급 실패: ${json.error_description ?? res.status}`);
  cached = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

/** suffix 는 '/', ':', '?' 로 시작하는 그대로의 경로 (예: '/values:batchUpdate', ':batchUpdate', '?fields=...') */
async function call(suffix: string, init: RequestInit = {}) {
  const token = await accessToken();
  const res = await fetch(`${API}/${SHEET_ID()}${suffix}`, {
    ...init, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Sheets API 오류 (${res.status}): ${json.error?.message ?? suffix}`);
  return json;
}

/** 시트 이름을 A1 표기(따옴표 처리)로. cell 을 주면 '탭'!C5 형태 */
const a1 = (tab: string, cell?: string) => `'${tab.replace(/'/g, "''")}'${cell ? `!${cell}` : ''}`;
/** URL 경로에 넣을 때는 인코딩까지 */
const rangePath = (tab: string, cell?: string) => encodeURIComponent(a1(tab, cell));

/** 탭 전체를 읽어 { headers, rows } 로. rows 는 표시된 문자열 그대로. */
export async function readTab(tab: string): Promise<{ headers: string[]; rows: string[][] }> {
  const json = await call(`/values/${rangePath(tab)}?valueRenderOption=FORMATTED_VALUE`);
  const values: string[][] = json.values ?? [];
  const [headers = [], ...rows] = values;
  return { headers: headers.map((h) => String(h ?? '').trim()), rows: rows.map((r) => r.map((v) => String(v ?? '').trim())) };
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

function colLetter(i: number) {
  let s = '';
  for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) s = String.fromCharCode(65 + (n % 26)) + s;
  return s;
}
