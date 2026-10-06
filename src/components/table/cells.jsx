import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AutoGrowText from '../AutoGrowText.jsx';
import DatePicker from '../DatePicker.jsx';
import { api } from '../../lib/data.js';

// 표 셀 편집: 글자 칸(EditableCell)과 드롭다운 칸(SelectCell · SelectOrTextCell · EditSelectCell).

export const REF_HINT = { staff: '예: 한나라', students: '예: 21011', classrooms: '예: 2-5' };

/** 셀 하나: 평소엔 값을 보여주는 버튼, 누르면 입력칸으로 바뀐다. blur·Enter 로 저장, Esc 로 취소. */
export function EditableCell({ row, col, field, schemaCol, table, reload, onStage, onEditing, registerCommit, display }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [narrow, setNarrow] = useState(false);
  const wrapRef = useRef(null);
  const widthBefore = useRef(0);
  // 열이 editValue/saveValue 를 주면 입력칸에 보이는 값과 저장할 값을 바꿔 쓴다(예: 비고 날짜 태그 — 오늘 줄만 고친다)
  const original = col.editValue ? col.editValue(row) : row[col.key];
  const toSave = (v) => (col.saveValue ? col.saveValue(row, v) : v);
  const commitRef = useRef(null);
  // 키보드로 입력칸을 닫으면(Enter·Esc·날짜 고르기) 초점이 페이지 맨 위로 사라지지 않게 그 칸 버튼으로 되돌린다
  const triggerRef = useRef(null);
  const refocus = useRef(false);
  useEffect(() => {
    if (!editing && refocus.current) { refocus.current = false; triggerRef.current?.focus(); }
  }, [editing]);

  // 칸을 고치는 동안 그 행에 저장 버튼이 뜨게 알리고, 저장 버튼이 눌리면 적던 값부터 모으도록 commit 을 건네 둔다.
  useEffect(() => {
    if (!editing) return undefined;
    onEditing?.(true);
    registerCommit?.(() => commitRef.current?.());
    return () => { onEditing?.(false); registerCommit?.(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function start(e) {
    widthBefore.current = e.currentTarget.closest('td')?.getBoundingClientRect().width ?? 0;
    setNarrow(false); setVal(original ?? ''); setErr(''); setEditing(true);
  }

  // 입력칸의 기본 너비 때문에 편집하는 열이 확 넓어지는데, 늘어나는 폭이 그 절반이 되게 맞춘다.
  // 기본 크기 입력칸으로 한 번 그려 늘어난 폭을 재고, 페인트 전에 셀 폭을 "원래 폭 + 늘어난 폭의 절반"으로
  // 고정한 뒤 입력칸은 셀에 맞춘다. (입력칸 폭만 줄이면 표가 남는 폭을 다시 나눠 주어서 폭이 어긋난다.)
  useLayoutEffect(() => {
    if (!editing) return undefined;
    const td = wrapRef.current?.closest('td');
    if (!td || !widthBefore.current) return undefined;
    const grown = td.getBoundingClientRect().width;
    if (grown <= widthBefore.current) return undefined;
    td.style.width = `${Math.round(widthBefore.current + (grown - widthBefore.current) / 2)}px`;
    setNarrow(true);
    return () => { td.style.width = ''; };
  }, [editing]);
  async function commit(overrideVal) {
    const v = overrideVal !== undefined ? overrideVal : val;
    if (busy) return;
    if (String(v).trim() === String(original ?? '').trim()) { setEditing(false); return; }
    if (onStage) { // 수정 모드의 표: 바로 저장하지 않고 표에 모아 둔다(저장 버튼으로 한꺼번에 저장)
      if (schemaCol.type === 'int' && String(v).trim() !== '' && Number.isNaN(parseInt(String(v).replace(/[^\d-]/g, ''), 10))) { setErr('숫자만 입력하세요.'); return; }
      onStage(field, toSave(v)); setEditing(false); setErr('');
      return;
    }
    setBusy(true); setErr('');
    try {
      await api.updateCell(table, row.id, field, toSave(v));
      setEditing(false); setBusy(false);
      reload?.();
    } catch (e) {
      setErr(e.message); setBusy(false);
    }
  }
  commitRef.current = commit;
  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); refocus.current = true; commit(); }
    else if (e.key === 'Escape') { e.preventDefault(); refocus.current = true; setEditing(false); setErr(''); }
  }

  if (!editing) {
    // 버튼 글자만으로는(예: 값 그대로인 "10.20.4.11") 표 밖 순서로 Tab 이동할 때 어느 열인지 알 수 없어 열 이름을 같이 읽어 준다.
    const forName = original === '' || original === null || original === undefined ? '비어 있음' : original;
    return (
      <button type="button" ref={triggerRef} className="cell-edit-trigger" onClick={start} aria-label={`${col.header}: ${forName}`}>
        {display === '' || display === null || display === undefined ? <span className="cell-empty">—</span> : display}
      </button>
    );
  }
  const type = schemaCol.type === 'date' ? 'date' : schemaCol.type === 'int' ? 'number' : 'text';
  return (
    <span className="cell-editing" ref={wrapRef}>
      {type === 'date' ? (
        <DatePicker autoFocus className={`cell-input${narrow ? ' fit' : ''}`} value={val} disabled={busy} aria-label={col.header}
          onChange={(e) => { refocus.current = true; setVal(e.target.value); commit(e.target.value); }} onKeyDown={onKeyDown} />
      ) : type === 'text' ? (
        <AutoGrowText autoFocus className={`cell-input${narrow ? ' fit' : ''}`} value={val} disabled={busy} cols={narrow ? 1 : undefined}
          aria-label={col.header} aria-invalid={!!err} placeholder={schemaCol.ref ? REF_HINT[schemaCol.ref] : undefined}
          onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={onKeyDown} />
      ) : (
        <input autoFocus className={`cell-input${narrow ? ' fit' : ''}`} type={type} value={val} disabled={busy} size={narrow ? 1 : undefined}
          aria-label={col.header} aria-invalid={!!err} placeholder={schemaCol.ref ? REF_HINT[schemaCol.ref] : undefined}
          onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={onKeyDown} />
      )}
      {err && <span className="cell-error" role="alert">{err}</span>}
    </span>
  );
}

/** 표 셀 안의 드롭다운(반납 여부, 태블릿 제조사, TV브랜드 등 고정 선택지를 바로 고칠 때 쓴다). */
export function SelectCell({ value, options, onChange, busy, ariaLabel, autoFocus }) {
  return (
    <select className="field-input sm" aria-label={ariaLabel} disabled={busy} autoFocus={autoFocus} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

/**
 * 표 셀 안의 "드롭다운 + 기타(직접 입력)". 고정 선택지(options)를 고르면 바로 onChange, "기타"를 고르면 아래 입력칸이
 * 열리고 Enter·blur 로 onChange. 현재 값이 선택지에 없으면 "기타" 상태로 그 값을 입력칸에 보여준다.
 */
export const PICK_OTHER = '__other__';
export function SelectOrTextCell({ value, options, onChange, busy, ariaLabel, autoFocus }) {
  const listed = options.includes(value ?? '');
  const [other, setOther] = useState(!listed && !!value);
  const [picked, setPicked] = useState(false); // "기타"를 방금 골랐을 때만 직접 입력 칸으로 초점을 옮긴다
  const [text, setText] = useState(listed ? '' : (value ?? ''));
  const sel = other || (!listed && value) ? PICK_OTHER : (value ?? '');
  function pick(v) {
    if (v === PICK_OTHER) { setPicked(true); setOther(true); setText(listed ? '' : (value ?? '')); return; }
    setOther(false); onChange(v);
  }
  function commitText() { const t = text.trim(); if (t && t !== value) onChange(t); }
  return (
    <span className="cell-pick">
      <select className="field-input" aria-label={ariaLabel} disabled={busy} autoFocus={autoFocus} value={sel} onChange={(e) => pick(e.target.value)}>
        <option value="" disabled>선택</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value={PICK_OTHER}>기타(직접 입력)</option>
      </select>
      {sel === PICK_OTHER && (
        <AutoGrowText className="field-input" aria-label={`${ariaLabel} 직접 입력`} value={text} disabled={busy} placeholder="직접 입력" autoFocus={picked}
          onChange={(e) => setText(e.target.value)} onBlur={commitText}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(); } }} />
      )}
    </span>
  );
}

