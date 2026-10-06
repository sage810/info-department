import { api, useQuery } from '../../lib/data.js';
import DataTable from '../../components/DataTable.jsx';

/* ---------- 보관함 ---------- */
export function StockCabinets() {
  const q = useQuery(api.tabletCabinets);
  return (
    <>
      <DataTable columns={[{ key: 'location', header: '위치', editable: true }, { key: 'tablet_count', header: '태블릿 수량', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true }, { key: 'password', header: '비번', className: 'mono', editable: true }, { key: 'memo', header: '기타 메모', editable: true }]}
        rows={q.data} loading={q.loading} error={q.error} filter={(r) => r.is_spare} searchKeys={['location', 'memo']} searchPlaceholder="예: 도서관, 예비"
        table="tablet_cabinets" reload={q.reload} sheetTab="태블릿보관함"
        crud={{ add: true, edit: true, remove: true, required: ['location'], addTitle: '여유 태블릿 보관함 추가',
          fields: [{ key: 'location', header: '위치' }, { key: 'tablet_count', header: '태블릿 수량', hint: '비우면 0' }, { key: 'password', header: '비번' }, { key: 'memo', header: '기타 메모' }],
          rowLabel: (r) => r.location || '여유 태블릿 보관함' }} />
    </>
  );
}
