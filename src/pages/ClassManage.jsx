import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import PageHeader, { SubTabs, LinkButton } from '../components/PageHeader.jsx';
import DataTable, { GradePills } from '../components/DataTable.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/manage/class/tv', label: '반별 TV 브랜드', icon: Ic.Tv },
  { to: '/manage/class/cyber', label: '반별 사이버 지킴이', icon: Ic.Shield },
  { to: '/manage/class/cabinets', label: '반별 태블릿과 태블릿 충전함', icon: Ic.BatteryCharging },
];

export default function ClassManage() {
  return (
    <>
      <PageHeader title="반별 관리" desc="학급 단위로 TV·사이버 지킴이·태블릿 충전함을 봅니다. 셀을 누르면 바로 고칠 수 있습니다." />
      <SubTabs items={TABS} />
      <Routes>
        <Route index element={<Navigate to="tv" replace />} />
        <Route path="tv" element={<Tv />} />
        <Route path="cyber" element={<Cyber />} />
        <Route path="cabinets" element={<Cabinets />} />
      </Routes>
    </>
  );
}

const G = { key: 'grade', header: '학년', className: 'num', render: (r) => `${r.grade}학년` };
const C = { key: 'class_no', header: '반', className: 'num', render: (r) => `${r.class_no}반` };

/** 학년 필터 + 학년·반 검색이 붙은 표. table 을 주면 셀 편집이 켜진다(devices 화면도 같이 쓴다). */
export function ClassTable({ query, columns, sheet, text, searchKeys = [], filter, table }) {
  const q = useQuery(query);
  const [grade, setGrade] = useState(0);
  const rows = (q.data ?? []).map((r) => ({ ...r, _cls: `${r.grade}학년${r.class_no}반 ${r.grade}-${r.class_no}` }));
  return (
    <>
      <div className="page-head"><p className="muted small">{text}</p>{sheet && <LinkButton linkKey={`sheet:${sheet}`} label="시트에서 열기" />}</div>
      <DataTable columns={columns} rows={rows} loading={q.loading} error={q.error}
        filter={(r) => (grade === 0 || r.grade === grade) && (!filter || filter(r))}
        searchKeys={['_cls', ...searchKeys]} searchPlaceholder="예: 2-5, 2학년5반, 이름"
        toolbar={<GradePills value={grade} onChange={setGrade} />}
        table={table} reload={q.reload} />
    </>
  );
}

function Tv() {
  return <ClassTable query={api.classroomTvs} sheet="반별TV" text="학년 / 반 / 위치 / TV 브랜드. 위치는 학급 자체의 정보라 여기서는 못 고칩니다." table="classroom_tvs"
    columns={[G, C, { key: 'location', header: '위치' }, { key: 'brand', header: 'TV브랜드', editable: true }, { key: 'model', header: '모델명', editable: true }, { key: 'memo', header: '비고', editable: true }]}
    searchKeys={['brand', 'model', 'location']} />;
}
function Cyber() {
  return <ClassTable query={api.cyberGuardians} sheet="사이버지킴이" text="학년 / 반 / 번호 / 이름. 학번을 고치면 그 반의 사이버 지킴이가 바뀝니다." table="cyber_guardians"
    columns={[G, C, { key: 'number', header: '번호', className: 'num' }, { key: 'name', header: '이름' }, { key: 'student_no', header: '학번', className: 'mono', editable: true, editField: 'student_id' }]}
    searchKeys={['name', 'student_no']} />;
}
function Cabinets() {
  return <ClassTable query={api.tabletCabinets} sheet="태블릿보관함" text="학년 / 반 / 위치 / 태블릿 수량 / 충전함 비번" filter={(r) => !r.is_spare} table="tablet_cabinets"
    columns={[G, C, { key: 'location', header: '위치', editable: true }, { key: 'tablet_count', header: '태블릿 수량', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true }, { key: 'password', header: '비번', className: 'mono', editable: true }, { key: 'memo', header: '메모', editable: true }]}
    searchKeys={['location', 'password']} />;
}
