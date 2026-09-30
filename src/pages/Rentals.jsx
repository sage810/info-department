import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery, today } from '../lib/data.js';
import { useAuth } from '../lib/auth.jsx';
import PageHeader, { SubTabs, SheetButton } from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/rentals/laptop', label: '노트북', icon: Ic.Laptop },
  { to: '/rentals/tablet', label: '태블릿', icon: Ic.Tablet },
  { to: '/rentals/other', label: '기타 전자기기', icon: Ic.Dots },
];

export default function Rentals() {
  return (
    <>
      <PageHeader title="대여" desc="노트북·태블릿·기타 전자기기를 빌리러 온 분을 기록하고, 돌려받으면 반납 처리합니다. 셀을 누르면 바로 고칠 수 있습니다." sheetTab="대여" />
      <SubTabs items={TABS} />
      <Routes>
        <Route index element={<Navigate to="tablet" replace />} />
        <Route path="laptop" element={<RentalTable itemType="노트북" />} />
        <Route path="tablet" element={<RentalTable itemType="태블릿" />} />
        <Route path="other" element={<RentalTable itemType="기타" />} />
      </Routes>
    </>
  );
}

/* 구분별 열 구성 */
const FIELDS = {
  노트북: { cols: ['borrower_name', 'manufacturer', 'rented_on', 'returned_on', 'checked_by_name'], form: ['borrower_name', 'manufacturer', 'model'] },
  태블릿: { cols: ['borrower_name', 'manufacturer', 'model', 'rented_on', 'returned_on', 'checked_by_name'], form: ['borrower_name', 'manufacturer', 'model'] },
  소모품: { cols: ['borrower_name', 'item_name', 'rented_on', 'returned_on', 'checked_by_name'], form: ['borrower_name', 'item_name'] },
  기타: { cols: ['borrower_name', 'item_name', 'manufacturer', 'model', 'rented_on', 'returned_on', 'checked_by_name'], form: ['borrower_name', 'item_name', 'manufacturer', 'model'] },
};
const HEADERS = {
  borrower_name: '대여자 성함', manufacturer: '제조사', model: '기종', item_name: '품목',
  rented_on: '대여 날짜', returned_on: '반납 날짜', checked_by_name: '확인자',
};
const LABELS_BY_TYPE = { 소모품: { borrower_name: '성함', item_name: '대여 소모품' }, 태블릿: { model: '태블릿 기종' } };

/**
 * 대여 표 + 기록 폼 + 반납 버튼. 교직원별 관리(태블릿·소모품)와 대여 메뉴가 같이 쓴다.
 *  itemType: '노트북' | '태블릿' | '소모품' | '기타'
 *  compact: true 면 폼 없이 표만 (전자기기 → 교원용 태블릿 등)
 */
export function RentalTable({ itemType, compact = false, onlyOpen = false, extraCols }) {
  const q = useQuery(api.rentals);
  const staff = useQuery(api.staff);
  const { profile } = useAuth();
  const [status, setStatus] = useState(onlyOpen ? 'open' : 'all');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const cfg = FIELDS[itemType];
  const label = (k) => LABELS_BY_TYPE[itemType]?.[k] ?? HEADERS[k];

  async function doReturn(row) {
    if (!window.confirm(`${row.borrower_name} 님의 ${itemType} 을(를) 오늘(${today()}) 반납 처리할까요?`)) return;
    setBusy(row.id); setError('');
    try { await api.returnRental(row.id); q.reload(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  }

  const cols = (extraCols ?? cfg.cols).map((k) => ({
    key: k, header: label(k), className: k.endsWith('_on') ? 'num' : undefined,
    render: k === 'returned_on'
      ? (r) => (r.returned_on ? <span>{r.returned_on}</span> : <span className="badge purple">미반납</span>)
      : undefined,
    filterValue: k === 'returned_on' ? (r) => r.returned_on || '미반납' : undefined,
    editable: true,
    editField: k === 'checked_by_name' ? 'checked_by_staff_id' : undefined,
  }));
  if (!compact) {
    cols.push({
      key: '_act', header: '',
      render: (r) => (!r.returned_on
        ? <button type="button" className="btn btn-secondary sm" disabled={busy === r.id} onClick={() => doReturn(r)}><Ic.Check />반납</button>
        : <span className="badge green">반납완료</span>),
    });
  }

  const toolbar = !compact && (
    <div className="pills sub" role="group" aria-label="반납 상태">
      {[['all', '전체'], ['open', '미반납'], ['done', '반납완료']].map(([v, l]) => (
        <button key={v} type="button" className={`pill-tab${status === v ? ' active' : ''}`} onClick={() => setStatus(v)}>{l}</button>
      ))}
    </div>
  );
  const filter = (r) => r.item_type === itemType
    && (status === 'all' || (status === 'open' ? !r.returned_on : !!r.returned_on));

  return (
    <>
      {!compact && <AddForm itemType={itemType} fields={cfg.form} label={label} staff={staff.data ?? []} me={profile} onAdded={q.reload} />}
      {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}
      <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} filter={filter}
        searchKeys={['borrower_name', 'manufacturer', 'model', 'item_name', 'checked_by_name']}
        searchPlaceholder="예: 최나무, 갤럭시탭, 한나라" toolbar={toolbar}
        emptyText={`${itemType} 대여 기록이 없습니다.`}
        table="rentals" reload={q.reload} />
    </>
  );
}

function AddForm({ itemType, fields, label, staff, me, onAdded }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ rented_on: today(), checked_by_staff_id: me?.staff_id ?? '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await api.addRental({ item_type: itemType, ...f });
      setF({ rented_on: today(), checked_by_staff_id: me?.staff_id ?? '' });
      setOpen(false); onAdded();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (!open) return <div><button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Ic.Plus />{itemType} 대여 기록하기</button></div>;
  return (
    <form className="card" onSubmit={submit}>
      <h2 className="section-title">{itemType} 대여 기록</h2>
      <div className="form-grid">
        {fields.map((k) => (
          <div className="field" key={k}>
            <label htmlFor={`f-${k}`}>{label(k)}</label>
            <input id={`f-${k}`} className="field-input" list={k === 'borrower_name' ? 'staff-names' : undefined}
              value={f[k] ?? ''} onChange={set(k)} required={k === 'borrower_name' || k === 'item_name'} autoComplete="off" />
          </div>
        ))}
        <div className="field">
          <label htmlFor="f-rented_on">대여 날짜</label>
          <input id="f-rented_on" className="field-input" type="date" value={f.rented_on} onChange={set('rented_on')} required />
        </div>
        <div className="field">
          <label htmlFor="f-checker">확인자</label>
          <select id="f-checker" className="field-input" value={f.checked_by_staff_id ?? ''} onChange={set('checked_by_staff_id')}>
            <option value="">(선택)</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.department}</option>)}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="f-memo">비고</label>
          <input id="f-memo" className="field-input" value={f.memo ?? ''} onChange={set('memo')} />
        </div>
      </div>
      <datalist id="staff-names">{staff.map((s) => <option key={s.id} value={s.name} />)}</datalist>
      {error && <div className="badge-error" role="alert" style={{ marginTop: 12 }}><Ic.Alert width="16" height="16" />{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>저장</button>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>취소</button>
      </div>
    </form>
  );
}

export { SheetButton };
