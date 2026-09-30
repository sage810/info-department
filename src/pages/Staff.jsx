import { api, useQuery } from '../lib/data.js';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

const COLS = [
  { key: 'department', header: '부서', editable: true },
  { key: 'name', header: '성함', editable: true },
  { key: 'subject', header: '과목', editable: true },
  { key: 'position', header: '직위', editable: true },
  { key: 'location', header: '위치', editable: true },
  { key: 'extension', header: '내선연락망', className: 'num', editable: true },
];

export default function Staff() {
  const q = useQuery(api.staff);
  return (
    <>
      <PageHeader title="교직원 검색" desc="부서·성함·과목·위치·내선으로 검색할 수 있습니다. 셀을 누르면 바로 고칠 수 있습니다." sheetTab="교직원" />
      <DataTable columns={COLS} rows={q.data} loading={q.loading} error={q.error}
        searchKeys={['department', 'name', 'subject', 'location', 'extension']}
        searchPlaceholder="예: 이바다, 정보과학부, 739" table="staff" reload={q.reload} />
    </>
  );
}
