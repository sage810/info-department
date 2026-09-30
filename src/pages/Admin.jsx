import { useState } from 'react';
import { api, useQuery } from '../lib/data.js';
import { useAuth } from '../lib/auth.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import * as Ic from '../components/Icons.jsx';

/** 관리자: 접속 승인 + 시트 동기화 */
export default function Admin() {
  const { isDemo, profile } = useAuth();
  const q = useQuery(api.profiles);
  const runs = useQuery(api.syncRuns);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function toggle(p, approved) {
    if (!approved && !window.confirm(`${p.name ?? p.email} 님의 승인을 취소할까요? 취소하면 바로 접속할 수 없게 됩니다.`)) return;
    try { await api.setApproved(p.id, approved); q.reload(); } catch (e) { setError(e.message); }
  }
  async function role(p, r) {
    try { await api.setRole(p.id, r); q.reload(); } catch (e) { setError(e.message); }
  }
  async function sync() {
    setBusy(true); setMsg(''); setError('');
    try { const r = await api.syncNow(); setMsg(`동기화 완료: ${JSON.stringify(r.summary ?? r)}`); runs.reload(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  const cols = [
    { key: 'name', header: '이름' },
    { key: 'email', header: '이메일', className: 'mono' },
    { key: 'role', header: '권한', filterValue: (p) => (p.role === 'admin' ? '관리자' : '일반'), render: (p) => (
      <select className="field-input" style={{ minHeight: 32, padding: '4px 8px', width: 'auto' }} value={p.role} aria-label={`${p.email} 권한`}
        disabled={p.id === profile?.id} onChange={(e) => role(p, e.target.value)}>
        <option value="member">일반</option><option value="admin">관리자</option>
      </select>) },
    { key: 'approved', header: '승인', filterValue: (p) => (p.approved ? '승인됨' : '대기'), render: (p) => (p.approved
      ? <button type="button" className="btn btn-danger sm" disabled={p.id === profile?.id} onClick={() => toggle(p, false)}>승인 취소</button>
      : <button type="button" className="btn btn-primary sm" onClick={() => toggle(p, true)}><Ic.Check />승인</button>) },
  ];

  return (
    <>
      <PageHeader title="관리자" desc="로그인 요청을 승인하고, 구글 시트를 지금 바로 읽어 옵니다.">
        <button type="button" className="btn btn-primary" onClick={sync} disabled={busy || isDemo} title={isDemo ? '데모 모드에서는 동기화 없음' : ''}>
          <Ic.Refresh />{busy ? '동기화 중…' : '시트 지금 동기화'}
        </button>
      </PageHeader>
      {isDemo && <div className="badge-info"><Ic.Info width="16" height="16" />데모 모드: 승인 상태는 이 브라우저(localStorage)에만 저장됩니다. 실제 운영에서는 Supabase profiles 테이블에 저장되고, 동기화는 10분마다 자동 + 이 버튼으로 즉시 실행됩니다.</div>}
      {msg && <div className="badge-info"><Ic.Check width="16" height="16" />{msg}</div>}
      {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}

      <section>
        <h2 className="section-title">접속 계정</h2>
        <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} searchKeys={['name', 'email']} searchPlaceholder="예: 한나라, hannara"
          filter={undefined} />
      </section>

      {!isDemo && (
        <section>
          <h2 className="section-title">최근 동기화</h2>
          <DataTable columns={[
            { key: 'started_at', header: '시작', render: (r) => new Date(r.started_at).toLocaleString('ko-KR') },
            { key: 'ok', header: '결과', render: (r) => (r.ok ? <span className="badge green">성공</span> : <span className="badge red">실패</span>) },
            { key: 'summary', header: '요약', render: (r) => <span className="mono small">{JSON.stringify(r.summary)}</span> },
          ]} rows={runs.data} loading={runs.loading} error={runs.error} emptyText="아직 동기화 기록이 없습니다." />
        </section>
      )}
    </>
  );
}
