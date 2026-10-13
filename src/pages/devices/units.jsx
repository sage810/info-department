import { useEffect, useId, useState } from 'react';
import { api, useQuery } from '../../lib/data.js';
import { UNIT_STATUSES, UNIT_TABS } from '../../../shared/sheet-schema.js';
import DataTable, { ChipToggle, EditSelectCell } from '../../components/DataTable.jsx';
import * as Ic from '../../components/Icons.jsx';

const CAT_LABEL = { 태블릿보관함: '태블릿 충전함' }; // 화면에 보이는 이름(탭 이름과 같게)
export const unitLabel = (r) => r.asset_no || r.serial_no || r.ip_address || '개별 장비';
export const batchLabel = (b) => `${[b.usage, b.manufacturer, b.model].filter(Boolean).join(' ') || b.item_category} (${b.id})`;

/* ---------- 개별 장비 카드: 묶음 하나 또는 그 유형 전체 ---------- */
const UNIT_SORTS = [['ip', 'IP주소순'], ['asset', '관리번호순'], ['date', '취득일자순'], ['user', '사용자순']];
// 태블릿·태블릿 충전함은 IP·사용자가 중심이 아니라서 제조사·모델명·(취득일자 | 보관 가능 대수)로 정렬한다
const UNIT_SORTS_FOR = {
  태블릿: [['maker', '제조사순'], ['model', '모델명순']],
  태블릿보관함: [['maker', '제조사순'], ['model', '모델명순'], ['capacity', '보관 가능 대수순']],
};
const ipKey = (ip) => String(ip ?? '').split('.').map((p) => p.padStart(3, '0')).join('.');
export function sortUnits(list, by) {
  const k = { ip: (u) => ipKey(u.ip_address), asset: (u) => u.asset_no ?? '', date: (u) => u.purchase_date ?? '', user: (u) => u.user_name ?? '',
    maker: (u) => u.manufacturer ?? '', model: (u) => u.model ?? '', capacity: (u) => String(u.capacity ?? 0).padStart(6, '0') }[by];
  return list.slice().sort((a, b) => k(a).localeCompare(k(b), 'ko', { numeric: true }));
}
/** 개별 장비 표의 열 — 개별 장비 카드와 노트북 화면이 같은 표를 보여 준다. showModel: 유형 전체를 볼 땐 묶음을 알 수 있게 모델명 열을 넣는다. */
/** 태블릿 충전함의 사양 열 — 표 위 띠의 "함께 볼 정보" 칩으로 켠다. 묶음(보유_* 탭)의 값이라 여기선 보기만 하고, 고치는 건 보유 현황의 묶음 표에서. */
const CABINET_SPEC_COLS = [
  { key: 'usb_type', header: 'USB줄 타입' },
  { key: 'reset_method', header: '초기화 방법' },
  { key: 'chromebook_ok', header: '크롬북 가능 여부' },
];
/** 유형별 "함께 볼 정보" 칩(켜면 그 열이 보인다) */
export const UNIT_CHIPS = {
  노트북: [{ key: 'asset_no', header: '관리번호' }, { key: 'serial_no', header: '분류번호' }, { key: 'item_kind', header: '물품구분' }, { key: 'item_name', header: '물품명' }],
  태블릿: [{ key: 'serial_no', header: '분류번호' }],
  태블릿보관함: [{ key: 'serial_no', header: '분류번호' }, ...CABINET_SPEC_COLS],
};
// 개별 장비 표의 열 조각
const U = {
  asset: { key: 'asset_no', header: '관리번호', className: 'mono', editable: true },
  cls: { key: 'serial_no', header: '분류번호', className: 'mono', editable: true },
  sn: { key: 'serial_number', header: '시리얼번호', className: 'mono', editable: true },
  kind: { key: 'item_kind', header: '물품구분', editable: true },
  itemName: { key: 'item_name', header: '물품명', editable: true },
  user: { key: 'user_name', header: '사용자', editable: true, editField: 'staff_id' },
  ip: { key: 'ip_address', header: 'IP주소', className: 'mono', editable: true },
  loc: { key: 'location', header: '위치', editable: true },
  maker: { key: 'manufacturer', header: '제조사', className: 'muted' },
  model: { key: 'model', header: '모델명', className: 'muted', render: (r) => r.model || r.item_name || '', filterValue: (r) => r.model || r.item_name || '' }, // 묶음이 없으면 물품명
  cap: { key: 'capacity', header: '보관 가능 대수', className: 'num muted' },
  date: { key: 'purchase_date', header: '취득일자', className: 'num', editable: true },
  os: { key: 'os', header: '운영체제', editable: true },
  status: { key: 'status', header: '상태', render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="status" ariaLabel="상태" options={UNIT_STATUSES.map((s) => [s, s])} />, filterValue: (r) => r.status ?? '' },
  memo: { key: 'memo', header: '비고', editable: true },
};
/**
 * 개별 장비 표의 열 — 유형마다 다르다. showModel: 유형 전체를 볼 땐 묶음을 알 수 있게 제조사·모델명(충전함은 보관 가능 대수까지) 열을 넣는다.
 * on: 함께 볼 정보 칩 상태(충전함 사양 열).
 */
