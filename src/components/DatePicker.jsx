import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Ic from './Icons.jsx';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad2 = (n) => String(n).padStart(2, '0');
const toStr = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const todayStr = () => { const d = new Date(); return toStr(d.getFullYear(), d.getMonth(), d.getDate()); };
// 방향키로 움직일 날 수(왼쪽·오른쪽 하루, 위·아래 한 주)
const STEP = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

/**
 * <input type="date"> 대신 쓰는 날짜 선택 칸. 네이티브 달력 팝업은 브라우저/OS 가 그려서 페이지 코드(lang
 * 속성 포함)로는 안의 월·요일 글자를 한글로 바꿀 수 없어, 팝업 자체를 직접 그린다(항상 한글).
 * value/onChange 는 "YYYY-MM-DD" 문자열로 <input type="date"> 와 똑같이 쓴다(이벤트도 e.target.value 모양).
 * 키보드: 열면 고른 날(없으면 오늘)에 초점, 방향키로 하루·한 주, PageUp/PageDown 으로 한 달, Enter·Space 로 고름,
 * Esc 로 닫고 날짜 칸으로 돌아감. Tab 은 달력 안에서만 돈다.
 */
export default function DatePicker({ id, value, onChange, disabled, className = '', required, onKeyDown, autoFocus, 'aria-label': ariaLabel }) {
  const [open, setOpen] = useState(false);
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());
  const [focusDay, setFocusDay] = useState(base.getDate()); // 달력에서 초점이 있는 날(보이는 달 안)
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const b = value ? new Date(`${value}T00:00:00`) : new Date();
    setViewYear(b.getFullYear()); setViewMonth(b.getMonth()); setFocusDay(b.getDate());
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
    const onDocClick = (e) => { if (btnRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return; setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    // 페이지가 스크롤되면 달력을 날짜 칸에 붙여 따라가게 하고, 날짜 칸이 화면 밖으로 나가면 닫는다
    // (키보드로 열 때 브라우저가 문서 스크롤 이벤트를 한 번 보내서, 바로 닫으면 키보드로는 달력을 쓸 수 없었다)
    const onScroll = (e) => {
      if (popRef.current && (e.target === popRef.current || popRef.current.contains(e.target))) return;
      const r = btnRef.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight) { setOpen(false); return; }
      setPos({ top: r.bottom + 6, left: r.left });
    };
    const onResize = () => setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // 열리면(그리고 방향키로 날을 옮기면) 그 날 칸에 초점 — 페이지가 스크롤돼 달력이 닫히지 않게 preventScroll
  useEffect(() => {
    if (!open || !pos) return;
    popRef.current?.querySelector(`.date-cell[data-day="${focusDay}"]`)?.focus({ preventScroll: true });
  }, [open, pos, viewYear, viewMonth, focusDay]);

  function fire(dateStr) { onChange?.({ target: { value: dateStr } }); setOpen(false); btnRef.current?.focus(); }
  function goMonth(delta) {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
    setFocusDay((d) => Math.min(d, new Date(y, m + 1, 0).getDate()));
  }
  function moveDays(n) {
    const d = new Date(viewYear, viewMonth, focusDay + n);
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setFocusDay(d.getDate());
  }
  function onCellKeyDown(e) {
    if (STEP[e.key]) { e.preventDefault(); moveDays(STEP[e.key]); }
    else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); goMonth(e.key === 'PageUp' ? -1 : 1); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setFocusDay(e.key === 'Home' ? 1 : new Date(viewYear, viewMonth + 1, 0).getDate()); }
  }
  // Tab 은 달력 안에서만 돈다(달력은 문서 맨 끝에 그려져서 그냥 두면 초점이 페이지 다른 곳으로 빠진다)
  function onPopKeyDown(e) {
    if (e.key !== 'Tab') return;
    const f = [...popRef.current.querySelectorAll('button:not([tabindex="-1"])')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const first = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const today = todayStr();

  return (
    <>
      <button type="button" ref={btnRef} id={id} autoFocus={autoFocus} disabled={disabled} required={required} aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open}
        className={`date-trigger ${className}`} onClick={() => setOpen((o) => !o)} onKeyDown={onKeyDown}>
        <span className={value ? '' : 'muted'}>{value || '날짜 선택'}</span>
        <Ic.Calendar width="16" height="16" />
      </button>
      {open && pos && createPortal(
        <div ref={popRef} className="date-pop" role="dialog" aria-label={`${ariaLabel ?? '날짜'} 선택 달력`} style={{ top: pos.top, left: pos.left }} onKeyDown={onPopKeyDown}>
          <div className="date-pop-head">
            <button type="button" className="date-nav" aria-label="이전 달" onClick={() => goMonth(-1)}><Ic.ChevronLeft width="16" height="16" /></button>
            <b aria-live="polite">{viewYear}년 {viewMonth + 1}월</b>
            <button type="button" className="date-nav" aria-label="다음 달" onClick={() => goMonth(1)}><Ic.ChevronRight width="16" height="16" /></button>
          </div>
          <div className="date-pop-week" aria-hidden="true">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="date-pop-grid">
            {cells.map((d, i) => {
              if (d === null) return <span key={i} />;
              const ds = toStr(viewYear, viewMonth, d);
              const wd = WEEKDAYS[new Date(viewYear, viewMonth, d).getDay()];
              return (
                <button key={i} type="button" data-day={d} tabIndex={d === focusDay ? 0 : -1}
                  className={`date-cell${ds === value ? ' picked' : ''}${ds === today ? ' today' : ''}`}
                  aria-label={`${viewYear}년 ${viewMonth + 1}월 ${d}일 ${wd}요일${ds === today ? ', 오늘' : ''}`}
                  aria-pressed={ds === value} aria-current={ds === today ? 'date' : undefined}
                  onKeyDown={onCellKeyDown} onFocus={() => setFocusDay(d)} onClick={() => fire(ds)}>{d}</button>
              );
            })}
          </div>
          <button type="button" className="date-today-btn" onClick={() => fire(today)}>오늘</button>
        </div>,
        document.body,
      )}
    </>
  );
}
