import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import demo from '../data/demo.js';
import * as Ic from '../components/Icons.jsx';

export default function Login() {
  const { login, signUp, loginWithGoogle, isDemo } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'signup') {
        await signUp(email, password, name);
        setNotice('가입 요청이 접수되었습니다. 이메일 확인 후 관리자 승인이 끝나면 접속할 수 있습니다.');
      } else {
        await login(email, password);
      }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function google() {
    setError('');
    try { await loginWithGoogle(); } catch (err) { setError(err.message); }
  }

  return (
    <div className="auth">
      <form className="card fade" onSubmit={submit}>
        <div>
          <h1>정보부 업무 관리</h1>
          <p className="sub">관리자가 승인한 교직원만 접속할 수 있습니다. 한 번 로그인하면 이 기기에서는 다시 묻지 않습니다.</p>
        </div>

        {!isDemo && (
          <>
            <button type="button" className="btn btn-primary" onClick={google}>
              <Ic.Cloud />Goedu(Google) 계정으로 로그인
            </button>
            <div className="or">또는 이메일로</div>
          </>
        )}

        {mode === 'signup' && (
          <div className="field">
            <label htmlFor="name">이름</label>
            <input id="name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="교직원 배치표의 성함" required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" className="field-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@school.goedu.kr" required />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호{isDemo ? ' (데모: 아무 값)' : ''}</label>
          <input id="password" className="field-input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} required={!isDemo} />
        </div>

        {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}
        {notice && <div className="badge-info"><Ic.Info width="16" height="16" />{notice}</div>}

        <button type="submit" className="btn btn-primary" disabled={busy}>{mode === 'signup' ? '가입 요청' : '로그인'}</button>
        <button type="button" className="btn btn-secondary sm" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}>
          {mode === 'signup' ? '이미 계정이 있어요 → 로그인' : '계정이 없어요 → 가입 요청'}
        </button>

        {isDemo && (
          <div className="demo-accounts">
            <span className="small muted">데모 계정 (클릭하면 바로 로그인)</span>
            {demo.profiles.map((p) => (
              <button key={p.id} type="button" onClick={() => login(p.email, '')}>
                <b>{p.name}</b> · {p.email} · {p.approved ? (p.role === 'admin' ? '관리자' : '승인됨') : '승인 대기'}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
