/**
 * POST /.netlify/functions/sync-sheets { force?: boolean }
 * 승인된 사용자라면 누구나 "지금 동기화" 를 부를 수 있다(시트를 막 고친 사람이 10분을 기다리지 않게). 연타를 막으려고
 * 마지막 동기화가 1분 안이면 새로 돌리지 않고 { throttled: true } 만 돌려준다(관리자는 제외).
 * force(행이 크게 줄어든 표도 그대로 반영)는 관리자만 쓸 수 있다.
 */
import { runSync } from '../lib/sync.mts';
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
    return json(await runSync({ force: !!body.force }));
  } catch (e) { return errorResponse(e); }
};
