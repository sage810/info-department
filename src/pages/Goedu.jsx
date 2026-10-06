import { useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import { SCHOOL_YEAR } from '../../shared/sheet-schema.js';
import PageHeader, { TabCard } from '../components/PageHeader.jsx';
import DataTable, { ChipToggle } from '../components/DataTable.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/goedu/teachers', label: '교사 가입현황', icon: Ic.IdCard },
  { to: '/goedu/students', label: '학생 가입현황', icon: Ic.Users },
];

export default function Goedu() {
  return (
    <>
      <PageHeader title="Goedu" />
      <TabCard items={TABS}>
        <Routes>
          <Route index element={<Navigate to="teachers" replace />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="*" element={<Navigate to="teachers" replace />} />
        </Routes>
      </TabCard>
    </>
  );
}

const EXTRA = [
  { key: 'department', header: '부서' },
  { key: 'subject', header: '과목' },
  { key: 'location', header: '위치' },
  { key: 'extension', header: '내선 연락망', className: 'num' },
];

function Teachers() {
  const q = useQuery(api.goeduTeachers);
  const [on, setOn] = useState({});
  const cols = [
    { key: 'name', header: '성함', editable: true, editField: 'staff_id' },
    { key: 'account', header: '계정', className: 'mono', editable: true },
    ...EXTRA.filter((c) => on[c.key]),
  ];
  const tableTop = <ChipToggle options={EXTRA} on={on} onChange={setOn} />;
  return (
    <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} searchKeys={['name']} searchPlaceholder="예: 한나라" tableTop={tableTop} showCount={false} sheetInTop
      table="goedu_teacher_accounts" reload={q.reload} sheetTab="교사goedu"
      crud={{ add: true, edit: true, remove: true, rowLabel: (r) => r.name || r.staff_id || r.account,
        addTitle: 'Goedu 교사 계정 추가',
        fields: [{ key: 'staff_id', header: '성함', required: true }, { key: 'account', header: '계정', required: true, hint: '예: hannara@goedu.kr' }] }} />
  );
}

function Students() {
  const q = useQuery(api.goeduStudents);
  // 학년도는 표 열이 아니라 도구줄의 드롭다운으로 고른다(전자기기 보유 현황의 기준연도와 같은 모양). 기본은 가장 최근 학년도.
  const years = useMemo(() => [...new Set((q.data ?? []).map((r) => r.school_year))].sort((a, b) => b - a), [q.data]);
  const [pick, setPick] = useState(null);
  const year = pick ?? years[0] ?? SCHOOL_YEAR;
  const yearSelect = (
    <>
      <label htmlFor="goedu-year" className="chipset-label">학년도</label>
      <select id="goedu-year" className="field-input" style={{ width: 'auto' }} value={year} onChange={(e) => setPick(Number(e.target.value))}>
        {(years.length ? years : [SCHOOL_YEAR]).map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </>
  );
  const cols = [
    { key: 'grade', header: '학년', className: 'num' },
    { key: 'class_no', header: '반', className: 'num' },
    { key: 'number', header: '번호', className: 'num' },
    { key: 'name', header: '이름' },
    { key: 'account', header: '계정', className: 'mono', editable: true },
  ];
  return (
    <>
      <DataTable columns={cols} showCount={false} sheetInTop tableTop={yearSelect} filter={(r) => r.school_year === year} rows={q.data} loading={q.loading} error={q.error} searchKeys={['student_no', 'name']} searchPlaceholder="예: 21011, 한별"
        table="goedu_student_accounts" reload={q.reload} sheetTab="학생goedu"
        crud={{ add: true, edit: true, remove: true, rowLabel: (r) => r.name || r.student_id || r.account,
          addTitle: 'Goedu 학생 계정 추가', defaults: { school_year: year },
          fields: [
            { key: 'student_id', header: '학번', required: true, hint: '학년+반 2자리+번호 2자리, 예: 21011' },
            { key: 'account', header: '계정', required: true, hint: '예: 21011@goedu.kr' }] }} />
    </>
  );
}

