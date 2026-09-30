import { Routes, Route, Navigate } from 'react-router-dom';
import PageHeader, { SubTabs, LinkButton } from '../components/PageHeader.jsx';
import { RentalTable } from './Rentals.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/manage/staff/laptops', label: '노트북', icon: Ic.Laptop },
  { to: '/manage/staff/tablets', label: '태블릿', icon: Ic.Tablet },
  { to: '/manage/staff/consumables', label: '전자기기 소모품', icon: Ic.Cable },
];

export default function StaffManage() {
  return (
    <>
      <PageHeader title="교직원별 관리" desc="선생님별로 나간 노트북·태블릿·소모품을 봅니다." />
      <SubTabs items={TABS} />
      <Routes>
        <Route index element={<Navigate to="tablets" replace />} />
        <Route path="laptops" element={<LaptopSheet />} />
        <Route path="tablets" element={<><Head sheet="대여" text="교원용 태블릿 — 대여 메뉴의 태블릿과 같은 기록입니다." /><RentalTable itemType="태블릿" /></>} />
        <Route path="consumables" element={<><Head sheet="대여" text="전자기기 소모품 — 케이블·허브·프레젠터 등." /><RentalTable itemType="소모품" /></>} />
      </Routes>
    </>
  );
}

function Head({ sheet, text }) {
  return <div className="page-head"><p className="muted small">{text}</p><LinkButton linkKey={`sheet:${sheet}`} label="시트에서 열기" /></div>;
}

function LaptopSheet() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <h3 className="section-title" style={{ margin: 0 }}>교원용 노트북</h3>
      <p className="muted">교원용 노트북 관리는 구글 드라이브의 시트에서 직접 합니다. IP대장은 <a href="/devices/laptops/staff">전자기기 → 노트북</a> 에서 볼 수 있습니다.</p>
      <LinkButton linkKey="drive:staff-laptop-sheet" label="교원용 노트북 시트 열기" className="btn btn-primary" />
      <span className="small muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Ic.Info width="14" height="14" />링크는 시트의 링크 탭(키: drive:staff-laptop-sheet)에서 바꿀 수 있습니다.</span>
    </div>
  );
}
