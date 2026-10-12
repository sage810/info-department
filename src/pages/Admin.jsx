import { useState } from 'react';
import { api, useQuery } from '../lib/data.js';
import { useAuth } from '../lib/auth.jsx';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import { waitForSyncRun } from '../components/SyncStatus.jsx';
import * as Ic from '../components/Icons.jsx';

/** 관리자: 접속 승인 + 시트 동기화 */
export default function Admin() {
  const { isDemo, profile } = useAuth();
  const q = useQuery(api.profiles);
  const runs = useQuery(api.syncRuns);
  const [busy, setBusy] = useState(false);
  const lastSkipped = runs.data?.[0]?.summary?.skipped ?? [];
  const hasShrink = lastSkipped.some((x) => x.reason === 'shrink');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function toggle(p, approved) {
    if (!approved && !window.confirm(`${p.name ?? p.email} 님의 승인을 취소할까요? 취소하면 바로 접속할 수 없게 됩니다.`)) return;
    try { await api.setApproved(p.id, approved); q.reload(); } catch (e) { setError(e.message); }
  }
  async function role(p, r) {
    try { await api.setRole(p.id, r); q.reload(); } catch (e) { setError(e.message); }
  }
  async function sync(force = false) {
    if (force && !window.confirm('행이 크게 줄어든 표도 시트 그대로 DB 에 반영합니다. 시트에서 일부러 지운 게 맞나요?')) return;
    setBusy(true); setMsg(''); setError('');
    try {
      const r = await api.syncNow({ force }); // 시작만 → 기록이 끝날 때까지 기다린다
      const run = r?.runId ? await waitForSyncRun(r.runId) : null;
      if (r?.throttled) setMsg('방금 동기화했습니다. 1분 뒤에 다시 눌러 주세요.');
      else if (!run) setMsg('동기화가 아직 끝나지 않았습니다. 잠시 뒤 아래 표를 새로고침하세요.');
      else setMsg(`${run.ok ? '동기화 완료' : '동기화 실패'}: ${JSON.stringify(Object.fromEntries(Object.entries(run.summary ?? {}).filter(([k]) => k !== 'skipped' && k !== 'problems')))}`);
      runs.reload();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
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
      <PageHeader title="관리자" desc="로그인 요청을 승인하고, 구글 시트를 지금 바로 읽어 옵니다. (자동 동기화는 10분마다)">
        <button type="button" className="btn btn-primary" onClick={() => sync()} disabled={busy || isDemo} title={isDemo ? '데모 모드에서는 동기화 없음' : ''}>
          <Ic.Refresh />{busy ? '동기화 중…' : '시트 지금 동기화'}
        </button>
      </PageHeader>
      {isDemo && <div className="badge-info"><Ic.Info width="16" height="16" />데모 모드: 승인 상태는 이 브라우저(localStorage)에만 저장됩니다. 실제 운영에서는 Supabase profiles 테이블에 저장되고, 동기화는 10분마다 자동 + 이 버튼으로 즉시 실행됩니다.</div>}
      {hasShrink && !isDemo && (
        <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />
          <span>시트에서 행이 크게 줄어든 표가 있어 그 표는 동기화하지 않았습니다. 실수로 지운 게 아니라면 시트를 되돌리고, 일부러 지웠다면&nbsp;
            <button type="button" className="btn btn-danger sm" onClick={() => sync(true)} disabled={busy}>그대로 반영하고 동기화</button></span>
        </div>
      )}
      {msg && <div className="badge-info"><Ic.Check width="16" height="16" />{msg}</div>}
      {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}

      <section>
        <h2 className="section-title">접속 계정</h2>
        <DataTable bandless columns={cols} rows={q.data} loading={q.loading} error={q.error} searchKeys={['name', 'email']} searchPlaceholder="예: 한나라"
          filter={undefined} showCount={false} />
      </section>

      {!isDemo && (
        <section>
          <h2 className="section-title">최근 동기화</h2>
          <DataTable columns={[
            { key: 'started_at', header: '시작', render: (r) => new Date(r.started_at).toLocaleString('ko-KR') },
            { key: 'ok', header: '결과', render: (r) => (r.ok ? <span className="badge green">성공</span> : <span className="badge red">실패</span>) },
            { key: 'skipped', header: '건너뜀', render: (r) => {
              const sk = r.summary?.skipped ?? [];
              return sk.length ? <span className="memo-lines">{sk.map((x, i) => <span className="memo-line" key={i}><b>{x.tab}</b> <span>{x.detail}</span></span>)}</span> : '—';
            } },
            { key: 'problems', header: '확인할 것', render: (r) => {
              // 목록은 50건까지만 기록되지만(실패가 앞), 전체 건수와 유형별 건수는 problems_total·problem_counts 에 남는다
              const p = r.summary?.problems ?? [];
              const total = r.summary?.problems_total ?? p.length;
              const counts = Object.entries(r.summary?.problem_counts ?? {});
              return p.length ? <span className="memo-lines">
                {counts.length > 0 && <span className="memo-line"><b>{counts.map(([k, n]) => `${k} ${n}`).join(' · ')}</b></span>}
                {p.slice(0, 5).map((x, i) => <span className="memo-line" key={i}>{x}</span>)}
                {total > 5 && <span className="muted small">외 {total - 5}건</span>}
              </span> : '—';
            } },
            { key: 'summary', header: '요약', render: (r) => <span className="mono small">{JSON.stringify(Object.fromEntries(Object.entries(r.summary ?? {}).filter(([k]) => k !== 'skipped' && k !== 'problems')))}</span> },
          ]} rows={runs.data} loading={runs.loading} error={runs.error} emptyText="아직 동기화 기록이 없습니다." />
        </section>
      )}
    </>
  );
}
