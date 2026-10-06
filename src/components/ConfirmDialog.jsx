import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SaveButton from './SaveButton.jsx';

/**
 * 앱 안에서 뜨는 확인 창(브라우저 confirm 대신). 배경을 누르거나 Esc 를 누르면 onCancel.
 *   actions: [{ label, variant?: 'primary' | 'danger' | undefined, onClick }]  — onClick 은 비동기여도 된다.
 *            primary 는 저장 버튼(SaveButton)으로 그려져, 처리하는 동안 돌아가는 원이 보이고 모든 버튼이 잠긴다.
 * 열리면 첫 번째 버튼에 초점이 간다 — 단 위험한(danger) 버튼이 있는 창은 실수로 Enter 를 눌러도 안전하게 색 없는 버튼(취소·계속 편집)에.
 * Tab 은 창 안에서만 돌고, 열린 동안 뒤 화면(#root)은 inert 로 막는다.
 */
export default function ConfirmDialog({ title, children, actions, onCancel }) {
  const titleId = useId();
  const boxRef = useRef(null);
  const [busyIdx, setBusyIdx] = useState(-1);

  useEffect(() => {
    const prev = document.activeElement;
    const btns = boxRef.current?.querySelectorAll('.dlg-actions button') ?? [];
    const safe = actions.some((a) => a.variant === 'danger') ? actions.findIndex((a) => !a.variant) : 0;
    (btns[safe >= 0 ? safe : 0] ?? boxRef.current?.querySelector('button'))?.focus();
    const root = document.getElementById('root');
    const madeInert = root && !root.hasAttribute('inert');
    if (madeInert) root.setAttribute('inert', '');
    return () => { if (madeInert) root.removeAttribute('inert'); if (prev && prev.isConnected) prev.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.stopPropagation(); if (busyIdx < 0) onCancel?.(); return; }
    if (e.key !== 'Tab') return;
    const f = [...boxRef.current.querySelectorAll('button:not(:disabled)')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  async function run(i, a) {
    if (busyIdx >= 0) return;
    setBusyIdx(i);
    try { await a.onClick?.(); } finally { setBusyIdx(-1); }
  }

  return createPortal(
    <div className="dlg-back" onMouseDown={(e) => { if (e.target === e.currentTarget && busyIdx < 0) onCancel?.(); }}>
      <div className="dlg" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={boxRef} onKeyDown={onKeyDown}>
        <h2 id={titleId}>{title}</h2>
        <div className="dlg-body">{children}</div>
        <div className="dlg-actions">
          {actions.map((a, i) => (a.variant === 'primary'
            ? <SaveButton key={a.label} type="button" label={a.label} busyLabel="저장 중…" busy={busyIdx === i} disabled={busyIdx >= 0} onClick={() => run(i, a)} />
            : (
              <button key={a.label} type="button" className={`btn ${a.variant === 'danger' ? 'btn-danger' : 'btn-secondary'}`} disabled={busyIdx >= 0} onClick={() => run(i, a)}>{a.label}</button>
            )))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
