import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, refreshAllData } from '../lib/data.js';
import { getUnsavedTotal } from '../lib/unsaved.js';
import * as Ic from './Icons.jsx';

/**
 * 시트 → 웹앱 동기화 상태(실제 모드 전용). 서버가 10분마다 시트를 읽어 DB 를 맞추므로, 시트를 직접 고친 사람이 결과를 기다리지 않게
 *   - 상단 띠에 "시트 동기화 N분 전" + "지금 동기화" 버튼(SyncChip),
 *   - 마지막 동기화에서 건너뛴 탭이 있거나 실패했으면 본문 위에 경고 띠(SyncBanner)
 * 를 보여 준다. 마지막 동기화 시각이 바뀌면(내가 눌렀든 자동이든) 화면의 데이터를 다시 읽는다 — 저장하지 않은 변경이 있으면 건너뛰고 안내만.
 */
const POLL_MS = 60_000;
const TICK_MS = 30_000;

export function agoText(iso, now = Date.now()) {
  const m = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}시간 전` : `${Math.floor(h / 24)}일 전`;
}

/**
 * "지금 동기화"는 서버에서 시작만 되고(백그라운드 함수) 끝은 sync_runs 기록에 남는다. 그 기록(runId)이 끝날 때까지 2초마다 본다.
 * 끝난 기록을 돌려주고, 시간 안에 안 끝나면 null.
 */
export async function waitForSyncRun(runId, { timeoutMs = 5 * 60_000, everyMs = 2000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, everyMs));
    const run = await api.syncRun(runId);
    if (run?.finished_at) return run;
  }
  return null;
}

/** Layout 이 한 번 부른다. enabled=false(데모)면 아무것도 하지 않는다. */
export function useSyncStatus(enabled) {
  const [run, setRun] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const seen = useRef(null); // 마지막으로 본 finished_at
  const msgTimer = useRef(null);

  const say = useCallback((text) => {
    setMsg(text);
    clearTimeout(msgTimer.current);
    if (text) msgTimer.current = setTimeout(() => setMsg(''), 8000);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await api.syncStatus();
      setRun(r);
      const at = r?.finished_at ?? null;
      if (seen.current !== null && at && at !== seen.current) {
        if (getUnsavedTotal() === 0) refreshAllData();
        else say('시트가 새로 동기화됐습니다. 저장하지 않은 변경을 저장한 뒤 화면을 새로고침하세요.');
      }
      if (at) seen.current = at; else if (seen.current === null) seen.current = '';
    } catch { /* 상태를 못 읽어도 화면은 그대로 */ }
  }, [say]);

  useEffect(() => {
    if (!enabled) return undefined;
    load();
    const poll = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => { clearInterval(poll); clearInterval(tick); clearTimeout(msgTimer.current); };
  }, [enabled, load]);

  const syncNow = useCallback(async () => {
    setBusy(true); say('');
    try {
      const r = await api.syncNow(); // 시작만 하고 바로 돌아온다 → 기록이 끝날 때까지 본다
      if (r?.throttled) say('방금 동기화했습니다. 1분 뒤에 다시 눌러 주세요.');
      else {
        const run = await waitForSyncRun(r.runId);
        if (!run) say('동기화가 오래 걸리고 있습니다. 잠시 뒤 다시 확인해 주세요.');
        else if (run.ok === false) say(`동기화 실패: ${run.summary?.error ?? '관리자 화면에서 확인하세요.'}`);
      }
      await load();
    } catch (e) { say(e.message); }
    finally { setBusy(false); }
  }, [load, say]);

  return { run, now, busy, msg, syncNow };
}

/** 상단 어두운 띠 안: "시트 동기화 3분 전 [지금 동기화]" */
export function SyncChip({ sync }) {
  const { run, now, busy, msg, syncNow } = sync;
  return (
    <span className="sync-chip">
      <span className="sync-when" role="status">{busy ? '시트를 읽는 중…' : msg || (run?.finished_at ? `시트 동기화 ${agoText(run.finished_at, now)}` : '시트 동기화 기록 없음')}</span>
      <button type="button" className="btn sm btn-toggle sync-btn" onClick={syncNow} disabled={busy}
        title="구글 시트에서 직접 고친 내용을 지금 바로 가져옵니다"><Ic.Refresh />지금 동기화</button>
    </span>
  );
}

/** 마지막 동기화가 실패했거나 건너뛴 탭이 있을 때 본문 위에 */
export function SyncBanner({ run, isAdmin }) {
  if (!run) return null;
  const skipped = run.summary?.skipped ?? [];
  if (run.ok !== false && !skipped.length) return null;
  const tabs = [...new Set(skipped.map((s) => s.tab))];
  return (
    <div className="badge-error sync-banner" role="status">
      <Ic.Alert width="16" height="16" />
      <span>
        {run.ok === false ? '시트 동기화에 실패했습니다. 관리자에게 알려 주세요.' : '시트에 문제가 있어 일부 동기화를 건너뛰었습니다.'}
        {tabs.length > 0 && <> ({tabs.join(', ')} 탭)</>}
        {isAdmin && <> <Link to="/admin">자세히 보기</Link></>}
      </span>
    </div>
  );
}
