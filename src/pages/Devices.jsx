import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import PageHeader, { SubTabs, LinkButton } from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import { ClassTable } from './ClassManage.jsx';
import { RentalTable } from './Rentals.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/devices/laptops', label: '노트북', icon: Ic.Laptop },
  { to: '/devices/tablets', label: '태블릿', icon: Ic.Tablet },
  { to: '/devices/cabinets', label: '태블릿 보관함', icon: Ic.Archive },
];
const SUB = {
  laptops: [{ to: '/devices/laptops/staff', label: '교원용 노트북 (IP대장)' }, { to: '/devices/laptops/stock', label: '보유 노트북' }],
  tablets: [{ to: '/devices/tablets/student', label: '학생용' }, { to: '/devices/tablets/staff', label: '교원용' }, { to: '/devices/tablets/stock', label: '보유 태블릿' }],
  cabinets: [{ to: '/devices/cabinets/class', label: '반별 태블릿 보관함' }, { to: '/devices/cabinets/stock', label: '보유 태블릿 보관함' }],
};

export default function Devices() {
  return (
    <>
      <PageHeader title="전자기기" desc="노트북·태블릿·보관함 현황. 표는 시트에서 읽어 오고, 셀을 누르면 바로 고칠 수 있습니다." />
      <SubTabs items={TABS} />
      <Routes>
        <Route index element={<Navigate to="laptops/staff" replace />} />
        <Route path=":cat" element={<CatIndex />} />
        <Route path="laptops/staff" element={<Section cat="laptops"><Laptops staffOnly /></Section>} />
        <Route path="laptops/stock" element={<Section cat="laptops"><Laptops staffOnly={false} /></Section>} />
        <Route path="tablets/student" element={<Section cat="tablets"><StudentTablets /></Section>} />
        <Route path="tablets/staff" element={<Section cat="tablets"><StaffTablets /></Section>} />
        <Route path="tablets/stock" element={<Section cat="tablets"><StockTablets /></Section>} />
        <Route path="cabinets/class" element={<Section cat="cabinets"><ClassCabinets /></Section>} />
        <Route path="cabinets/stock" element={<Section cat="cabinets"><StockCabinets /></Section>} />
      </Routes>
    </>
  );
}
function CatIndex() {
  const { cat } = useParams();
  return <Navigate to={SUB[cat]?.[0]?.to ?? '/devices/laptops/staff'} replace />;
}
function Section({ cat, children }) {
  return <><SubTabs items={SUB[cat]} sub />{children}</>;
}
function Head({ sheet, text }) {
  return <div className="page-head"><p className="muted small">{text}</p>{sheet && <LinkButton linkKey={`sheet:${sheet}`} label="시트에서 열기" />}</div>;
}

/* ---------- 노트북 ---------- */
function Laptops({ staffOnly }) {
  const q = useQuery(api.laptops);
  const cols = staffOnly
    ? [{ key: 'ip_address', header: 'IP주소', className: 'mono', editable: true }, { key: 'user_name', header: '사용자', editable: true, editField: 'staff_id' }, { key: 'position', header: '직위', editable: true }, { key: 'department', header: '부서' }, { key: 'location', header: '위치', editable: true }, { key: 'manufacturer', header: '제조사', editable: true }, { key: 'model', header: '모델명', editable: true }, { key: 'serial_no', header: '일련번호', className: 'mono', editable: true }, { key: 'purchase_date', header: '구입일자', className: 'num', editable: true }, { key: 'memo', header: '비고', editable: true }]
    : [{ key: 'ip_address', header: 'IP주소', className: 'mono', editable: true }, { key: 'location', header: '보유 위치', editable: true }, { key: 'manufacturer', header: '제조사', editable: true }, { key: 'model', header: '모델명', editable: true }, { key: 'serial_no', header: '일련번호', className: 'mono', editable: true }, { key: 'purchase_date', header: '구입일자', className: 'num', editable: true }, { key: 'memo', header: '비고', editable: true }];
  return (
    <>
      <Head sheet="노트북" text={staffOnly ? '교원용 노트북 IP대장 — 사용자가 지정된 노트북. "부서"는 사용자의 교직원 정보라 여기서는 못 고칩니다.' : '보유 노트북 — 사용자가 없는 예비·공용 노트북'} />
      <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} filter={(l) => (staffOnly ? !!l.staff_id : !l.staff_id)}
        searchKeys={['ip_address', 'user_name', 'position', 'department', 'location', 'manufacturer', 'model', 'serial_no']} searchPlaceholder="예: 10.20.4.11, 한나라, 그램"
        table="laptops" reload={q.reload} />
    </>
  );
}

