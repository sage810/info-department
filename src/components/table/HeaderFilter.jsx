import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Ic from '../Icons.jsx';

export const ALL = '__all__'; // "전체(필터 해제)" 를 뜻하는 값. 빈 문자열('')은 "(비어 있음)" 값과 구분하려고 따로 둔다.

/** 드롭다운·필터 비교에 쓰는 셀의 문자열 값 */
export function cellText(col, row) {
  if (!col) return '';
  if (col.filterValue) return String(col.filterValue(row) ?? '');
  if (col.render) {
    const r = col.render(row, { editing: false }); // 필터용 글자만 필요하다 — 읽기 전용 모양(글자)으로 그려 보게 한다
    if (typeof r === 'string' || typeof r === 'number') return String(r);
  }
  const v = row[col.key];
  return v === null || v === undefined ? '' : String(v);
}

/** 머리글 글씨를 누르면 뜨는 값 목록(드롭다운). 표 바깥(document.body)에 그려서 가로 스크롤에 잘리지 않는다. */
export default function HeaderFilter({ column, rows, selected, open, onToggle, onClose, onSelect }) {
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
