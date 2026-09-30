import { useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import { MANUAL_CATEGORIES } from '../../shared/sheet-schema.js';
import PageHeader, { SheetButton } from '../components/PageHeader.jsx';
import * as Ic from '../components/Icons.jsx';

const CAT_ICON = {
  'WiFi': Ic.Wifi, '프린터': Ic.Printer, 'A/S': Ic.Wrench, '교실TV': Ic.Tv, '전입생': Ic.UserPlus,
  '노트북': Ic.Laptop, '태블릿': Ic.Tablet, '태블릿 충전함': Ic.BatteryCharging,
  '전자 소모품': Ic.Cable, '품의 방법': Ic.Receipt, '기타': Ic.Dots,
};

export default function Manuals() {
  const { data, loading, error, reload } = useQuery(api.manuals);
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') ?? MANUAL_CATEGORIES[0];
  const [draft, setDraft] = useState(''); // 입력 중인 검색어
  const [q, setQ] = useState('');         // 검색 버튼(또는 Enter)으로 확정된 검색어
  const [writing, setWriting] = useState(false);
  const [justSaved, setJustSaved] = useState(null);

  const list = useMemo(() => {
    let l = data ?? [];
    const needle = q.trim().toLowerCase();
    if (needle) l = l.filter((m) => (m.title + m.body + m.category).toLowerCase().includes(needle));
    else l = l.filter((m) => m.category === cat);
    return l.slice().sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order);
  }, [data, cat, q]);

  function onSaved(row) {
    setWriting(false); setDraft(''); setQ(''); setJustSaved(row.id); setParams({ cat: row.category }); reload();
  }
  function search(e) {
    e.preventDefault();
    setQ(draft);
  }
  function pickCategory(c) {
    setDraft(''); setQ(''); setParams({ cat: c });
  }

  return (
    <>
      <PageHeader title="메뉴얼" desc="상황별 대처 방법. 여기서 작성하면 시트의 메뉴얼 탭에도 기록됩니다." titleAside={<SheetButton tab="메뉴얼" />}>
        {!writing && <button type="button" className="btn btn-primary" onClick={() => setWriting(true)}><Ic.Plus />작성하기</button>}
      </PageHeader>

      {writing && <WriteForm defaultCategory={cat} onSaved={onSaved} onCancel={() => setWriting(false)} />}

      <div className="mc-b">
        <div className="mc-grid" role="tablist" aria-label="카테고리">
          {MANUAL_CATEGORIES.map((c) => {
            const Icon = CAT_ICON[c];
            return (
              <button key={c} type="button" role="tab" aria-selected={!q && cat === c} className={`mc-tile${!q && cat === c ? ' active' : ''}`}
                onClick={() => pickCategory(c)}>
                {Icon && <Icon />}
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="table-tools">
        <form className="search-form search-form-half" role="search" onSubmit={search}>
          <div className="search">
            <Ic.Search />
            <input className="field-input" type="search" placeholder="상황·키워드 검색 (전체 카테고리)" aria-label="메뉴얼 검색어"
              value={draft} onChange={(e) => { setDraft(e.target.value); if (!e.target.value) setQ(''); }} />
          </div>
          <button type="submit" className="btn btn-secondary sm">검색</button>
        </form>
      </div>
      {q && <p className="muted small">"{q}" 검색 결과 {list.length}건 · 카테고리를 누르면 검색이 해제됩니다.</p>}

      <div className="manual-list">
        {loading && <div className="card muted">불러오는 중…</div>}
        {error && <div className="badge-error"><Ic.Alert width="16" height="16" />{String(error.message)}</div>}
        {!loading && list.length === 0 && <div className="card muted">해당하는 메뉴얼이 없습니다. 작성하기로 첫 글을 남겨 보세요.</div>}
        {list.map((m) => (
          <ManualCard key={m.id} manual={m} showCategoryBadge={!!q} defaultOpen={m.id === justSaved} onChanged={reload} />
        ))}
      </div>
    </>
  );
}

/** 게시글 한 개: 접었다 펼치기 + (펼쳤을 때) 수정·삭제 */
function ManualCard({ manual: m, showCategoryBadge, defaultOpen, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // 열림·닫힘을 React 도 같이 추적한다(onToggle 로 동기화). 그래야 수정 저장처럼
  // 다른 이유로 다시 렌더링될 때 "펼쳐져 있던 카드가 갑자기 닫히는" 일이 없다.
  const [open, setOpen] = useState(defaultOpen);

  async function remove() {
    if (!window.confirm(`"${m.title}" 메뉴얼을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusy(true); setError('');
    try { await api.deleteManual(m.id); onChanged(); } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <details className="card manual" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        {showCategoryBadge && <span className="badge gray">{m.category}</span>}
        <span className="manual-title">{m.title}</span>
        <Ic.ChevronRight className="manual-chevron" width="18" height="18" />
      </summary>
      {editing ? (
        <ManualEditForm manual={m}
          onSaved={() => { setEditing(false); onChanged(); }}
          onCancel={() => setEditing(false)} />
      ) : (
        <>
          <pre>{m.body}</pre>
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

/** 수정 폼: 제목·내용만 바꾼다(카테고리는 그대로 둔다) */
function ManualEditForm({ manual: m, onSaved, onCancel }) {
  const [title, setTitle] = useState(m.title);
  const [body, setBody] = useState(m.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId(); const bodyId = useId();

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api.updateManual(m.id, { category: m.category, title, body }); onSaved(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="manual-edit" onSubmit={submit}>
      <div className="field">
        <label htmlFor={titleId}>제목</label>
        <input id={titleId} className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor={bodyId}>내용</label>
        <textarea id={bodyId} className="field-input" value={body} onChange={(e) => setBody(e.target.value)} rows={7} required />
      </div>
      {error && <div className="badge-error" role="alert"><Ic.Alert width="14" height="14" />{error}</div>}
      <div className="manual-actions">
        <button type="submit" className="btn btn-primary sm" disabled={busy}>{busy ? '저장 중…' : '저장'}</button>
        <button type="button" className="btn btn-secondary sm" onClick={onCancel} disabled={busy}>취소</button>
      </div>
    </form>
  );
}

/** 작성 폼: 카테고리 · 제목(상황) · 내용(대처 방법) */
function WriteForm({ defaultCategory, onSaved, onCancel }) {
  const [f, setF] = useState({ category: defaultCategory, title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { onSaved(await api.addManual(f)); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form className="card fade" onSubmit={submit}>
      <h2 className="section-title">메뉴얼 작성</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="m-category">카테고리</label>
          <select id="m-category" className="field-input" value={f.category} onChange={set('category')}>
            {MANUAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="m-title">제목 (어떤 상황인가요?)</label>
          <input id="m-title" className="field-input" value={f.title} onChange={set('title')} placeholder="예: 태블릿 충전함 건전지가 다 되어서 안 열릴 경우" required maxLength={120} />
        </div>
        <div className="field full">
          <label htmlFor="m-body">내용 (어떻게 하나요?)</label>
          <textarea id="m-body" className="field-input" value={f.body} onChange={set('body')} rows={7} required
            placeholder={'1. 3층 등사실에서 드라이버를 빌린다.\n2. 3층 행정실에서 9V 건전지를 빌린다.\n3. ...'} />
        </div>
      </div>
      {error && <div className="badge-error" role="alert" style={{ marginTop: 12 }}><Ic.Alert width="16" height="16" />{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? '저장 중…' : '저장'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>취소</button>
      </div>
    </form>
  );
}
