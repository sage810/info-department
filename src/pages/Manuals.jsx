import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import { MANUAL_CATEGORIES } from '../../shared/sheet-schema.js';
import PageHeader, { SheetButton } from '../components/PageHeader.jsx';
import ManualCard, { ManualWriteForm } from '../components/ManualCard.jsx';
import AutoGrowText from '../components/AutoGrowText.jsx';
import * as Ic from '../components/Icons.jsx';

const CAT_ICON = {
  'WiFi': Ic.Wifi, '프린터': Ic.Printer, 'A/S': Ic.Wrench, '교실TV': Ic.Tv, '전입생': Ic.UserPlus, 'Goedu': Ic.IdCard,
  '노트북': Ic.Laptop, '태블릿': Ic.Tablet, '태블릿 충전함': Ic.BatteryCharging,
  '전자 소모품': Ic.Cable, '품의 방법': Ic.Receipt, '기타': Ic.Dots,
};

export default function Manuals() {
  const { data, loading, error, reload } = useQuery(api.manuals);
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') ?? MANUAL_CATEGORIES[0];
  const [draft, setDraft] = useState(''); // 입력 중인 검색어
  const [q, setQ] = useState('');         // 검색 버튼(또는 Enter)으로 확정된 검색어
  const [writing, setWriting] = useState(params.get('write') === '1'); // Goedu 화면의 "메뉴얼 작성" 링크가 바로 작성 폼을 열게
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
      <PageHeader title="메뉴얼" />

      {writing && <ManualWriteForm defaultCategory={cat} onSaved={onSaved} onCancel={() => setWriting(false)} />}

      <div className="table-tools">
        <form className="search-form search-form-half" role="search" onSubmit={search}>
          <div className="search">
            <Ic.Search />
            <AutoGrowText className="field-input" placeholder="상황·키워드 검색 (전체 카테고리)" aria-label="메뉴얼 검색어"
              value={draft} onChange={(e) => { setDraft(e.target.value); if (!e.target.value) setQ(''); }} />
          </div>
          <button type="submit" className="btn sm search-go">검색</button>
        </form>
      </div>

      <div className="mc-b mc-attached">
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
        {/* 카테고리 카드 아래에 붙은 띠: 추가(왼쪽, 다른 메뉴의 추가 버튼과 같은 모양) · 시트에서 열기(오른쪽 끝) */}
        <div className="table-top">
          <button type="button" className="btn sm btn-toggle" aria-pressed={writing} onClick={() => setWriting((w) => !w)}><Ic.Plus />추가</button>
          <SheetButton tab="메뉴얼" className="btn btn-secondary sm table-top-sheet" />
        </div>
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
