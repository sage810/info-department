import { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import PageHeader, { TabCard } from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import { datedColumn } from '../components/DatedMemo.jsx';
import { ClassAs } from './ClassManage.jsx';
import { UNIT_TABS } from '../../shared/sheet-schema.js';
import { unitFieldsFor, unitLabel, batchLabel } from './devices/units.jsx';
import * as Ic from '../components/Icons.jsx';

// A/S: 장비 종류별 A/S 기록과 반별 A/S 를 한 메뉴에 모은다.
const TABS = [
  { to: '/as/laptop', label: '노트북 A/S', icon: Ic.Laptop },
  { to: '/as/tablet', label: '태블릿 A/S', icon: Ic.Tablet },
  { to: '/as/class', label: '반별 A/S', icon: Ic.Wrench },
];

export default function As() {
  return (
    <>
      <PageHeader title="A/S" />
      <TabCard items={TABS}>
        <Routes>
          <Route index element={<Navigate to="laptop" replace />} />
          <Route path="laptop" element={<UnitAs category="노트북" />} />
          <Route path="tablet" element={<UnitAs category="태블릿" />} />
          <Route path="cabinet" element={<Navigate to="/as/class" replace />} />
          <Route path="class" element={<ClassAs />} />
          <Route path="*" element={<Navigate to="laptop" replace />} />
        </Routes>
      </TabCard>
    </>
  );
}

/**
 * 장비 A/S: 그 종류의 개별 장비(시트 "전자기기_개별_종류" 탭)마다 "A/S 기록" 칸 하나(기록은 시트 "AS기록" 탭에 한 줄씩). 날짜 태그 칸이라
 * 고치면 오늘 날짜 줄이 붙고, 날짜가 다르면 줄이 나뉜다. 다른 메뉴처럼 추가·수정·삭제를 한다(같은 개별 장비 데이터라 전자기기 메뉴에도 그대로 반영).
 */
function UnitAs({ category }) {
  const q = useQuery(api.deviceUnits);
  const batchesQ = useQuery(api.devices);
  const batches = (batchesQ.data ?? []).filter((b) => b.item_category === category);
  const rows = useMemo(() => (q.data
    ? q.data.filter((u) => u.item_category === category).sort((a, b) => String(a.asset_no ?? '').localeCompare(String(b.asset_no ?? ''), 'ko', { numeric: true }))
    : q.data), [q.data, category]);
  const columns = [
    { key: 'asset_no', header: '관리번호', className: 'mono' },
    { key: 'serial_number', header: '시리얼번호', className: 'mono' },
    { key: 'manufacturer', header: '제조사', className: 'muted' },
    { key: 'model', header: '모델명', className: 'muted' },
    ...(category === '노트북' ? [{ key: 'user_name', header: '사용자' }] : []),
    { key: 'location', header: '위치' },
    datedColumn('as_log', 'A/S 기록'),
  ];
  return (
    <DataTable columns={columns} rows={rows} loading={q.loading} error={q.error}
      searchKeys={['asset_no', 'serial_number', 'manufacturer', 'model', 'user_name', 'location', 'as_log']} searchPlaceholder="예: 2024-NB-001, 키보드" wideSearch
      emptyText="개별 장비가 없습니다. '추가'로 새로 만들 수 있습니다."
      table="device_units" reload={() => { q.reload(); batchesQ.reload(); }} sheetTab={UNIT_TABS[category]} sheetInTop showCount={false}
      crud={{ add: true, edit: true, remove: true, rowLabel: unitLabel, addTitle: '개별 장비 추가',
        defaults: { category }, // 묶음이 없을 때 종류(탭)
        fields: [{ key: 'batch_id', header: '묶음', hint: '비워도 됨', options: [['', '(묶음 없음)'], ...batches.map((b) => [b.id, batchLabel(b)])] }, ...unitFieldsFor(category)],
        confirmDelete: (r) => `'${unitLabel(r)}' 개별 장비를 삭제할까요?\n- 시트 원본(${UNIT_TABS[category]} 탭)에서도 이 행이 지워집니다(전자기기 메뉴에서도 사라짐).\n- 이 장비의 A/S 기록(AS기록 탭)도 같이 지워집니다.\n- 묶음의 개수가 1대 줄어듭니다.\n되돌릴 수 없습니다.` }} />
  );
}
