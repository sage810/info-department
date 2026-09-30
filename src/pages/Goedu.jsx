import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import { useAuth } from '../lib/auth.jsx';
import PageHeader, { SubTabs, LinkButton } from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/goedu/teachers', label: '교사 가입현황', icon: Ic.IdCard },
  { to: '/goedu/students', label: '학생 가입현황', icon: Ic.Users },
  { to: '/goedu/admin', label: '관리자 메뉴얼', icon: Ic.Shield },
];

export default function Goedu() {
  return (
    <>
      <PageHeader title="Goedu" desc="교육청 Google Workspace(Goedu) 계정 현황과 관리자용 안내." />
      <SubTabs items={TABS} />
      <Routes>
        <Route index element={<Navigate to="teachers" replace />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<Students />} />
        <Route path="admin" element={<AdminManual />} />
      </Routes>
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
  const toolbar = (
    <div className="checks" role="group" aria-label="추가로 볼 열">
      {EXTRA.map((c) => (
        <label key={c.key} className="check">
          <input type="checkbox" checked={!!on[c.key]} onChange={(e) => setOn({ ...on, [c.key]: e.target.checked })} />{c.header}
        </label>
      ))}
    </div>
  );
  return (
    <>
      <div className="page-head"><p className="muted small">교사 가입현황 — 성함으로 검색. 체크하면 교직원 배치표의 정보를 같이 봅니다.</p><LinkButton linkKey="sheet:교사goedu" label="시트에서 열기" /></div>
      <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} searchKeys={['name']} searchPlaceholder="예: 한나라" toolbar={toolbar}
        table="goedu_teacher_accounts" reload={q.reload} />
    </>
  );
}

function Students() {
  const q = useQuery(api.goeduStudents);
  const cols = [
    { key: 'school_year', header: '학년도', className: 'num', editable: true },
    { key: 'grade', header: '학년', className: 'num' },
    { key: 'class_no', header: '반', className: 'num' },
    { key: 'number', header: '번호', className: 'num' },
    { key: 'name', header: '이름' },
    { key: 'account', header: '계정', className: 'mono', editable: true },
  ];
  return (
    <>
      <div className="page-head"><p className="muted small">학생 가입현황 — 학번(예: 21011, 30103) 또는 이름으로 검색.</p><LinkButton linkKey="sheet:학생goedu" label="시트에서 열기" /></div>
      <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} searchKeys={['student_no', 'name']} searchPlaceholder="예: 21011, 한별"
        table="goedu_student_accounts" reload={q.reload} />
    </>
  );
}

function AdminManual() {
  const { isAdmin } = useAuth();
  const notes = useQuery(() => (isAdmin ? api.adminNotes() : Promise.resolve([])), [isAdmin]);
  return (
    <div className="manual-list">
      <section className="card">
        <h2 className="section-title">1. 관리자 계정 · 학교 공용 메일</h2>
        {isAdmin ? (
          <dl className="kv">
            {(notes.data ?? []).map((n) => <><dt key={n.key + 'k'}>{n.label}</dt><dd key={n.key + 'v'} className="mono">{n.value}</dd></>)}
          </dl>
        ) : (
          <div className="badge-info"><Ic.Info width="16" height="16" />관리자만 볼 수 있습니다. 필요하면 정보과학부장에게 문의하세요.</div>
        )}
        <p className="muted small" style={{ marginTop: 12 }}>이 값은 구글 시트에 넣지 않고 DB(admin_notes)에만 저장됩니다. 관리자 화면에서 수정할 수 있습니다.</p>
      </section>

      <section className="card">
        <h2 className="section-title">2. 학생/교사가 본인의 Goedu 계정을 모를 때</h2>
        <ol className="steps">
          <li>Goedu 계정 관리자로 크롬에 접속한다 (시크릿 창 권장).</li>
          <li>관리 콘솔에 들어간다. <LinkButton linkKey="edutech:admin-console" label="관리 콘솔 열기" className="btn btn-secondary sm" /></li>
          <li className="muted">(이후 절차는 추후 보강)</li>
        </ol>
      </section>

      <section className="card">
        <h2 className="section-title">3. 담임 선생님께 드릴 파일</h2>
        <div className="link-list">
          <FileRow linkKey="drive:transfer-student-zip" />
          <FileRow linkKey="drive:no-account-zip" />
        </div>
      </section>
    </div>
  );
}

function FileRow({ linkKey }) {
  const { data } = useQuery(api.links);
  const l = (data ?? []).find((x) => x.key === linkKey);
  if (!l) return null;
  return (
    <div className="link-row">
      <div className="t"><b>{l.label}</b><span>{l.memo}</span></div>
      <a className="btn btn-primary sm" href={l.url} target="_blank" rel="noopener noreferrer"><Ic.Download />zip 다운로드</a>
    </div>
  );
}
