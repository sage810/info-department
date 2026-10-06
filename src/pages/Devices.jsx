import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import PageHeader, { TabCard } from '../components/PageHeader.jsx';
import * as Ic from '../components/Icons.jsx';
import { InventoryOverview } from './devices/inventory.jsx';
import { InventoryBatches } from './devices/batches.jsx';
import { UnitsPage } from './devices/units.jsx';
import { Laptops } from './devices/laptops.jsx';
import { StockCabinets } from './devices/cabinets.jsx';

const TABS = [
  { to: '/devices/inventory', label: '전체 전자기기 보유 현황', short: '보유 현황', icon: Ic.Grid },
  { to: '/devices/laptops', label: '노트북', icon: Ic.Laptop },
  { to: '/devices/tablets', label: '태블릿', icon: Ic.Tablet },
  { to: '/devices/cabinets', label: '태블릿 보관함', icon: Ic.Archive },
];
const SUB = {
  inventory: [
    { to: '/devices/inventory/all', label: '전체' }, { to: '/devices/inventory/desktop', label: '데스크톱' },
    { to: '/devices/inventory/laptop', label: '노트북' }, { to: '/devices/inventory/tablet', label: '태블릿' },
    { to: '/devices/inventory/cabinet', label: '태블릿 충전함' },
  ],
  laptops: [{ to: '/devices/laptops/staff', label: '교원용 노트북 (IP대장)' }, { to: '/devices/laptops/stock', label: '보유 노트북' }],
  tablets: [{ to: '/devices/tablets/stock', label: '보유 태블릿' }],
  cabinets: [{ to: '/devices/cabinets/units', label: '태블릿 충전함' }, { to: '/devices/cabinets/stock', label: '여유 태블릿 보관함' }],
};

export default function Devices() {
  return (
    <>
      <PageHeader title="전자기기" />
      <Routes>
        <Route index element={<Navigate to="inventory/all" replace />} />
        <Route path=":cat" element={<CatIndex />} />
        <Route path="inventory/all" element={<Section cat="inventory"><InventoryOverview /></Section>} />
        <Route path="inventory/desktop" element={<Section cat="inventory"><InventoryBatches category="데스크톱" /></Section>} />
        <Route path="inventory/laptop" element={<Section cat="inventory"><InventoryBatches category="노트북" /></Section>} />
        <Route path="inventory/tablet" element={<Section cat="inventory"><InventoryBatches category="태블릿" /></Section>} />
        <Route path="inventory/cabinet" element={<Section cat="inventory"><InventoryBatches category="태블릿보관함" /></Section>} />
        <Route path="laptops/staff" element={<Section cat="laptops"><Laptops staffOnly /></Section>} />
        <Route path="laptops/stock" element={<Section cat="laptops"><Laptops staffOnly={false} /></Section>} />
        <Route path="tablets/stock" element={<Section cat="tablets"><UnitsPage category="태블릿" /></Section>} />
        <Route path="cabinets/units" element={<Section cat="cabinets"><UnitsPage category="태블릿보관함" titlePrefix="" /></Section>} />
        <Route path="cabinets/class" element={<Navigate to="/devices/cabinets/units" replace />} />
        <Route path="cabinets/stock" element={<Section cat="cabinets"><StockCabinets /></Section>} />
      </Routes>
    </>
  );
}
function CatIndex() {
  const { cat } = useParams();
  return <Navigate to={SUB[cat]?.[0]?.to ?? '/devices/inventory/all'} replace />;
}
// 카테고리 타일(보유 현황/노트북/태블릿/태블릿 보관함)과 그 안의 화면 선택을 한 카드에 담는다 — 세그먼트 버튼 시안 C.
function Section({ cat, children }) {
  const sub = SUB[cat];
  return (
    <>
      <TabCard items={TABS} sub={sub.length > 1 ? sub : null}>{children}</TabCard>
    </>
  );
}