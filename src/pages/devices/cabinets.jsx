import { api, useQuery } from '../../lib/data.js';
import DataTable, { EditSelectCell } from '../../components/DataTable.jsx';
import { InventoryBatches } from './batches.jsx';
import { Cabinets, cabinetBatchOptions } from '../ClassManage.jsx';

/*
 * 전자기기 → 태블릿 충전함. "모델 묶음(보유_태블릿보관함 탭) + 충전함 한 대씩(태블릿보관함 탭)" 2단 구조.
 *   현황: 모델별 묶음 표(수량 = 그 묶음을 고른 충전함 수)
 *   학급별: 반마다 한 대(반별 관리 → 반별 태블릿 & 태블릿 충전함과 같은 데이터)
 *   여유: 반에 배정되지 않은 충전함
 * 충전함은 고정 줄이다 — 학년이 바뀌어도 줄은 그대로 두고 "학년-반"만 고친다(그 충전함의 A/S 기록이 끊기지 않게).
 */
export const CabinetsOverview = () => <InventoryBatches category="태블릿보관함" />;
export const ClassCabinets = () => <Cabinets withBatch />;

export function StockCabinets() {
  const q = useQuery(api.tabletCabinets);
  const batches = useQuery(api.devices).data?.filter((b) => b.item_category === '태블릿보관함') ?? [];
  return (
    <>
      <DataTable columns={[
        { key: 'location', header: '위치', editable: true },
        { key: 'batch_id', header: '모델', render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="batch_id" ariaLabel="모델(묶음)" options={cabinetBatchOptions(batches)} />, filterValue: (r) => `${r.manufacturer} ${r.model}` },
        { key: 'serial_no', header: '분류번호', className: 'mono', editable: true },
        { key: 'in_use', header: '사용여부', className: 'muted' }, // 묶음(모델)의 값 — 현황 표에서 고친다
        { key: 'tablet_count', header: '태블릿 수량', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true },
        { key: 'password', header: '비번', className: 'mono', editable: true },
        { key: 'memo', header: '기타 메모', editable: true }]}
        rows={q.data} loading={q.loading} error={q.error} filter={(r) => r.is_spare} searchKeys={['location', 'memo', 'model', 'manufacturer', 'serial_no']} searchPlaceholder="예: 도서관, 예비"
        table="tablet_cabinets" reload={q.reload} sheetTab="태블릿보관함"
        crud={{ add: true, edit: true, remove: true, required: ['location'], addTitle: '여유 태블릿 충전함 추가',
          fields: [{ key: 'location', header: '위치' }, { key: 'batch_id', header: '모델', hint: '비워도 됨', options: cabinetBatchOptions(batches) }, { key: 'serial_no', header: '분류번호' },
            { key: 'tablet_count', header: '태블릿 수량', hint: '비우면 0' }, { key: 'password', header: '비번' }, { key: 'memo', header: '기타 메모' }],
          rowLabel: (r) => r.location || '여유 태블릿 충전함' }} />
    </>
  );
}
