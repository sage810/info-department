import { useState } from 'react';
import { api, useQuery } from '../../lib/data.js';
import { DEVICE_USAGES, DEVICE_PLACES, CHROMEBOOK_OK, USB_TYPES, deviceTab } from '../../../shared/sheet-schema.js';
import DataTable, { ChipToggle, EditSelectCell } from '../../components/DataTable.jsx';
import * as Ic from '../../components/Icons.jsx';
import { UnitsCard } from './units.jsx';

/* ---------- 보유 현황 → 유형별 묶음 표 ---------- */
// 유형별 기본 열. 그 외 열은 "함께 볼 정보" 칩으로 켠다(노트북의 취득일자·운영체제 등). 집계표는 취득일자를 쓰므로 데이터엔 항상 있다.
const BATCH_COLS = {
  '데스크톱': { base: ['usage', 'item_category', 'manufacturer', 'model', 'quantity', 'purchase_date', 'os', 'memo'], extra: ['place', 'disposed_on'] },
  '노트북': { base: ['usage', 'item_category', 'manufacturer', 'model', 'quantity', 'memo'], extra: ['purchase_date', 'os', 'disposed_on'] },
  '태블릿': { base: ['usage', 'item_category', 'manufacturer', 'model', 'quantity', 'purchase_date', 'memo'], extra: ['os', 'disposed_on'] },
};
const BATCH_HEAD = {
  usage: '용도', item_category: '물품 분류명', place: '설치 장소', manufacturer: '제조사', model: '모델명', quantity: '수량', units: '개별 장비',
  capacity: '보관 가능 대수', usb_type: 'USB줄 타입', reset_method: '초기화 방법', chromebook_ok: '크롬북 가능 여부', purchase_date: '취득일자', os: '운영체제', disposed_on: '처분일', memo: '비고',
};
const UNITS_FOR = new Set(['데스크톱', '노트북', '태블릿']); // 태블릿 충전함은 묶음이 없다(전자기기 → 태블릿 충전함)
// 추가 폼에 넣을 칸(유형별). 물품 분류명은 이 화면의 유형으로 정해지므로 칸 없이 defaults 로 보낸다.
const ADD_KEYS = {
  '데스크톱': ['usage', 'place', 'manufacturer', 'model', 'quantity', 'purchase_date', 'os', 'memo'],
  '노트북': ['usage', 'manufacturer', 'model', 'quantity', 'purchase_date', 'os', 'memo'],
  '태블릿': ['usage', 'manufacturer', 'model', 'quantity', 'purchase_date', 'os', 'memo'],
};
const addField = (k) => ({
  usage: { key: k, options: DEVICE_USAGES, other: true },
  usb_type: { key: k, options: USB_TYPES, other: true },
  chromebook_ok: { key: k, options: CHROMEBOOK_OK },
  place: { key: k, options: DEVICE_PLACES },
  quantity: { key: k, required: true, hint: '개수 (개별 장비·충전함을 연결하면 자동 계산)' },
}[k] ?? { key: k });

export function InventoryBatches({ category }) {
  const q = useQuery(api.devices);
  const [on, setOn] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [unitsFor, setUnitsFor] = useState(null); // null | 'all' | batch id
  const cfg = BATCH_COLS[category];

  const col = (k) => {
    if (k === 'usage') return { key: k, header: BATCH_HEAD[k], render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="usage" ariaLabel="용도" options={DEVICE_USAGES} other />, filterValue: (r) => r.usage ?? '' };
    // 분류는 시트 탭(보유_*)이 정한다 — 바꾸려면 시트에서 줄을 새 분류의 탭으로 옮겨야 해서 앱에선 고치지 않는다
    if (k === 'item_category') return { key: k, header: BATCH_HEAD[k], className: 'muted', filterValue: (r) => r.item_category ?? '' };
    if (k === 'place') return { key: k, header: BATCH_HEAD[k], render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="place" ariaLabel="설치 장소" options={[['', '—'], ...DEVICE_PLACES.map((p) => [p, p])]} />, filterValue: (r) => r.place ?? '' };
    if (k === 'usb_type') return { key: k, header: BATCH_HEAD[k], render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="usb_type" ariaLabel="USB줄 타입" options={USB_TYPES} other />, filterValue: (r) => r.usb_type ?? '' };
    if (k === 'chromebook_ok') return { key: k, header: BATCH_HEAD[k], render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="chromebook_ok" ariaLabel="크롬북 가능 여부" options={[['', '—'], ...CHROMEBOOK_OK.map((v) => [v, v])]} />, filterValue: (r) => r.chromebook_ok ?? '' };
    if (k === 'quantity') return {
      key: k, header: BATCH_HEAD[k], className: 'num', editable: true, canEdit: (r) => !r.unit_count,
      // 개별 장비가 연결된 묶음은 수량이 개별 장비 개수로 계산된다 — 수량을 누르면 그 묶음의 개별 n대 보기
      render: (r) => (r.unit_count
        ? <button type="button" className="qty-link" onClick={() => setUnitsFor(r.id)} title={'개별 ' + r.unit_count + '대 보기'} aria-label={r.effective_quantity + '대, 개별 ' + r.unit_count + '대 보기'}>{r.effective_quantity}대</button>
        : `${r.quantity ?? 0}대`),
      filterValue: (r) => String(r.effective_quantity ?? ''),
    };
    return { key: k, header: BATCH_HEAD[k], editable: true, className: k.endsWith('_date') || k.endsWith('_on') || k === 'capacity' ? 'num' : undefined };
  };
  const cols = [...cfg.base, ...cfg.extra.filter((k) => on[k])].map(col);
  const chips = cfg.extra.map((k) => ({ key: k, header: BATCH_HEAD[k] }));

  return (
    <>
      {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}
      <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} filter={(r) => r.item_category === category}
        searchKeys={['usage', 'manufacturer', 'model', 'os', 'memo']} searchPlaceholder="예: 교원용, 삼성"
        tableTop={<ChipToggle options={chips} on={on} onChange={setOn} />}
        emptyText={`${category} 묶음이 없습니다. '추가'로 새로 만들 수 있습니다.`}
        table="devices" reload={q.reload} sheetTab={deviceTab(category)} sheetInTop showCount={false}
        crud={{ add: true, edit: true, remove: true, defaults: { item_category: category }, addTitle: `${category} 묶음 추가`,
          fields: ADD_KEYS[category].map(addField),
          rowLabel: (r) => [r.usage, r.manufacturer, r.model].filter(Boolean).join(' ') || category,
          confirmDelete: (r) => `'${[r.usage, r.manufacturer, r.model].filter(Boolean).join(' ') || category}' 묶음을 삭제할까요?\n- 시트 원본(${deviceTab(category)} 탭)에서도 이 행이 지워집니다.\n- 개별 장비가 연결돼 있으면 지워지지 않습니다(개별 장비를 먼저 삭제).\n- 전체 보유 현황 집계에서도 빠집니다. 폐기한 묶음이라면 삭제 대신 '처분일'을 적어 두세요.\n되돌릴 수 없습니다.` }} />
      {UNITS_FOR.has(category) && (
        <UnitsCard category={category} batches={(q.data ?? []).filter((r) => r.item_category === category)} unitsFor={unitsFor} setUnitsFor={setUnitsFor} reloadBatches={q.reload} />
      )}
    </>
  );
}
