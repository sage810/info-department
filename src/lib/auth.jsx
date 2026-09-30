/**
 * 인증 컨텍스트
 *  - Supabase 모드: Google OAuth(goedu 계정) 또는 이메일/비밀번호. 세션은 Supabase 가 localStorage 에 보관해
 *    같은 기기에서는 다시 로그인하지 않아도 된다. 접근은 profiles.approved = true 인 사용자만.
 *  - 데모 모드: 이메일만으로 로그인. src/data/demo.js 의 profiles 로 승인 여부를 흉내 낸다.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isDemo } from './supabase.js';
import demo from '../data/demo.js';

const AuthCtx = createContext(null);

/** Supabase 오류를 "무엇을 하면 되는지" 가 있는 한국어 안내로 바꾼다 */
function friendly(error) {
  const m = String(error?.message ?? '').toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) return '이메일 또는 비밀번호가 맞지 않습니다. 다시 입력해 주세요.';
  if (m.includes('email not confirmed')) return '가입 메일의 확인 링크를 먼저 눌러 주세요. 메일이 없으면 스팸함을 확인하세요.';
  if (m.includes('already registered') || m.includes('already been registered')) return '이미 가입된 이메일입니다. "로그인" 으로 들어가 주세요.';
  if (m.includes('password should be') || m.includes('weak password')) return '비밀번호는 6자 이상으로 정해 주세요.';
  if (m.includes('rate limit') || m.includes('too many')) return '시도가 너무 잦습니다. 1분 뒤에 다시 해 주세요.';
  if (m.includes('network') || m.includes('fetch')) return '서버에 연결할 수 없습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.';
  return '로그인할 수 없습니다. 잠시 후 다시 시도하거나 정보과학부(내선 739)에 문의하세요.';
}
const DEMO_SESSION = 'infodept.demo.session';
const DEMO_PROFILES = 'infodept.demo.profiles';

export function loadDemoProfiles() {
  try { const s = localStorage.getItem(DEMO_PROFILES); if (s) return JSON.parse(s); } catch { /* ignore */ }
  return demo.profiles.map((p) => ({ ...p }));
}
export function saveDemoProfiles(list) {
  try { localStorage.setItem(DEMO_PROFILES, JSON.stringify(list)); } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, email }
  const [profile, setProfile] = useState(null); // { id, email, name, role, approved, staff_id }
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u) => {
    if (!u) { setProfile(null); return; }
    if (isDemo) {
      setProfile(loadDemoProfiles().find((p) => p.email === u.email) ?? null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      if (isDemo) {
        const email = localStorage.getItem(DEMO_SESSION);
        const u = email ? { id: `demo:${email}`, email } : null;
        setUser(u); await loadProfile(u); setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u); await loadProfile(u); setLoading(false);
      const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
        const nu = session?.user ?? null;
        setUser(nu); await loadProfile(nu);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => unsub();
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    email = email.trim().toLowerCase();
    if (isDemo) {
      const list = loadDemoProfiles();
      if (!list.some((p) => p.email === email)) {
        list.push({ id: `demo:${email}`, email, name: email.split('@')[0], role: 'member', approved: false, staff_id: null });
        saveDemoProfiles(list);
      }
      localStorage.setItem(DEMO_SESSION, email);
      const u = { id: `demo:${email}`, email };
      setUser(u); await loadProfile(u);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendly(error));
  }, [loadProfile]);

  const signUp = useCallback(async (email, password, name) => {
    if (isDemo) return login(email, password);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) throw new Error(friendly(error));
  }, [login]);

  const loginWithGoogle = useCallback(async () => {
    if (isDemo) throw new Error('데모 모드에서는 Google 로그인을 쓸 수 없습니다. 아래 데모 계정을 눌러 주세요.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } },
    });
    if (error) throw new Error(friendly(error));
  }, []);

  const logout = useCallback(async () => {
    if (isDemo) { localStorage.removeItem(DEMO_SESSION); setUser(null); setProfile(null); return; }
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user]);

  const value = {
    user, profile, loading, isDemo,
    isApproved: !!profile?.approved,
    isAdmin: !!profile?.approved && profile?.role === 'admin',
    login, signUp, loginWithGoogle, logout, refreshProfile,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