/* ---------- 태블릿 ---------- */
function StudentTablets() {
  return <ClassTable query={api.tabletCabinets} sheet="태블릿보관함" text="학생용 태블릿 — 반별 보관함의 태블릿 수량" filter={(r) => !r.is_spare} table="tablet_cabinets"
    columns={[
      { key: 'grade', header: '학년', className: 'num', render: (r) => `${r.grade}학년` },
      { key: 'class_no', header: '반', className: 'num', render: (r) => `${r.class_no}반` },
      { key: 'location', header: '위치', editable: true },
      { key: 'tablet_count', header: '태블릿', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true },
    ]} searchKeys={['location']} />;
}
function StaffTablets() {
  return (
    <>
      <Head sheet="대여" text="교원용 태블릿 — 현재 대여 중인 태블릿 (교직원별 관리 → 태블릿과 같은 기록)" />
      <RentalTable itemType="태블릿" compact onlyOpen extraCols={['borrower_name', 'manufacturer', 'model', 'rented_on', 'returned_on']} />
    </>
  );
}
function StockTablets() {
  const q = useQuery(api.tablets);
  return (
    <>
      <Head sheet="보유태블릿" text="보유 태블릿 — 예비·공용 태블릿" />
      <DataTable columns={[{ key: 'location', header: '위치', editable: true }, { key: 'manufacturer', header: '제조사', editable: true }, { key: 'model', header: '태블릿', editable: true }, { key: 'serial_no', header: '일련번호', className: 'mono', editable: true }, { key: 'purchase_date', header: '구입일자', className: 'num', editable: true }, { key: 'memo', header: '비고', editable: true }]}
        rows={q.data} loading={q.loading} error={q.error} searchKeys={['location', 'manufacturer', 'model', 'serial_no', 'memo']} searchPlaceholder="예: 창고, 삼성, iPad"
        table="tablets" reload={q.reload} />
    </>
  );
}

/* ---------- 보관함 ---------- */
function ClassCabinets() {
  return <ClassTable query={api.tabletCabinets} sheet="태블릿보관함" text="반별 태블릿 보관함 — 학년 / 반 / 위치 / 비번" filter={(r) => !r.is_spare} table="tablet_cabinets"
    columns={[
      { key: 'grade', header: '학년', className: 'num', render: (r) => `${r.grade}학년` },
      { key: 'class_no', header: '반', className: 'num', render: (r) => `${r.class_no}반` },
      { key: 'location', header: '위치', editable: true },
      { key: 'password', header: '비번', className: 'mono', editable: true },
    ]} searchKeys={['location', 'password']} />;
}
function StockCabinets() {
  const q = useQuery(api.tabletCabinets);
  return (
    <>
      <Head sheet="태블릿보관함" text="보유 태블릿 보관함 — 반에 배정되지 않은 예비 보관함" />
      <DataTable columns={[{ key: 'location', header: '위치', editable: true }, { key: 'password', header: '비번', className: 'mono', editable: true }, { key: 'tablet_count', header: '태블릿 수량', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true }, { key: 'memo', header: '기타 메모', editable: true }]}
        rows={q.data} loading={q.loading} error={q.error} filter={(r) => r.is_spare} searchKeys={['location', 'memo']} searchPlaceholder="예: 도서관, 예비"
        table="tablet_cabinets" reload={q.reload} />
    </>
  );
}
