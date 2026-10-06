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

/**
 * 표 전체를 1000행씩 나눠 읽는다. Supabase(PostgREST)는 한 번에 최대 1000행만 돌려주고, 넘는 부분은 오류 없이 잘라 버린다 —
 * 학생처럼 1000행을 넘기 쉬운 표를 그냥 select 하면 뒤쪽이 조용히 빠진다. 쪽 사이에 줄이 겹치거나 빠지지 않게 id 로 정렬한다.
 */
export async function selectAll(sb: any, table: string, columns = '*'): Promise<any[]> {
  const PAGE = 1000;
  const out: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select(columns).order('id').range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE) return out;
  }
}

/**
 * 시트 동기화가 도는 중이면 끝날 때까지 기다린다(최대 20초). 동기화는 탭마다 "시트 읽기 → DB 쓰기" 라서, 그 사이에 앱이 시트·DB 를 고치면
 * 동기화가 읽어 둔 옛 값으로 DB 를 덮거나 방금 추가한 행을 지울 수 있다. 앱의 쓰기 함수(cell·row·rental·manual)가 쓰기 전에 부른다.
 * 2분 넘게 안 끝난 기록은 멈춘 것으로 보고 기다리지 않는다.
 */
export async function waitForSync(sb: any, maxMs = 20_000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const { data } = await sb.from('sync_runs').select('id').is('finished_at', null)
      .gte('started_at', new Date(Date.now() - 2 * 60_000).toISOString()).limit(1);
    if (!data?.length) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export const errorResponse = (e: any) => json({ error: e?.message ?? String(e) }, e?.status ?? 500);
