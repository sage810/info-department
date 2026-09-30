/** 서버용 Supabase 클라이언트(service role) + 요청자 확인 */
import { createClient } from '@supabase/supabase-js';

export function adminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다.');
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Authorization: Bearer <access_token> 을 확인하고 profiles 행을 돌려준다. 승인 안 된 사용자는 에러. */
export async function requireUser(req: Request, opts: { admin?: boolean } = {}) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) throw Object.assign(new Error('로그인이 필요합니다.'), { status: 401 });
  const sb = adminClient();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw Object.assign(new Error('세션이 만료되었습니다. 다시 로그인해 주세요.'), { status: 401 });
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile?.approved) throw Object.assign(new Error('승인되지 않은 계정입니다.'), { status: 403 });
  if (opts.admin && profile.role !== 'admin') throw Object.assign(new Error('관리자만 할 수 있습니다.'), { status: 403 });
  return { sb, profile };
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export const errorResponse = (e: any) => json({ error: e?.message ?? String(e) }, e?.status ?? 500);
