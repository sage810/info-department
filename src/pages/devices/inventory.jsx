import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { api, useQuery, today as todayStr } from '../../lib/data.js';
import { GROUPS, CELL_KEYS, bandsFor, matrixFromSnapshot } from '../../lib/inventory.js';
import { setUnsaved, clearUnsaved } from '../../lib/unsaved.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import SaveButton from '../../components/SaveButton.jsx';
import { TabCrumb, SheetButton } from '../../components/PageHeader.jsx';
import * as Ic from '../../components/Icons.jsx';

/* ---------- 전체 전자기기 보유 현황: 집계표 (교육청 제출 양식) ----------
 * 장비 목록(전자기기)과 연동하지 않는다 — 시트(보유현황_제출본)에서 연도별로 따로 관리하는 숫자다.
 * 추가(새 연도 7줄, 0으로 시작) · 수정(숫자) · 삭제(그 연도 7줄)를 앱에서 한다. */
const SNAP_TABLE = 'inventory_snapshots';
export function InventoryOverview() {
  const snaps = useQuery(api.inventorySnapshots);
  const thisYear = new Date().getFullYear();
  const [pick, setPick] = useState(null);              // '2025' 처럼 시트에 있는 연도. 처음엔 가장 최근 연도
  const [mode, setMode] = useState(null);              // null | 'add' | 'edit'
  const [edits, setEdits] = useState({});              // { 줄id: { 열key: 글자 } } — 저장 전 수정
  const [newYear, setNewYear] = useState(String(thisYear));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [dlg, setDlg] = useState(null);
  const uid = useId();
  const yearId = useId();

  const snapYears = useMemo(() => [...new Set((snaps.data ?? []).map((s) => s.year))].sort((a, b) => b - a), [snaps.data]);
  const isSnap = snapYears.length > 0;
  const year = pick && snapYears.includes(Number(pick)) ? Number(pick) : snapYears[0];
  const snapRows = isSnap ? (snaps.data ?? []).filter((s) => s.year === year) : [];
  const shownRows = snapRows.map((r) => (edits[r.id] ? { ...r, ...edits[r.id] } : r));
  const matrix = matrixFromSnapshot(shownRows);
  const frozen = snapRows[0];
  const count = Object.values(edits).reduce((n, e) => n + Object.keys(e).length, 0);
  const editing = mode === 'edit' && isSnap;

  const flash = (kind, text) => { setMsg({ kind, text }); if (kind === 'ok') setTimeout(() => setMsg((m) => (m.text === text ? { kind: '', text: '' } : m)), 4000); };
  const ask = (cfg) => new Promise((resolve) => setDlg({ ...cfg, resolve }));
  const answer = (v) => { dlg?.resolve(v); setDlg(null); };

  function onCell(row, key, value) {
    const orig = String(row[key] ?? 0);
    setEdits((cur) => {
      const mine = { ...(cur[row.id] ?? {}) };
      if (String(value).trim() === orig) delete mine[key]; else mine[key] = value;
      const next = { ...cur };
      if (Object.keys(mine).length) next[row.id] = mine; else delete next[row.id];
      return next;
    });
  }

  /** 고친 숫자를 시트에 저장한다. 전부 성공하면 true. */
  async function saveEdits() {
    if (busy) return false;
    const bad = Object.entries(edits).flatMap(([, f]) => Object.values(f)).find((v) => String(v).trim() !== '' && !/^\d+$/.test(String(v).trim()));
    if (bad !== undefined) { flash('err', '숫자(0 이상의 정수)만 입력하세요.'); return false; }
    setBusy(true); setMsg({ kind: '', text: '' });
    const left = {}; const errs = []; let done = 0;
    for (const [id, f] of Object.entries(edits)) {
      for (const [k, v] of Object.entries(f)) {
        try { await api.updateCell(SNAP_TABLE, id, k, String(v).trim() === '' ? '0' : String(v).trim()); done++; }
        catch (e) { errs.push(e.message); (left[id] ??= {})[k] = v; }
      }
    }
    setEdits(left); setBusy(false); snaps.reload?.();
    if (errs.length) flash('err', errs.join(' / ')); else flash('ok', `${done}칸을 저장했습니다.`);
    return errs.length === 0;
  }
  const discard = () => { setEdits({}); setMsg({ kind: '', text: '' }); };

  // 화면을 옮기기 전에 저장하지 않은 변경이 있으면 UnsavedGuard 가 묻는다
  const saveRef = useRef(null); const discardRef = useRef(null);
  saveRef.current = saveEdits; discardRef.current = discard;
  useEffect(() => { setUnsaved(uid, count > 0 ? { count, save: () => saveRef.current(), discard: () => discardRef.current() } : null); }, [count, uid]);
  useEffect(() => () => clearUnsaved(uid), [uid]);

  /** 저장하지 않은 수정이 있는 채로 다른 연도·모드로 가려 할 때 묻는다. 계속해도 되면 true. */
  async function settle() {
    if (!count) return true;
    const choice = await ask({ title: '저장하지 않은 변경이 있습니다', body: `${count}칸의 변경이 아직 저장되지 않았습니다.\n저장하지 않고 닫으면 이 변경은 사라집니다.`, cancelValue: 'stay',
      actions: [{ label: '저장', variant: 'primary', value: 'save' }, { label: '저장하지 않고 닫기', variant: 'danger', value: 'discard' }, { label: '계속 편집', value: 'stay' }] });
    if (choice === 'stay') return false;
    if (choice === 'save') return saveEdits();
    discard(); return true;
  }
  async function pickYear(v) { if (!(await settle())) return; setPick(v); setMode(null); setMsg({ kind: '', text: '' }); }
  async function pickMode(m) {
    if (mode === m) { if (m === 'edit' && !(await settle())) return; setMode(null); return; }
    if (mode === 'edit' && !(await settle())) return;
    setMode(m); setMsg({ kind: '', text: '' });
  }

  /** 새 연도 집계표 7줄을 시트에 추가한다. */
  async function createSnapshot(e) {
    e.preventDefault();
    const y = newYear.trim();
    if (!/^\d{4}$/.test(y)) { flash('err', '연도는 4자리 숫자로 입력하세요. 예: 2026'); return; }
    if (snapYears.includes(Number(y))) { flash('err', `${y}년 집계표가 이미 있습니다. 기준연도에서 골라 고치세요.`); return; }
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const today = todayStr(); // 한국 날짜(UTC 로 하면 새벽에 하루 전)
      for (const r of bandsFor(Number(y))) {
        await api.addRow(SNAP_TABLE, { year: y, band: String(r.band), band_label: r.range, frozen_on: today,
          ...Object.fromEntries(CELL_KEYS.map((k) => [k, '0'])) });
      }
      await snaps.reload?.();
      setPick(y); setMode('edit');
      flash('ok', `${y}년 집계표를 만들었습니다. 숫자를 입력하고 저장하세요.`);
    } catch (err) { flash('err', err.message); } finally { setBusy(false); }
  }

  /** 고른 연도의 집계표 7줄을 시트에서 지운다(확인 뒤). */
  async function removeSnapshot() {
    if (!isSnap) return;
    if (count && !(await settle())) return;
    const ok = await ask({ title: `${year}년 집계표를 삭제할까요?`, cancelValue: false,
      body: `시트(보유현황_제출본)에서 ${year}년 ${snapRows.length}줄이 지워지고 되돌릴 수 없습니다.\n전자기기 장비 목록은 그대로입니다.`,
      actions: [{ label: '삭제', variant: 'danger', value: true }, { label: '취소', value: false }] });
    if (!ok) return;
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      for (const r of snapRows) await api.deleteRow(SNAP_TABLE, r.id);
      await snaps.reload?.();
      setPick(null); setMode(null);
      flash('ok', `${year}년 집계표를 삭제했습니다.`);
    } catch (err) { flash('err', err.message); snaps.reload?.(); } finally { setBusy(false); }
  }

  return (
    <>
      <div className="tools-card">
        <TabCrumb />
        <div className="table-tools">
          <div className="tools-right">
            <div className="crud-bar" role="group" aria-label="집계표 편집">
              <button type="button" className="btn sm btn-toggle" aria-pressed={mode === 'add'} onClick={() => pickMode('add')}><Ic.Plus />추가</button>
              <button type="button" className="btn sm btn-toggle" aria-pressed={editing} disabled={!isSnap} onClick={() => pickMode('edit')}>{editing ? <Ic.Check /> : <Ic.Pencil />}수정</button>
              <button type="button" className="btn sm btn-toggle" disabled={!isSnap || busy} onClick={removeSnapshot}><Ic.Trash />삭제</button>
            </div>
          </div>
        </div>
      </div>
      {msg.text && (msg.kind === 'ok'
        ? <div className="badge-info" role="status"><Ic.Check width="16" height="16" />{msg.text}</div>
        : <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{msg.text}</div>)}
      {isSnap && frozen && (
        <div className="badge-info"><Ic.Info width="16" height="16" />{year}년 제출본 — 시트(보유현황_제출본)에서 따로 관리하는 숫자입니다{frozen.frozen_on ? ` (만든 날 ${frozen.frozen_on})` : ''}. 전자기기 장비 목록과는 연동되지 않습니다.</div>
      )}
      {!isSnap && !snaps.loading && (
        <div className="badge-info"><Ic.Info width="16" height="16" />아직 집계표가 없습니다. '추가'로 연도를 정해 새 집계표를 만드세요.</div>
      )}
      {editing && (
        <div className="mode-banner" role="status">
          <span className="mode-ico"><Ic.Pencil /></span>
          <div className="mode-msg">
            <b>수정 중{count > 0 && <span className="mode-count">변경 {count}건</span>}</b>
            <span>고칠 숫자를 누르세요. 소계·합계는 자동으로 다시 계산됩니다. 다 고쳤으면 저장을 누르세요.</span>
          </div>
          <div className="mode-actions">
            <button type="button" className="btn btn-ghost sm" disabled={!count || busy} onClick={discard}>되돌리기</button>
            <SaveButton type="button" size="sm" busy={busy} disabled={!count} onClick={saveEdits} />
          </div>
        </div>
      )}
      <div className="card tight">
        {/* 표 바로 위에 붙은 띠: 기준연도 드롭다운(왼쪽) + 추가·수정·삭제와 시트에서 열기(오른쪽) */}
        <div className="table-top">
          <label htmlFor="inv-year" className="chipset-label">기준연도</label>
          <select id="inv-year" className="field-input" style={{ width: 'auto' }} value={isSnap ? String(year) : ''} disabled={!isSnap} onChange={(e) => pickYear(e.target.value)}>
            {!isSnap && <option value="">—</option>}
            {snapYears.map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          <div className="table-top-right">
            <SheetButton tab="보유현황_제출본" className="btn btn-secondary sm table-top-sheet" />
          </div>
          {mode === 'add' && (
            <form className="snap-add" onSubmit={createSnapshot}>
              <label htmlFor={yearId} className="chipset-label">새 집계표 연도</label>
              <input id={yearId} className="field-input snap-year" inputMode="numeric" maxLength={4} value={newYear} autoFocus autoComplete="off"
                onChange={(e) => setNewYear(e.target.value)} />
              <SaveButton busy={busy} size="sm" />
              <button type="button" className="btn btn-secondary sm" onClick={() => setMode(null)} disabled={busy}>취소</button>
            </form>
          )}
        </div>
        <div className="table-wrap"><MatrixTable matrix={matrix} edit={editing} edits={edits} onCell={(row, key, v) => onCell(snapRows.find((r) => r.id === row), key, v)} /></div>
      </div>
      {dlg && (
        <ConfirmDialog title={dlg.title} onCancel={() => answer(dlg.cancelValue)}
          actions={dlg.actions.map((a) => ({ label: a.label, variant: a.variant, onClick: () => answer(a.value) }))}>{dlg.body}</ConfirmDialog>
      )}
    </>
  );
}
function MatrixTable({ matrix, edit = false, edits = {}, onCell }) {
  const n = (v, cls = '') => <td className={`${cls}${v === 0 ? ' zero' : ''}`}>{v}</td>;
  const input = (r, c, g) => {
    const dirty = edits[r.id]?.[c.key] !== undefined;
    return (
      <td key={c.key} className={`mx-edit${dirty ? ' dirty' : ''}`}>
        <input type="text" inputMode="numeric" className="mx-in" value={dirty ? edits[r.id][c.key] : String(r.cells[c.key])}
          aria-label={`${r.name} ${g.label} ${c.label}`} onChange={(e) => onCell(r.id, c.key, e.target.value)} />
      </td>
    );
  };
  return (
    <table className="matrix">
      <thead>
        <tr>
          <th rowSpan="3">학교명</th><th rowSpan="3">구입연도</th>
          {GROUPS.map((g) => <th key={g.key} colSpan={g.cols.length + 1}>{g.label}</th>)}
          <th rowSpan="3">합계</th>
        </tr>
        <tr>
          <th colSpan="2">데스크톱</th><th rowSpan="2">노트북</th><th rowSpan="2">태블릿</th><th rowSpan="2">기타<br />(클라우드PC등)</th><th rowSpan="2">계</th>
          {GROUPS.slice(1).map((g) => <Fragment key={g.key}>{g.cols.map((c) => <th key={c.key} rowSpan="2">{c.label}</th>)}<th rowSpan="2">계</th></Fragment>)}
        </tr>
        <tr><th>컴퓨터<br />실습실</th><th>컴퓨터<br />실습실 외</th></tr>
      </thead>
      <tbody>
        {matrix.rows.map((r) => (
          <tr key={r.band}>
            <td className="lbl">신현중학교</td>
            <td className="lbl">{r.name}<small>({r.range})</small></td>
            {GROUPS.map((g) => <Fragment key={g.key}>{g.cols.map((c) => (edit && r.id
              ? input(r, c, g)
              : <td key={c.key} className={r.cells[c.key] === 0 ? 'zero' : ''}>{r.cells[c.key]}</td>))}{n(r.sub[g.key], 'sum')}</Fragment>)}
            {n(r.total, 'total')}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
