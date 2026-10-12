/**
 * POST /.netlify/functions/sync-sheets { force?: boolean } → { runId } | { throttled: true }
 * "지금 동기화" 버튼. 승인된 사용자라면 누구나 부를 수 있다(시트를 막 고친 사람이 10분을 기다리지 않게).
 * 여기서는 동기화를 **시작만** 한다(기록 생성 → 백그라운드 함수 호출 → 바로 응답). 실제 동기화는 sync-sheets-background 가 하고,
 * 화면은 돌려받은 runId 로 sync_runs 를 보며 끝나기를 기다린다. 동기 함수 안에서 직접 돌리면 제한 시간(30초 안팎)에 걸려 중간에 죽는다.
 * 연타를 막으려고 마지막 동기화가 1분 안이면 새로 돌리지 않고 { throttled: true } 만 돌려준다(관리자는 제외).
 * force(행이 크게 줄어든 표도 그대로 반영)는 관리자만 쓸 수 있다.
 */
import { startSync, siteOrigin } from '../lib/sync-start.mts';
import { requireUser, json, errorResponse } from '../lib/supabase-admin.mts';

const COOLDOWN_MS = 60_000;

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb, profile } = await requireUser(req);
    const body: any = await req.json().catch(() => ({}));
    const isAdmin = profile.role === 'admin';
    if (body.force && !isAdmin) return json({ error: '관리자만 할 수 있습니다.' }, 403);
    if (!isAdmin) {
      const { data: last } = await sb.from('sync_runs').select('started_at').order('started_at', { ascending: false }).limit(1);
      const startedAt = last?.[0]?.started_at ? new Date(last[0].started_at).getTime() : 0;
      if (Date.now() - startedAt < COOLDOWN_MS) return json({ throttled: true });
    }
    const r = await startSync(sb, { force: !!body.force, trigger: 'button', origin: siteOrigin(req) });
    if ('running' in r) return json({ error: '이미 동기화가 진행 중입니다. 잠시 뒤에 다시 해 주세요.' }, 409);
    return json(r);
  } catch (e) { return errorResponse(e); }
};
