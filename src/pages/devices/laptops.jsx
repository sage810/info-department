import { useMemo, useState } from 'react';
import { api, useQuery } from '../../lib/data.js';
import { UNIT_TABS } from '../../../shared/sheet-schema.js';
import DataTable, { ChipToggle } from '../../components/DataTable.jsx';
import { UNIT_CHIPS, UnitSortSelect, sortUnits, unitColumns, unitLabel, batchLabel } from './units.jsx';

function Head({ text }) {
  return <div className="page-head"><p className="muted small">{text}</p></div>;
}

/* ---------- 노트북 (교원용 IP대장 / 보유) — 개별 장비 표를 사용자 유무로 나눠 본다 ---------- */
const LAPTOP_EXTRA = {
  position: { key: 'position', header: '직위', className: 'muted' },
  department: { key: 'department', header: '부서', className: 'muted' },
};
export function Laptops({ staffOnly }) {
  const q = useQuery(api.laptops);
  const batchesQ = useQuery(api.devices);
  const [on, setOn] = useState({});
  const [sortBy, setSortBy] = useState('ip');
  const laptopRows = useMemo(() => (q.data ? sortUnits(q.data, sortBy) : q.data), [q.data, sortBy]);
  // 추가 폼: 노트북 묶음을 고르게 한다. 교원용은 사용자가 있고(상태 '사용 중'), 보유 노트북은 사용자 없이 '보유(예비)'로 들어간다.
  const laptopBatches = (batchesQ.data ?? []).filter((b) => b.item_category === '노트북');
  const addFields = [
    { key: 'batch_id', header: '묶음', hint: '비워도 됨', options: [['', '(묶음 없음)'], ...laptopBatches.map((b) => [b.id, batchLabel(b)])] },
    { key: 'ip_address' },
    ...(staffOnly ? [{ key: 'staff_id', header: '사용자', required: true, hint: '교직원 탭의 성함과 똑같이' }] : []),
    { key: 'location', header: staffOnly ? '위치' : '보유 위치' },
    { key: 'asset_no' }, { key: 'serial_no' }, { key: 'serial_number' }, { key: 'item_kind' }, { key: 'item_name' }, { key: 'purchase_date' }, { key: 'os' }, { key: 'memo' },
  ];
  // 개별 장비 표와 같은 열. 관리번호·분류번호(교원용은 사용자의 직위·부서도)는 "함께 볼 정보"로 켠다.
  const cols = unitColumns(true, '노트북', on, { stock: !staffOnly }).flatMap((c) => (c.key === 'user_name' && staffOnly ? [c, on.position && LAPTOP_EXTRA.position, on.department && LAPTOP_EXTRA.department] : [c])).filter(Boolean);
  const tableTop = (
    <>
      <UnitSortSelect value={sortBy} onChange={setSortBy} />
      <ChipToggle options={[...UNIT_CHIPS['노트북'], ...(staffOnly ? Object.values(LAPTOP_EXTRA) : [])]} on={on} onChange={setOn} />
    </>
  );
  return (
    <>
      {!staffOnly && <Head text="보유 노트북 — 사용자가 없는 예비·공용 노트북. 제조사·모델명은 묶음(보유 현황 → 노트북)에서 고칩니다." />}
      <DataTable columns={cols} rows={laptopRows} loading={q.loading} error={q.error} filter={(l) => (staffOnly ? !!l.staff_id : !l.staff_id)}
        searchKeys={['asset_no', 'serial_no', 'serial_number', 'item_kind', 'item_name', 'user_name', 'ip_address', 'location', 'manufacturer', 'model', 'position', 'department']} searchPlaceholder="예: 10.20.4"
        tableTop={tableTop}
        table="device_units" reload={q.reload} sheetTab={UNIT_TABS.노트북} sheetInTop showCount={false}
        crud={{ add: true, edit: true, remove: true, fields: addFields, rowLabel: unitLabel, addTitle: staffOnly ? '교원용 노트북 추가' : '보유 노트북 추가',
          defaults: { status: staffOnly ? '사용 중' : '보유(예비)', category: '노트북' }, // category: 묶음이 없을 때 종류(탭)
          confirmDelete: (r) => `'${unitLabel(r)}' 노트북을 삭제할까요?\n- 시트 원본(${UNIT_TABS.노트북} 탭)에서도 이 행이 지워집니다.\n- 노트북 묶음의 개수가 1대 줄어듭니다.\n되돌릴 수 없습니다.` }} />
    </>
  );
}