export const unitColumns = (showModel, category, on = {}, { stock = false } = {}) => {
  const batchCols = (...cs) => (showModel ? cs : []);
  const opt = (c) => (on[c.key] ? [c] : []); // 함께 볼 정보 칩으로 켠 열
  if (category === '노트북') {
    // 보유(예비) 노트북은 사용자 대신 제조사, 위치는 운영체제 오른쪽
    if (stock) return [U.ip, ...opt(U.asset), ...opt(U.cls), U.sn, ...opt(U.kind), ...opt(U.itemName), ...batchCols(U.maker, U.model), U.date, U.os, U.loc, U.memo];
    return [U.ip, ...opt(U.asset), ...opt(U.cls), U.sn, ...opt(U.kind), ...opt(U.itemName), U.user, U.loc, ...batchCols(U.model), U.date, U.os, U.memo];
  }
  if (category === '태블릿') return [U.asset, ...opt(U.cls), U.sn, ...batchCols(U.maker, U.model), U.memo];
  if (category === '태블릿보관함') return [U.asset, ...opt(U.cls), ...batchCols(U.maker, U.model, U.cap), ...CABINET_SPEC_COLS.filter((c) => on[c.key]), U.memo];
  return [U.asset, U.cls, U.user, U.ip, U.loc, ...batchCols(U.model), U.date, U.os, U.status, U.memo];
};
/** 개별 장비 추가 폼의 칸 — 표에 보이는 칸과 같게 */
export function unitFieldsFor(category) {
  const keys = {
    노트북: ['ip_address', 'asset_no', 'serial_no', 'serial_number', 'item_kind', 'item_name', 'staff_id', 'location', 'purchase_date', 'os', 'memo'],
    태블릿: ['asset_no', 'serial_no', 'serial_number', 'memo'],
    태블릿보관함: ['asset_no', 'serial_no', 'memo'],
  }[category] ?? ['asset_no', 'serial_no', 'staff_id', 'ip_address', 'location', 'purchase_date', 'os', 'status', 'memo'];
  return keys.map((k) => ({
    staff_id: { key: k, header: '사용자', hint: '비우면 보유(예비)' },
    status: { key: k, options: UNIT_STATUSES },
  }[k] ?? { key: k }));
}
/** 표 위 띠 왼쪽의 정렬 드롭다운 */
export function UnitSortSelect({ value, onChange, options = UNIT_SORTS }) {
  return (
    <>
      <label htmlFor="unit-sort" className="chipset-label">정렬</label>
      <select id="unit-sort" className="field-input" style={{ width: 'auto', minHeight: 36 }} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </>
  );
}
export function UnitsCard({ category, batches, unitsFor, setUnitsFor, reloadBatches, titlePrefix = '개별 장비 · ' }) {
  const q = useQuery(api.deviceUnits);
  const sorts = UNIT_SORTS_FOR[category] ?? UNIT_SORTS;
  const [sortBy, setSortBy] = useState(sorts[0][0]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(true); // 제목을 눌러 표를 접고 펼친다
  const [on, setOn] = useState({}); // 함께 볼 정보(충전함 사양 열)
  useEffect(() => { setOpen(true); }, [unitsFor]); // 다른 묶음(또는 전체)을 보러 오면 다시 펼쳐 둔다
  const panelId = useId();
  if (!unitsFor) {
    return (
      <div className="table-tools units-open">
        <button type="button" className="btn btn-secondary" onClick={() => setUnitsFor('all')}>전체 {CAT_LABEL[category] ?? category} 개별 장비 보기</button>
      </div>
    );
  }
  const batch = unitsFor === 'all' ? null : batches.find((b) => b.id === unitsFor);
  const list = (q.data ?? []).filter((u) => (unitsFor === 'all' ? u.item_category === category : u.batch_id === unitsFor));
  const rows = sortUnits(list, sortBy);
  const cols = unitColumns(unitsFor === 'all', category, on);
  // 개별 장비 추가: 묶음 하나를 보고 있으면 그 묶음에 붙이고, 유형 전체를 보고 있으면 묶음을 고르게 한다. 묶음의 개수가 바뀌므로 위 묶음 표도 새로 읽는다.
  const unitFields = [
    ...(batch ? [] : [{ key: 'batch_id', header: '묶음', hint: '비워도 됨', options: [['', '(묶음 없음)'], ...batches.map((b) => [b.id, batchLabel(b)])] }]),
    ...unitFieldsFor(category),
  ];
  const reloadAll = () => { q.reload(); reloadBatches?.(); };
  const sortControl = (
    <>
      <UnitSortSelect value={sortBy} onChange={setSortBy} options={sorts} />
      {UNIT_CHIPS[category] && <ChipToggle options={UNIT_CHIPS[category]} on={on} onChange={setOn} />}
    </>
  );
  // 개별 장비 카드의 제목: 눌러서 표를 접고 펼친다(표 접기 버튼과 같은 접힘을 함께 쓴다)
  const heading = (
    <div className="units-head">
      <h2 className="section-title" style={{ margin: 0 }}>
        <button type="button" className="tg" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          <Ic.ChevronDown />{titlePrefix}{batch ? `${batch.usage} ${batch.manufacturer} ${batch.model}` : `전체 ${CAT_LABEL[category] ?? category}`}
        </button>
      </h2>
      {unitsFor !== 'all' && <button type="button" className="btn btn-secondary sm" onClick={() => setUnitsFor('all')}>전체 {CAT_LABEL[category] ?? category} 보기</button>}
    </div>
  );
  return (
    <section>
      {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}
      <div className="units-body">
        <DataTable columns={cols} rows={rows} loading={q.loading} error={q.error}
            searchKeys={['asset_no', 'serial_no', 'serial_number', 'user_name', 'ip_address', 'location', 'model']} searchPlaceholder="예: 10.20.4"
            emptyText="개별 장비가 없습니다. '추가'로 새로 만들 수 있습니다."
            table="device_units" reload={reloadAll} sheetTab={UNIT_TABS[category]} sheetInTop showCount={false} noCrumb
            heading={heading} foldId={panelId} folded={!open} onFoldedChange={(f) => setOpen(!f)} tableTop={sortControl}
            crud={{ add: true, edit: true, remove: true, defaults: batch ? { batch_id: batch.id, category } : { category }, fields: unitFields, rowLabel: unitLabel, addTitle: '개별 장비 추가',
              confirmDelete: (r) => `'${unitLabel(r)}' 개별 장비를 삭제할까요?\n- 시트 원본(${UNIT_TABS[category]} 탭)에서도 이 행이 지워집니다.\n- 이 장비의 A/S 기록(AS기록 탭)도 같이 지워집니다.\n- 묶음의 개수가 1대 줄어듭니다.\n되돌릴 수 없습니다.` }} />
      </div>
    </section>
  );
}

/* ---------- 전자기기 > 태블릿 · 태블릿 보관함: 개별 장비 표가 바로 열려 있다(보유 현황의 개별 장비 카드와 같은 표·같은 데이터·같은 시트) ---------- */
export function UnitsPage({ category, titlePrefix }) {
  const q = useQuery(api.devices);
  return <UnitsCard category={category} batches={(q.data ?? []).filter((r) => r.item_category === category)} unitsFor="all" setUnitsFor={() => {}} reloadBatches={q.reload} titlePrefix={titlePrefix} />;
}