/**
 * 수정 모드에서만 고칠 수 있는 드롭다운 칸. 평소(수정 아님)엔 글자만, 수정 중에도 칸을 누르기 전엔 글자(+ 누르는 버튼)이고,
 * 누르면 드롭다운이 열려 고르면 stage 로 모아 둔다. other 면 "기타(직접 입력)"가 붙는 SelectOrTextCell(options 는 글자 배열),
 * 아니면 SelectCell(options 는 [값, 글자] 쌍). 열의 render(row, ctx) 에서 ctx 를 그대로 넘긴다.
 */
export function EditSelectCell({ ctx, row, field, ariaLabel, options, other = false }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const refocus = useRef(false);
  useEffect(() => {
    if (!open && refocus.current) { refocus.current = false; triggerRef.current?.focus(); }
  }, [open]);
  const value = row[field] ?? '';
  const text = other ? value : (options.find((o) => o[0] === value)?.[1] ?? value);
  const close = () => { setOpen(false); ctx.markEditing(row, false); };
  if (!ctx.editing) return text;
  if (!open) {
    return (
      <button type="button" ref={triggerRef} className="cell-edit-trigger" aria-label={`${ariaLabel}: ${value === '' ? '비어 있음' : value}`}
        onClick={() => { setOpen(true); ctx.markEditing(row, true); }}>
        {text === '' ? <span className="cell-empty">—</span> : text}
      </button>
    );
  }
  const change = (v) => { refocus.current = true; ctx.stage(row, field, v); close(); };
  return (
    <span className="cell-editing" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); refocus.current = true; close(); } }}>
      {other
        ? <SelectOrTextCell autoFocus ariaLabel={ariaLabel} value={value} options={options} onChange={change} />
        : <SelectCell autoFocus ariaLabel={ariaLabel} value={value} options={options} onChange={change} />}
    </span>
  );
}
