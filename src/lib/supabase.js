import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** 환경변수가 없으면 null → 앱은 데모 모드로 동작 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isDemo = !supabase;

/** Netlify Function 호출 (Supabase 모드 전용). 로그인 토큰을 같이 보낸다. */
export async function callFunction(name, body) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${name} 실패 (${res.status})`);
  return json;
}
