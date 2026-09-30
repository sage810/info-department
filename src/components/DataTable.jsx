import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Ic from './Icons.jsx';
import { api } from '../lib/data.js';
import { findEditableColumn } from '../../shared/sheet-schema.js';

const ALL = '__all__'; // "전체(필터 해제)" 를 뜻하는 값. 빈 문자열('')은 "(비어 있음)" 값과 구분하려고 따로 둔다.

/**
 * 검색 + 머리글 클릭 드롭다운 필터 + 표.
 *  columns: [{ key, header, render?(row), className?, filterValue?(row), noFilter? }]
 *    - 값 목록은 filterValue → render 가 문자열이면 그 값 → 원본 순으로 정한다.
 *    - header 가 비었거나 noFilter 면 머리글을 눌러도 드롭다운이 뜨지 않는다(작업 버튼 열 등).
 *  searchKeys: 검색 대상 열(key 배열). 없으면 검색창 숨김.
 *  filter: (row) => boolean  — 검색·필터보다 먼저 적용
 *  toolbar: 검색창 옆에 넣을 요소(필터 알약, 열 체크 등)
 *
 *  필터는 한 번에 한 열만 걸 수 있다(fCol/fVal). 다른 열 머리글을 누르면 그 열로 바뀐다.
 *
 *  셀 편집: column.editable = true 인 열은 셀을 누르면 바로 고칠 수 있다. table(shared/sheet-schema.js 의
 *  표 이름)을 같이 줘야 하고, 열의 key 가 그 표의 진짜 열 이름과 다르면 column.editField 로 알려준다
 *  (예: 노트북 표의 "사용자" 열은 화면엔 user_name 으로 보이지만 실제로는 staff_id 를 고치는 것).
 *  reload 를 주면 저장 성공 후 다시 불러와 화면을 새로 맞춘다(연결된 다른 열도 같이 바뀔 수 있어서).
 */
