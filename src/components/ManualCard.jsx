import { Fragment, useId, useRef, useState } from 'react';
import SaveButton from './SaveButton.jsx';
import { api } from '../lib/data.js';
import AutoGrowText from './AutoGrowText.jsx';
import {
  ATTACHMENT_EXTS, MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, MANUAL_CATEGORIES,
  checkAttachment, cleanFileName, formatFileSize, parseAttachments,
} from '../../shared/sheet-schema.js';
import * as Ic from './Icons.jsx';

/** 브라우저가 파일 선택창에서 걸러 주도록 알려 주는 확장자 목록 */
const ACCEPT = ATTACHMENT_EXTS.map((e) => `.${e}`).join(',');

/**
 * 첨부 입력. 이미 저장된 파일(kept)과 이번에 새로 고른 파일(pending)을 같이 보여 주고 각각 뺄 수 있다.
 * 새 파일은 저장 버튼을 누를 때 uploadPending 으로 올린다(고르기만 하고 취소하면 아무것도 올라가지 않는다).
 */
export function AttachmentField({ kept, setKept, pending, setPending, disabled }) {
  const inputRef = useRef(null);
  const [problem, setProblem] = useState('');
  const helpId = useId();
  const count = kept.length + pending.length;

  function pick(e) {
    const files = [...e.target.files];
    e.target.value = ''; // 같은 파일을 지웠다가 다시 고를 수 있게
    const next = [...pending];
    const issues = [];
    for (const f of files) {
      const why = checkAttachment(f.name, f.size);
      if (why) issues.push(why);
      else if (kept.length + next.length >= MAX_ATTACHMENTS) issues.push(`첨부파일은 ${MAX_ATTACHMENTS}개까지 가능합니다.`);
      else if (next.some((p) => p.name === f.name && p.size === f.size)) issues.push(`"${cleanFileName(f.name)}" 은(는) 이미 추가했습니다.`);
      else next.push(f);
    }
    setPending(next);
    setProblem([...new Set(issues)].join(' '));
  }

  return (
    <div className="field full">
      <span className="field-label" id={`${helpId}-l`}>첨부파일</span>
      <div className="attach-add">
        <button type="button" className="btn btn-secondary sm" onClick={() => inputRef.current?.click()} disabled={disabled || count >= MAX_ATTACHMENTS}>
          <Ic.Paperclip />파일 첨부
        </button>
        <span className="muted small" id={helpId}>
          pdf·docx·xlsx·zip 등 · 파일당 {formatFileSize(MAX_ATTACHMENT_BYTES)} 이하 · 최대 {MAX_ATTACHMENTS}개
        </span>
        <input ref={inputRef} type="file" multiple accept={ACCEPT} hidden onChange={pick} aria-labelledby={`${helpId}-l`} aria-describedby={helpId} />
      </div>
      {problem && <div className="badge-error" role="alert"><Ic.Alert width="14" height="14" />{problem}</div>}
      {count > 0 && (
        <ul className="attach-list" aria-label="첨부한 파일">
          {kept.map((a) => (
            <li key={a.id} className="attach-item">
              <Ic.Paperclip width="16" height="16" />
              <span className="name">{a.name}</span><span className="size">{formatFileSize(a.size)}</span>
              <button type="button" className="attach-remove" aria-label={`${a.name} 빼기`} disabled={disabled}
                onClick={() => setKept(kept.filter((k) => k.id !== a.id))}><Ic.Close width="14" height="14" /></button>
            </li>
          ))}
          {pending.map((f, i) => (
            <li key={`${f.name}-${i}`} className="attach-item new">
              <Ic.Paperclip width="16" height="16" />
              <span className="name">{cleanFileName(f.name)}</span><span className="size">{formatFileSize(f.size)}</span>
              <span className="badge purple">새 파일</span>
              <button type="button" className="attach-remove" aria-label={`${f.name} 빼기`} disabled={disabled}
                onClick={() => setPending(pending.filter((_, j) => j !== i))}><Ic.Close width="14" height="14" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 새로 고른 파일을 올리고 [{ id, name, size }] 를 돌려준다. 중간에 실패하면 이미 올린 것도 되돌린다. */
export async function uploadPending(pending) {
  const done = [];
  try {
    for (const f of pending) done.push(await api.uploadAttachment(f));
  } catch (e) {
    await api.discardAttachments(done);
    throw e;
  }
  return done;
}

/** 저장된 첨부파일(시트/DB 의 "첨부파일" 칸 텍스트)을 내려받기 버튼으로 보여 준다 */
export function AttachmentLinks({ text }) {
  const list = parseAttachments(text);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  if (!list.length) return null;

  async function download(att) {
    setBusyId(att.id); setError('');
    try {
      const url = await api.attachmentUrl(att);
      const a = document.createElement('a');
      a.href = url; a.download = att.name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { setError(e.message); } finally { setBusyId(''); }
  }

  return (
    <div className="manual-attach">
      {list.map((a) => (
        <button key={a.id} type="button" className="attach-chip" onClick={() => download(a)} disabled={busyId === a.id} title="내려받기">
          <Ic.Paperclip width="16" height="16" /><span className="name">{a.name}</span><span className="size">{formatFileSize(a.size)}</span>
        </button>
      ))}
      {error && <span className="badge-error" role="alert"><Ic.Alert width="14" height="14" />{error}</span>}
    </div>
  );
}

/** 본문 속 http(s) 주소를 눌러 열 수 있게 링크로 바꾼다(글자 그대로 그리므로 본문의 HTML 이 실행되지는 않는다) */
function Linkified({ text }) {
  return String(text ?? '').split(/(https?:\/\/[^\s<>"']+)/g).map((part, i) => {
    if (i % 2 === 0) return part;
    const url = part.replace(/[.,;:!?)\]]+$/, '');
    return <Fragment key={i}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a>{part.slice(url.length)}</Fragment>;
  });
}

/** 게시글 한 개: 접었다 펼치기 + (펼쳤을 때) 첨부파일 · 수정 · 삭제 */
export default function ManualCard({ manual: m, showCategoryBadge, defaultOpen, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // 열림·닫힘을 React 도 같이 추적한다(onToggle 로 동기화). 그래야 수정 저장처럼
  // 다른 이유로 다시 렌더링될 때 "펼쳐져 있던 카드가 갑자기 닫히는" 일이 없다.
  const [open, setOpen] = useState(!!defaultOpen);

  async function remove() {
    if (!window.confirm(`"${m.title}" 메뉴얼을 삭제할까요? 첨부파일도 함께 지워지며 되돌릴 수 없습니다.`)) return;
    setBusy(true); setError('');
    try { await api.deleteManual(m.id); onChanged(); } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <details className="card manual" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        {showCategoryBadge && <span className="badge gray">{m.category}</span>}
        <span className="manual-title">{m.title}</span>
        {m.attachments && <span className="manual-clip" role="img" aria-label="첨부파일 있음"><Ic.Paperclip width="16" height="16" /></span>}
        <Ic.ChevronRight className="manual-chevron" width="18" height="18" />
      </summary>
      {editing ? (
        <ManualEditForm manual={m}
          onSaved={() => { setEditing(false); onChanged(); }}
          onCancel={() => setEditing(false)} />
      ) : (
        <>
          <pre><Linkified text={m.body} /></pre>
          <AttachmentLinks text={m.attachments} />
          <div className="manual-actions">
            {error && <span className="badge-error" role="alert"><Ic.Alert width="14" height="14" />{error}</span>}
            <button type="button" className="btn btn-secondary sm" onClick={() => setEditing(true)} disabled={busy}>수정</button>
            <button type="button" className="btn btn-danger sm" onClick={remove} disabled={busy}>{busy ? '삭제 중…' : '삭제'}</button>
          </div>
        </>
      )}
    </details>
  );
}

/** 수정 폼: 제목·내용·첨부파일을 바꾼다(카테고리는 그대로 둔다) */
function ManualEditForm({ manual: m, onSaved, onCancel }) {
  const [title, setTitle] = useState(m.title);
  const [body, setBody] = useState(m.body);
  const [kept, setKept] = useState(() => parseAttachments(m.attachments));
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId(); const bodyId = useId();

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    let uploaded = [];
    try {
      uploaded = await uploadPending(pending);
      await api.updateManual(m.id, { category: m.category, title, body, attachments: [...kept, ...uploaded] });
      onSaved();
    } catch (err) {
      await api.discardAttachments(uploaded);
      setError(err.message); setBusy(false);
    }
  }

  return (
    <form className="manual-edit" onSubmit={submit}>
      <div className="field">
        <label htmlFor={titleId}>제목</label>
        <AutoGrowText id={titleId} className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor={bodyId}>내용</label>
        <textarea id={bodyId} className="field-input" value={body} onChange={(e) => setBody(e.target.value)} rows={7} required />
      </div>
      <AttachmentField kept={kept} setKept={setKept} pending={pending} setPending={setPending} disabled={busy} />
      {error && <div className="badge-error" role="alert"><Ic.Alert width="14" height="14" />{error}</div>}
      <div className="manual-actions">
        <SaveButton size="sm" busy={busy} />
        <button type="button" className="btn btn-secondary sm" onClick={onCancel} disabled={busy}>취소</button>
      </div>
    </form>
  );
}

/** 작성 폼: 카테고리 · 제목(상황) · 내용(대처 방법) · 첨부파일. lockCategory 면 카테고리를 바꿀 수 없다(Goedu 화면에서 쓰기). */
export function ManualWriteForm({ defaultCategory, lockCategory = false, onSaved, onCancel }) {
  const [f, setF] = useState({ category: defaultCategory, title: '', body: '' });
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    let uploaded = [];
    try {
      uploaded = await uploadPending(pending);
      onSaved(await api.addManual({ ...f, attachments: uploaded }));
    } catch (err) {
      await api.discardAttachments(uploaded);
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <form className="card fade" onSubmit={submit}>
      <h2 className="section-title">메뉴얼 작성</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="m-category">카테고리</label>
          <select id="m-category" className="field-input" value={f.category} onChange={set('category')} disabled={lockCategory || busy}>
            {(lockCategory ? [defaultCategory] : MANUAL_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="m-title">제목 (어떤 상황인가요?)</label>
          <AutoGrowText id="m-title" className="field-input" value={f.title} onChange={set('title')} placeholder="예: 태블릿 충전함 건전지가 다 되어서 안 열릴 경우" required maxLength={120} />
        </div>
        <div className="field full">
          <label htmlFor="m-body">내용 (어떻게 하나요?)</label>
          <textarea id="m-body" className="field-input" value={f.body} onChange={set('body')} rows={7} required
            placeholder={'1. 3층 등사실에서 드라이버를 빌린다.\n2. 3층 행정실에서 9V 건전지를 빌린다.\n3. ...'} />
        </div>
        <AttachmentField kept={[]} setKept={() => {}} pending={pending} setPending={setPending} disabled={busy} />
      </div>
      {error && <div className="badge-error" role="alert" style={{ marginTop: 12 }}><Ic.Alert width="16" height="16" />{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <SaveButton busy={busy} />
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>취소</button>
      </div>
    </form>
  );
}
