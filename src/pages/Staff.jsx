import { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import PageHeader, { TabCard } from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import { studentNo } from '../../shared/sheet-schema.js';
import * as Ic from '../components/Icons.jsx';

// 학교 정보: 카테고리는 교직원(예전 "교직원 검색" 표)과 학생. 카테고리마다 위치 제목줄이 있는 도구줄 카드가 맨 위에 붙는다.
const TABS = [
  { to: '/staff/contacts', label: '교직원', icon: Ic.Users },
  { to: '/staff/students', label: '학생', icon: Ic.IdCard },
];

export default function Staff() {
  return (
    <>
      <PageHeader title="학교 정보" />
      <TabCard items={TABS}>
        <Routes>
          <Route index element={<Navigate to="contacts" replace />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="students" element={<Students />} />
          <Route path="*" element={<Navigate to="contacts" replace />} />
        </Routes>
      </TabCard>
    </>
  );
}

const COLS = [
  { key: 'department', header: '부서', editable: true },
  { key: 'name', header: '성함', editable: true },
  { key: 'subject', header: '과목', editable: true },
  { key: 'position', header: '직위', editable: true },
  { key: 'location', header: '위치', editable: true },
  { key: 'homeroom', header: '담임', className: 'mono', editable: true },
  { key: 'extension', header: '내선연락망', className: 'num', editable: true },
];

function Contacts() {
  const q = useQuery(api.staff);
  return (
    <DataTable columns={COLS} rows={q.data} loading={q.loading} error={q.error}
      searchKeys={['department', 'name', 'subject', 'location', 'homeroom', 'extension']}
      searchPlaceholder="예: 이바다, 정보과학부, 739" table="staff" reload={q.reload} wideSearch
      sheetTab="교직원" sheetInTop editInTop showCount={false}
      crud={{ add: true, edit: true, remove: true, required: ['name'], rowLabel: (r) => r.name,
        confirmDelete: (r) => `'${r.name}' 교직원을 삭제할까요?
- 시트 원본(교직원 탭)에서도 이 행이 지워집니다.
- 이 교직원의 Goedu 교사 계정도 함께 지워집니다.
- 노트북 사용자·대여 확인자 등으로 적힌 이름은 연결만 끊깁니다.
되돌릴 수 없습니다.` }} />
  );
}

/* ---------- 학생: 학생 명단(시트 "학생" 탭). 교직원 화면과 같은 모양 — 학년·반·번호·이름. 가장 최근 학년도만 보여 준다. ---------- */
const STUDENT_COLS = [
  { key: 'grade', header: '학년', className: 'num', editable: true },
  { key: 'class_no', header: '반', className: 'num', editable: true },
  { key: 'number', header: '번호', className: 'num', editable: true },
  { key: 'name', header: '이름', editable: true },
];

function Students() {
  const q = useQuery(api.students);
  const rows = useMemo(() => {
    const list = q.data ?? [];
    const year = Math.max(0, ...list.map((s) => s.school_year ?? 0));
    return list.filter((s) => !year || s.school_year === year).map((s) => ({ ...s, student_no: studentNo(s) }));
  }, [q.data]);
  return (
    <DataTable columns={STUDENT_COLS} rows={q.data ? rows : q.data} loading={q.loading} error={q.error}
      searchKeys={['name', 'student_no']} searchPlaceholder="예: 한별, 21011" table="students" reload={q.reload} wideSearch
      sheetTab="학생" sheetInTop editInTop showCount={false}
      crud={{ add: true, edit: true, remove: true, required: ['grade', 'class_no', 'number', 'name'], rowLabel: (r) => `${r.grade}학년 ${r.class_no}반 ${r.number}번 ${r.name ?? ''}`.trim(), addTitle: '학생 추가',
        fields: [{ key: 'grade', header: '학년', hint: '예: 2' }, { key: 'class_no', header: '반', hint: '예: 5' }, { key: 'number', header: '번호', hint: '예: 11' }, { key: 'name', header: '이름' }],
        confirmDelete: (r) => `'${r.grade}학년 ${r.class_no}반 ${r.number}번 ${r.name ?? ''}' 학생을 삭제할까요?
- 시트 원본(학생 탭)에서도 이 행이 지워집니다.
- 이 학생의 Goedu 학생 계정과 사이버 지킴이 지정도 함께 지워집니다.
- 대여 기록에 적힌 학번은 연결만 끊깁니다.
되돌릴 수 없습니다.` }} />
  );
}