export default function DataTable({
  columns, rows, loading, error, searchKeys, searchPlaceholder = '검색', filter, toolbar,
  emptyText = '데이터가 없습니다.', rowKey = 'id', footer, table, reload,
}) {
  const [q, setQ] = useState('');
  const searchId = useId();
  const [fCol, setFCol] = useState('');   // 현재 필터가 걸린 열의 key ('' = 없음)
  const [fVal, setFVal] = useState('');   // 그 열에서 고른 값
  const [openCol, setOpenCol] = useState(''); // 드롭다운이 열려 있는 열의 key

  const col = columns.find((c) => c.key === fCol) ?? null;

  // 검색까지 통과한 행 (열 필터 적용 전 — 드롭다운 목록은 이 기준으로 만든다)
  const base = useMemo(() => {
    let list = rows ?? [];
    if (filter) list = list.filter(filter);
    const needle = q.trim().toLowerCase().replace(/\s+/g, '');
    if (needle && searchKeys?.length) {
      list = list.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().replace(/\s+/g, '').includes(needle)));
    }
    return list;
  }, [rows, filter, q, searchKeys]);

  const active = !!col && fVal !== '';
  const shown = useMemo(() => (active ? base.filter((r) => cellText(col, r) === fVal) : base), [base, col, fVal, active]);

  const selectValue = (column, value) => {
    if (value === ALL) { setFCol(''); setFVal(''); } else { setFCol(column.key); setFVal(value); }
    setOpenCol('');
  };
  const clear = () => { setFCol(''); setFVal(''); setOpenCol(''); };

  return (
    <>
      {/* 검색 도구줄: 표 카드와 분리된 자체 레이아웃. 열 필터는 표 머리글을 눌러서 쓴다 */}
      <div className="table-tools">
        {toolbar && <div className="tool-extra">{toolbar}</div>}
        {(fCol || q.trim()) && <button type="button" className="btn btn-secondary sm" onClick={() => { clear(); setQ(''); }}>조건 지우기</button>}
        <span className="count">{loading ? '불러오는 중…' : `${shown.length}건`}</span>
        {searchKeys?.length > 0 && (
          <form className="search-form search-form-narrow" role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="search">
              <label htmlFor={searchId} className="sr-only">검색</label>
              <Ic.Search />
              <input id={searchId} className="field-input" type="search" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder} />
            </div>
            <button type="submit" className="btn btn-secondary sm">검색</button>
          </form>
        )}
      </div>
      <div className="card tight">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.header && !c.noFilter ? (
                      <HeaderFilter
                        column={c} rows={base}
                        selected={fCol === c.key ? fVal : ALL}
                        open={openCol === c.key}
                        onToggle={() => setOpenCol(openCol === c.key ? '' : c.key)}
                        onClose={() => setOpenCol('')}
                        onSelect={(v) => selectValue(c, v)}
                      />
                    ) : c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {error && <tr><td className="empty" colSpan={columns.length}>불러오지 못했습니다: {String(error.message ?? error)}</td></tr>}
              {!error && !loading && shown.length === 0 && (
                <tr><td className="empty" colSpan={columns.length}>
                  {active || q.trim() ? (
                    <span className="empty-search">
                      "{active ? `${col.header}: ${fVal || '(비어 있음)'}` : q.trim()}"{active && q.trim() ? ` + "${q.trim()}"` : ''} 에 맞는 행이 없습니다.
                      <button type="button" className="btn btn-secondary sm" onClick={() => { clear(); setQ(''); }}>조건 지우기</button>
                    </span>
                  ) : emptyText}
                </td></tr>
              )}
              {!error && shown.map((r, i) => (
                <tr key={r[rowKey] ?? i}>
                  {columns.map((c) => {
                    const field = c.editField ?? c.key;
                    const schemaCol = c.editable && table ? findEditableColumn(table, field) : null;
                    if (schemaCol) {
                      return (
                        <td key={c.key} className={`editable${c.className ? ` ${c.className}` : ''}`}>
                          <EditableCell row={r} col={c} field={field} schemaCol={schemaCol} table={table} reload={reload}
                            display={c.render ? c.render(r) : (r[c.key] ?? '')} />
                        </td>
                      );
                    }
                    return <td key={c.key} className={c.className}>{c.render ? c.render(r) : (r[c.key] ?? '')}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {footer}
      </div>
    </>
  );
}

/** 머리글 글씨를 누르면 뜨는 값 목록(드롭다운). 표 바깥(document.body)에 그려서 가로 스크롤에 잘리지 않는다. */
function HeaderFilter({ column, rows, selected, open, onToggle, onClose, onSelect }) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const isActive = selected !== ALL;

  const values = useMemo(() => {
    const set = new Set(rows.map((r) => cellText(column, r)));
    return [...set].sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'ko', { numeric: true })));
  }, [rows, column]);
  const options = useMemo(() => [ALL, ...values], [values]);

  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left, minWidth: Math.max(rect.width, 180) });
    // 스크롤하면 닫는다 (위치가 머리글과 어긋나는 걸 막기 위해 — 표 자체의 가로 스크롤도 포함해서 잡는다)
    // 메뉴 자체의 안쪽 스크롤(선택된 값으로 포커스가 이동하며 자동으로 스크롤될 때)은 무시하고,
    // 페이지·표가 스크롤될 때만 닫는다 — 그래야 목록 가운데 있는 값을 열자마자 메뉴가 닫히지 않는다.
    const onScroll = (e) => {
      if (menuRef.current && (e.target === menuRef.current || menuRef.current.contains(e.target))) return;
      onClose();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onClose);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onClose); };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose]);

  function moveFocus(delta) {
    const items = [...menuRef.current.querySelectorAll('[role="option"]')];
    const from = items.indexOf(document.activeElement);
    let next = (from < 0 ? 0 : from) + delta;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    items[next]?.focus();
  }
  function onOptKeyDown(e, value) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
    else if (e.key === 'Home') { e.preventDefault(); moveFocus(-Infinity); }
    else if (e.key === 'End') { e.preventDefault(); moveFocus(Infinity); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(value); btnRef.current?.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); btnRef.current?.focus(); }
    else if (e.key === 'Tab') onClose();
  }
  function onBtnKeyDown(e) {
    if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !open) { e.preventDefault(); onToggle(); }
    else if (e.key === 'Escape' && open) { onClose(); }
  }

  return (
    <>
      <button type="button" ref={btnRef} className={`th-btn${isActive ? ' active' : ''}`}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined}
        title={isActive ? `${column.header}: ${selected === '' ? '(비어 있음)' : selected}` : undefined}
        onClick={onToggle} onKeyDown={onBtnKeyDown}>
        <span className="th-btn-label">{column.header}</span>
        <Ic.ChevronDown className="th-btn-ico" width="13" height="13" />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} id={menuId} role="listbox" aria-label={`${column.header} 값으로 거르기`}
          className="th-menu" style={{ top: pos.top, left: pos.left, minWidth: pos.minWidth }}>
          {options.map((v) => (
            <div key={v} role="option" tabIndex={-1} aria-selected={selected === v}
              className={`th-opt${selected === v ? ' picked' : ''}`}
              ref={selected === v ? (el) => el?.focus() : undefined}
              onClick={() => { onSelect(v); btnRef.current?.focus(); }}
              onKeyDown={(e) => onOptKeyDown(e, v)}>
              <span>{v === ALL ? '전체' : v === '' ? '(비어 있음)' : v}</span>
              {selected === v && <Ic.Check width="14" height="14" />}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}

const REF_HINT = { staff: '예: 한나라', students: '예: 21011', classrooms: '예: 2-5' };

/** 셀 하나: 평소엔 값을 보여주는 버튼, 누르면 입력칸으로 바뀐다. blur·Enter 로 저장, Esc 로 취소. */
function EditableCell({ row, col, field, schemaCol, table, reload, display }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const original = row[col.key];

  function start() {
    setVal(original ?? ''); setErr(''); setEditing(true);
  }
  async function commit() {
    if (busy) return;
    if (String(val).trim() === String(original ?? '').trim()) { setEditing(false); return; }
    setBusy(true); setErr('');
    try {
      await api.updateCell(table, row.id, field, val);
      setEditing(false); setBusy(false);
      reload?.();
    } catch (e) {
      setErr(e.message); setBusy(false);
    }
  }
  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'Escape') { e.preventDefault(); setEditing(false); setErr(''); }
  }

  if (!editing) {
    return (
      <button type="button" className="cell-edit-trigger" onClick={start}>
        {display === '' || display === null || display === undefined ? <span className="cell-empty">—</span> : display}
      </button>
    );
  }
  const type = schemaCol.type === 'date' ? 'date' : schemaCol.type === 'int' ? 'number' : 'text';
  return (
    <span className="cell-editing">
      <input autoFocus className="cell-input" type={type} value={val} disabled={busy}
        aria-label={col.header} aria-invalid={!!err} placeholder={schemaCol.ref ? REF_HINT[schemaCol.ref] : undefined}
        onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={onKeyDown} />
      {err && <span className="cell-error" role="alert">{err}</span>}
    </span>
  );
}

/** 드롭다운·필터 비교에 쓰는 셀의 문자열 값 */
function cellText(col, row) {
  if (!col) return '';
  if (col.filterValue) return String(col.filterValue(row) ?? '');
  if (col.render) {
    const r = col.render(row);
    if (typeof r === 'string' || typeof r === 'number') return String(r);
  }
  const v = row[col.key];
  return v === null || v === undefined ? '' : String(v);
}

/** 학년 필터 알약 (반별 화면에서 공용) */
export function GradePills({ value, onChange }) {
  return (
    <div className="pills sub" role="group" aria-label="학년 필터">
      {[0, 1, 2, 3].map((g) => (
        <button key={g} type="button" className={`pill-tab${value === g ? ' active' : ''}`} onClick={() => onChange(g)}>
          {g === 0 ? '전체' : `${g}학년`}
        </button>
      ))}
    </div>
  );
}
