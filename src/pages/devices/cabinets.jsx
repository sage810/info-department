import { useMemo, useState } from 'react';
import { api, useQuery } from '../../lib/data.js';
import { cabinetModels } from '../../lib/api/common.js';
import DataTable, { ChipToggle } from '../../components/DataTable.jsx';
import { Cabinets, CABINET_SPEC_CHIPS, CABINET_SPEC_FIELDS, cabinetSpecColumns } from '../ClassManage.jsx';

/*
 * 전자기기 → 태블릿 충전함. 충전함 한 대가 태블릿보관함 탭의 한 줄이고, 모델 정보(제조사·모델명·취득일자 등)도 그 줄에 적는다.
 *   현황: 충전함 줄들을 제조사 + 모델명 + 취득일자로 묶어 센 표(읽기 전용 — 고치는 건 학급별·여유에서)
 *   학급별: 반마다 한 대(반별 관리 → 반별 태블릿 & 태블릿 충전함과 같은 데이터)
 *   여유: 반에 배정되지 않은 충전함
 * 줄은 고정이다 — 학년이 바뀌어도 줄은 그대로 두고 "학년-반"만 고친다.
 */
export function CabinetsOverview() {
  const q = useQuery(api.tabletCabinets);
  const rows = useMemo(() => (q.data ? cabinetModels(q.data) : q.data), [q.data]);
  const [on, setOn] = useState({});
  const extra = [{ key: 'unit_price', header: '취득단가(원)', className: 'num' }, { key: 'gsms_registered', header: 'GSMS 등재' }, { key: 'as_contact', header: 'A/S 연락처' }];
  return (
    <DataTable rows={rows} loading={q.loading} error={q.error} sheetTab="태블릿보관함" sheetInTop showCount={false}
      tableTop={<ChipToggle options={extra} on={on} onChange={setOn} />}
      searchKeys={['manufacturer', 'model', 'usage', 'as_contact']} searchPlaceholder="예: 스마트엑세스, D30"
      emptyText="충전함이 없습니다. 학급별·여유에서 추가하면 여기에 모델별로 모입니다."
      columns={[
        { key: 'manufacturer', header: '제조사' }, { key: 'model', header: '모델명', render: (r) => r.model || '(모델 미입력)' },
        { key: 'purchase_date', header: '취득일자', className: 'num' }, { key: 'capacity', header: '충전 가능 대수', className: 'num', render: (r) => (r.capacity ? `${r.capacity}대용` : '') },
        { key: 'count', header: '대수', className: 'num', render: (r) => `${r.count}대` },
        { key: 'class_count', header: '학급 / 여유', className: 'num', render: (r) => `${r.class_count} / ${r.spare_count}` },
        { key: 'usage', header: '용도' }, { key: 'in_use', header: '사용여부' },
        ...extra.filter((c) => on[c.key]),
      ]} />
  );
}
export const ClassCabinets = () => <Cabinets withSpec />;

export function StockCabinets() {
  const q = useQuery(api.tabletCabinets);
  const [on, setOn] = useState({});
  return (
    <>
      <DataTable columns={[
        { key: 'location', header: '위치', editable: true },
        ...cabinetSpecColumns(on),
        { key: 'tablet_count', header: '태블릿 수량', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true },
        { key: 'password', header: '비번', className: 'mono', editable: true },
        { key: 'memo', header: '기타 메모', editable: true }]}
        rows={q.data} loading={q.loading} error={q.error} filter={(r) => r.is_spare} searchKeys={['location', 'memo', 'model', 'manufacturer', 'serial_no']} searchPlaceholder="예: 도서관, 예비"
        tableTop={<ChipToggle options={CABINET_SPEC_CHIPS} on={on} onChange={setOn} />}
        table="tablet_cabinets" reload={q.reload} sheetTab="태블릿보관함" sheetInTop
        crud={{ add: true, edit: true, remove: true, required: ['location'], addTitle: '여유 태블릿 충전함 추가',
          fields: [{ key: 'location', header: '위치' }, ...CABINET_SPEC_FIELDS, { key: 'tablet_count', header: '태블릿 수량', hint: '비우면 0' }, { key: 'password', header: '비번' }, { key: 'memo', header: '기타 메모' }],
          rowLabel: (r) => r.location || '여유 태블릿 충전함' }} />
    </>
  );
}
