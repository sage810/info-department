/**
 * 실제 시트 → DB 동기화. 파일 이름이 -background 로 끝나 Netlify 백그라운드 함수(제한 시간 15분)로 돈다.
 * 시작 함수(sync-sheets)와 예약 함수(sync-sheets-scheduled)가 서명 헤더와 함께 { runId, force, trigger } 로 부른다.
 * 백그라운드 함수라 부른 쪽은 202 를 바로 받고, 결과는 sync_runs(runId 행)에 남는다. 서명이 틀리면 아무것도 하지 않는다 —
 * 그 경우 미리 만들어진 기록은 3분 뒤 "중단됨"으로 닫힌다(closeStaleRuns).
 */
import { runSync } from '../lib/sync.mts';
import { verifyTrigger, SIGN_HEADER } from '../lib/sync-start.mts';

export default async (req: Request) => {
  if (!verifyTrigger(req.headers.get(SIGN_HEADER))) { console.error('sync-sheets-background: 서명이 맞지 않아 무시'); return new Response('forbidden', { status: 403 }); }
  const body: any = await req.json().catch(() => ({}));
  const runId = Number(body.runId);
  if (!runId) return new Response('runId 없음', { status: 400 });
  try {
    const r = await runSync({ runId, force: !!body.force, trigger: body.trigger === 'schedule' ? 'schedule' : 'button' });
    console.log(`sync #${runId} ok`, JSON.stringify(r.summary));
  } catch (e: any) {
    console.error(`sync #${runId} failed`, e.message);
  }
  return new Response('ok');
};
