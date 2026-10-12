/**
 * 동기화 "시작"만 맡는다: 기록(sync_runs) 한 줄을 만들고 백그라운드 함수(sync-sheets-background)를 부른 뒤 바로 돌아온다.
 * 실제 동기화는 백그라운드 함수가 한다(제한 시간 15분). 동기 함수 안에서 직접 돌리면 30초 안팎의 제한에 걸려 중간에 죽기 때문.
 *
 * 백그라운드 함수는 주소만 알면 누구나 부를 수 있으므로, 서명 헤더(x-sync-sign)로 "이 사이트의 함수가 부른 것"임을 확인한다.
 * 서명 비밀은 이미 두 함수 모두 가진 SUPABASE_SERVICE_ROLE_KEY 에서 만든다 — 환경변수를 새로 만들 필요가 없고 키 자체는 오가지 않는다.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { closeStaleRuns, runningSync } from './supabase-admin.mts';

export const SIGN_HEADER = 'x-sync-sign';
const SIGN_MAX_AGE_MS = 5 * 60_000;

const secret = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY 가 없습니다.');
  return createHmac('sha256', key).update('sync-trigger').digest();
};
const sign = (ts: string) => createHmac('sha256', secret()).update(ts).digest('hex');

export const signTrigger = () => { const ts = String(Date.now()); return `${ts}.${sign(ts)}`; };

/** 헤더 값이 5분 안에 이 사이트가 만든 서명이면 true */
export function verifyTrigger(header: string | null): boolean {
  try {
    const [ts, mac] = String(header ?? '').split('.');
    if (!ts || !mac || !/^\d+$/.test(ts) || Math.abs(Date.now() - Number(ts)) > SIGN_MAX_AGE_MS) return false;
    const a = Buffer.from(mac, 'hex'), b = Buffer.from(sign(ts), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}

export type StartResult = { runId: number } | { running: number };

/**
 * 중단된 기록을 닫고, 도는 게 없으면 기록을 만들어 백그라운드 함수를 부른다. 이미 돌고 있으면 { running: 그 id }.
 * origin: 이 사이트 주소(https://…netlify.app). 백그라운드 호출이 실패하면 기록을 실패로 닫고 던진다.
 */
export async function startSync(sb: any, { force = false, trigger, origin }: { force?: boolean; trigger: 'button' | 'schedule'; origin: string }): Promise<StartResult> {
  await closeStaleRuns(sb);
  const running = await runningSync(sb);
  if (running) return { running };
  const { data: run, error } = await sb.from('sync_runs').insert({ summary: { trigger, phase: 'queued' } }).select('id').single();
  if (error || !run) throw new Error(`동기화 기록을 만들지 못했습니다: ${error?.message ?? ''}`);
  try {
    const res = await fetch(`${origin}/.netlify/functions/sync-sheets-background`, {
      method: 'POST', headers: { 'content-type': 'application/json', [SIGN_HEADER]: signTrigger() },
      body: JSON.stringify({ runId: run.id, force }), signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok && res.status !== 202) throw new Error(`백그라운드 함수 응답 ${res.status}`);
  } catch (e: any) {
    await sb.from('sync_runs').update({ finished_at: new Date().toISOString(), ok: false, summary: { trigger, error: `동기화를 시작하지 못했습니다: ${e.message}` } }).eq('id', run.id);
    throw Object.assign(new Error(`동기화를 시작하지 못했습니다: ${e.message}`), { status: 502 });
  }
  return { runId: run.id };
}

/** 이 사이트의 주소. Netlify 가 주는 URL 환경변수가 먼저(예약 실행은 사용자 요청이 없어 이게 믿을 만하다), 없으면 받은 요청의 주소에서. */
export function siteOrigin(req: Request): string {
  const url = process.env.URL;
  if (url && /^https?:\/\//.test(url)) return url.replace(/\/$/, '');
  return new URL(req.url).origin;
}
