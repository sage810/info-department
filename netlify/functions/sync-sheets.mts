/** POST /.netlify/functions/sync-sheets — 관리자가 "시트 지금 동기화" 를 눌렀을 때 */
import { runSync } from '../lib/sync.mts';
import { requireUser, json, errorResponse } from '../lib/supabase-admin.mts';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    await requireUser(req, { admin: true });
    return json(await runSync());
  } catch (e) { return errorResponse(e); }
};
