import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { api, useQuery, today } from '../lib/data.js';
import PageHeader, { SheetButton, TabCard } from '../components/PageHeader.jsx';
import DataTable, { SelectCell } from '../components/DataTable.jsx';
import AutoGrowText from '../components/AutoGrowText.jsx';
import DatePicker from '../components/DatePicker.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { useMediaQuery, SIDE_RAIL_QUERY } from '../lib/useMediaQuery.js';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/rentals/laptop', label: '노트북', icon: Ic.Laptop },
  { to: '/rentals/tablet', label: '태블릿', icon: Ic.Tablet },
  { to: '/rentals/other', label: '기타 전자기기', icon: Ic.Dots },
];
// 태블릿·기타는 학생 대여/교직원 대여로 나뉜다(각각 표·작성 폼이 따로). 노트북은 안 나뉜다.
const SUB = {
  tablet: [{ to: '/rentals/tablet/student', label: '학생 대여' }, { to: '/rentals/tablet/staff', label: '교직원 대여' }],
  other: [{ to: '/rentals/other/student', label: '학생 대여' }, { to: '/rentals/other/staff', label: '교직원 대여' }],
};

export default function Rentals() {
  return (
    <>
      <PageHeader title="대여" sheetTab="대여" />
      <section className="card">
        <h2 className="section-title">대여</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <NavLink to="/rentals/new" className="btn btn-choice"><Ic.Plus />대여하기</NavLink>
          <NavLink to="/rentals/return" className="btn btn-choice"><Ic.Check />반납하기</NavLink>
        </div>
      </section>
      <Routes>
        <Route index element={<Navigate to="/rentals/tablet/student" replace />} />
        <Route path="new" element={<RentalQuickNew />} />
        <Route path="return" element={<RentalReturnSearch />} />
        <Route path="laptop" element={<Section cat={null}><RentalTable itemType="노트북" /></Section>} />
        <Route path="tablet" element={<Navigate to="/rentals/tablet/student" replace />} />
        <Route path="tablet/student" element={<Section cat="tablet"><RentalTable itemType="태블릿" mode="student" /></Section>} />
        <Route path="tablet/staff" element={<Section cat="tablet"><RentalTable itemType="태블릿" mode="staff" /></Section>} />
        <Route path="other" element={<Navigate to="/rentals/other/student" replace />} />
        <Route path="other/student" element={<Section cat="other"><RentalTable itemType="기타" mode="student" /></Section>} />
        <Route path="other/staff" element={<Section cat="other"><RentalTable itemType="기타" mode="staff" /></Section>} />
        {/* 예전 "소모품" 탭 같은 지금은 없는 주소로 들어오면(즐겨찾기 등) 빈 화면 대신 기본 탭으로 */}
        <Route path="*" element={<Navigate to="/rentals/tablet/student" replace />} />
      </Routes>
    </>
  );
}

/** 카테고리 타일(노트북/태블릿/기타) + (태블릿·기타면) 학생 대여·교직원 대여 화면 선택을 한 카드에 담는다 — 전자기기 화면과 같은 디자인. */
function Section({ cat, children }) {
  const sub = cat ? SUB[cat] : null;
  return (
    <>
      <TabCard items={TABS} sub={sub}>{children}</TabCard>
    </>
  );
}

/* 구분(+학생/교직원)별 열 구성. 표에 보이는 열은 홈 → 대여 → 대여하기(빠른 등록)가 실제로 받는 값과 맞춘다 —
 * 제조사·모델명은 그 폼에 없어서 표에서도 뺐다. */
const FIELDS = {
  '노트북': { cols: ['borrower_name', 'rented_on', 'returned_on', 'checked_by_name', 'memo'] },
  '태블릿:student': { cols: ['borrower_grade', 'borrower_class_no', 'borrower_number', 'borrower_name', 'item_type', 'rented_on', 'returned_on', 'checked_by_name', 'memo'] },
  '태블릿:staff': { cols: ['borrower_name', 'rented_on', 'returned_on', 'checked_by_name', 'memo'] },
  '기타:student': { cols: ['borrower_grade', 'borrower_class_no', 'borrower_number', 'borrower_name', 'item_name', 'rented_on', 'returned_on', 'checked_by_name', 'memo'] },
  '기타:staff': { cols: ['borrower_name', 'item_name', 'rented_on', 'returned_on', 'checked_by_name', 'memo'] },
};
const HEADERS = {
  borrower_name: '대여자 성함', manufacturer: '제조사', model: '기종',
  item_type: '대여 물품', item_name: '대여 물품', memo: '비고',
  rented_on: '대여 날짜', returned_on: '반납 여부', checked_by_name: '반납 확인자',
  borrower_grade: '학년', borrower_class_no: '반', borrower_number: '번호',
};
const LABELS_BY_TYPE = { 태블릿: { model: '태블릿 기종' } };

/**
 * 대여 표 + 반납 여부. 새 기록은 맨 위 "대여" 카드의 대여하기(홈과 같은 카드)로 만든다 — 이 표는 보기·반납·셀
 * 편집만 한다.
 *  itemType: '노트북' | '태블릿' | '기타'
 *  mode: '태블릿'·'기타' 만 'student' | 'staff' 로 나뉜다(표가 다름). 노트북은 안 나뉜다.
 */
export function RentalTable({ itemType, mode, sheetTab }) {
  const q = useQuery(api.rentals);
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState(location.state?.savedMsg ?? '');
  const cfg = FIELDS[mode ? `${itemType}:${mode}` : itemType] ?? { cols: [] };
  const label = (k) => (k === 'borrower_name' && mode === 'student' ? '이름' : LABELS_BY_TYPE[itemType]?.[k] ?? HEADERS[k]);

  // 빠른 등록 폼에서 막 넘어온 경우에만: 알림을 잠깐 보여주고, 뒤로/새로고침해도 다시 안 뜨게 주소의 state 를 지운다.
  useEffect(() => {
    if (!location.state?.savedMsg) return;
    navigate(location.pathname, { replace: true, state: null });
    const t = setTimeout(() => setSavedMsg(''), 4000);
    return () => clearTimeout(t);
  }, []);

  async function setReturned(row, wantReturned) {
    if (wantReturned && !window.confirm(`${row.borrower_name} 님의 ${itemType} 을(를) 오늘(${today()}) 반납 처리할까요?`)) return;
    setBusy(row.id); setError('');
    try {
      if (wantReturned) await api.returnRental(row.id); else await api.unreturnRental(row.id);
      q.reload();
    } catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  const cols = cfg.cols.map((k) => {
    if (k === 'returned_on') return {
      key: k, header: label(k),
      render: (r, { editing }) => (editing
        ? <SelectCell ariaLabel="반납 여부" busy={busy === r.id} value={r.returned_on ? 'returned' : 'out'}
          onChange={(v) => setReturned(r, v === 'returned')} options={[['out', '대여 중'], ['returned', '반납 완료']]} />
        : (r.returned_on ? '반납 완료' : '대여 중')),
      filterValue: (r) => (r.returned_on ? '반납 완료' : '대여 중'),
    };
    if (k === 'item_type') return { key: k, header: label(k) }; // 이 표 자체가 그 구분으로 걸러져 있어 늘 같은 값 — 고칠 수 없다
    if (k === 'borrower_grade') return { key: k, header: '학년', className: 'num', render: (r) => `${r.borrower_grade}학년` };
    if (k === 'borrower_class_no') return { key: k, header: '반', className: 'num', render: (r) => `${r.borrower_class_no}반` };
    if (k === 'borrower_number') return { key: k, header: '번호', className: 'num' };
    return {
      key: k, header: label(k), className: k.endsWith('_on') ? 'num' : undefined,
      editable: k !== 'borrower_name' || mode !== 'student', // 학생 대여의 이름은 학번에서 가져온 값이라 여기선 못 고친다
      editField: k === 'checked_by_name' ? 'checked_by_staff_id' : undefined,
    };
  });

  const filter = (r) => r.item_type === itemType
    && (!mode || (mode === 'student' ? !!r.borrower_student_id : !r.borrower_student_id));

  return (
    <>
      {savedMsg && <div className="badge-info" role="status"><Ic.Check width="16" height="16" />{savedMsg}</div>}
      {error && <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{error}</div>}
      <DataTable bandless columns={cols} rows={q.data} loading={q.loading} error={q.error} filter={filter}
        searchKeys={['borrower_name', 'manufacturer', 'model', 'item_name', 'checked_by_name']}
        searchPlaceholder="예: 장원영" showCount={false} classSearch={mode === 'student' ? RENTAL_CLASS_FIELDS : undefined}
        emptyText={`${itemType} 대여 기록이 없습니다.`}
        table="rentals" reload={q.reload} sheetTab={sheetTab}
        crud={{}} /> {/* 새 기록은 대여하기, 반납은 반납하기로 한다. 이 표는 버튼 없는 읽기 전용(crud={{}}) — 고칠 일이 있으면 시트에서 */}
    </>
  );
}

/**
 * "대여하기" 버튼(홈 화면, 대여 메뉴 맨 위 카드)이 들어오는 빠른 등록 화면. 교직원/학생을 먼저 고르면 완전히 다른 폼이 뜬다
 * (교직원: 성함/대여물품/대여날짜/비고, 학생: 학년·반·번호·이름/대여물품/대여날짜). 두 폼 모두 드롭다운 값마다
 * "기타(직접 입력)"를 고르면 그 아래 입력칸이 뜬다. 저장 뒤에는 그 항목이 실제로 보이는 표로 이동한다.
 */
function RentalQuickNew() {
  const [branch, setBranch] = useState(''); // '' | 'staff' | 'student'
  return (
    <>
      <div className="mc-b">
        <h2 className="section-title">누가 빌리나요?</h2>
        <div className="mc-grid">
          <button type="button" aria-pressed={branch === 'staff'} className={`mc-tile${branch === 'staff' ? ' active' : ''}`} onClick={() => setBranch('staff')}><Ic.Users /><span>교직원</span></button>
          <button type="button" aria-pressed={branch === 'student'} className={`mc-tile${branch === 'student' ? ' active' : ''}`} onClick={() => setBranch('student')}><Ic.UserPlus /><span>학생</span></button>
        </div>
      </div>
      {branch === 'staff' && <StaffQuickForm onBack={() => setBranch('')} />}
      {branch === 'student' && <StudentQuickForm onBack={() => setBranch('')} />}
    </>
  );
}

// 학생 대여 목록의 학년·반·번호 검색(DataTable classSearch)이 읽는 열
const RENTAL_CLASS_FIELDS = { grade: 'borrower_grade', class_no: 'borrower_class_no', number: 'borrower_number' };
const OTHER = '__other__';
const QUICK_ITEMS = ['노트북', '태블릿'];
/** value 가 "기타"면 직접 입력한 값을, 아니면 고른 값을 그대로 돌려준다 */
const resolved = (value, otherValue) => (value === OTHER ? String(otherValue ?? '').trim() : value);
function destFor(itemType, mode) {
  if (itemType === '노트북') return '/rentals/laptop';
  return `/rentals/${itemType === '태블릿' ? 'tablet' : 'other'}/${mode}`;
}
const CONFIRMER_DEPT = '정보과학부';

/**
 * "반납하기" 버튼이 들어오는 반납 처리 화면. 이름으로, 또는 학년/반/번호로 아직 반납 안 된 대여를 찾고,
 * 찾은 건마다 확인자(정보과학부만)를 골라 저장하면 그 건이 반납 처리되고 실제로 보이는 표로 이동한다.
 */
function RentalReturnSearch() {
  const rentalsQ = useQuery(api.rentals);
  const staffQ = useQuery(api.staff);
  const studentsQ = useQuery(api.students);
  const navigate = useNavigate();
  const [method, setMethod] = useState(''); // '' | 'name' | 'number'
  const [nameQuery, setNameQuery] = useState('');
  const [grade, setGrade] = useState(''); const [classNo, setClassNo] = useState(''); const [number, setNumber] = useState('');
  const [results, setResults] = useState(null); // null = 아직 검색 안 함
  const [confirmerByRow, setConfirmerByRow] = useState({});
  const [returnedOnByRow, setReturnedOnByRow] = useState({});
  const [memoByRow, setMemoByRow] = useState({});
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  // 저장 버튼은 화면이 넉넉하면(≥1240px) 본문 오른쪽 바깥 여백에 둔다 — 표는 줄어들지 않고, 각 행 높이에 맞춰 세로 가운데. 좁은 화면에서는 표 마지막 칸.
  const wide = useMediaQuery(SIDE_RAIL_QUERY);
  const wrapRef = useRef(null);
  const tbodyRef = useRef(null);
  const [rowPos, setRowPos] = useState([]);
  useLayoutEffect(() => {
    const wrap = wrapRef.current; const body = tbodyRef.current;
    if (!wide || !wrap || !body) { setRowPos((p) => (p.length ? [] : p)); return undefined; }
    const measure = () => {
      const base = wrap.getBoundingClientRect().top;
      const next = [...body.rows].map((tr) => { const b = tr.getBoundingClientRect(); return { top: Math.round(b.top - base), h: Math.round(b.height) }; });
      setRowPos((p) => (JSON.stringify(p) === JSON.stringify(next) ? p : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(body); ro.observe(wrap);
    return () => ro.disconnect();
  }, [wide, results]);

  const open = (rentalsQ.data ?? []).filter((r) => !r.returned_on);
  const confirmers = (staffQ.data ?? []).filter((s) => s.department === CONFIRMER_DEPT);
  const students = studentsQ.data ?? [];
  const grades = [...new Set(students.map((s) => s.grade))].sort((a, b) => a - b);
  const classNos = [...new Set(students.map((s) => s.class_no))].sort((a, b) => a - b);
  const numbers = [...new Set(students.map((s) => s.number))].sort((a, b) => a - b);

  function searchByName(e) {
    e.preventDefault();
    const needle = nameQuery.trim().toLowerCase();
    setResults(needle ? open.filter((r) => (r.borrower_name ?? '').toLowerCase().includes(needle)) : []);
  }
  function searchByClass(e) {
    e.preventDefault();
    setResults(open.filter((r) =>
      (!grade || r.borrower_grade === Number(grade))
      && (!classNo || r.borrower_class_no === Number(classNo))
      && (!number || r.borrower_number === Number(number))));
  }

  async function save(row) {
    const confirmerName = confirmerByRow[row.id];
    if (!confirmerName) return;
    const returnedOn = returnedOnByRow[row.id] ?? today();
    const memo = memoByRow[row.id] ?? row.memo ?? '';
    setBusyId(row.id); setError('');
    try {
      await api.updateCell('rentals', row.id, 'checked_by_staff_id', confirmerName);
      await api.updateCell('rentals', row.id, 'memo', memo);
      await api.returnRental(row.id, returnedOn);
      const mode = row.borrower_student_id ? 'student' : 'staff';
      navigate(destFor(row.item_type, mode), { state: { savedMsg: `${row.borrower_name} 님의 ${row.item_type} 반납이 저장되었습니다.` } });
    } catch (err) { setError(err.message); setBusyId(''); }
  }

  const saveBtn = (r) => (
    <SaveButton type="button" size="sm" className="half" busyLabel="" busy={busyId === r.id} disabled={!confirmerByRow[r.id]} onClick={() => save(r)} aria-label={`${r.borrower_name} 반납 저장`} />
  );

  return (
    <>
    <div className="card fade">
      <h2 className="section-title">검색하기</h2>
      <div className="mc-grid" style={{ marginBottom: method ? 16 : 0 }}>
        <button type="button" aria-pressed={method === 'name'} className={`mc-tile${method === 'name' ? ' active' : ''}`} onClick={() => setMethod('name')}><Ic.Search /><span>이름으로 검색</span></button>
        <button type="button" aria-pressed={method === 'number'} className={`mc-tile${method === 'number' ? ' active' : ''}`} onClick={() => setMethod('number')}><Ic.IdCard /><span>학번으로 검색</span></button>
      </div>

      {method === 'name' && (
        <form onSubmit={searchByName} style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="field" style={{ maxWidth: 260 }}>
            <label htmlFor="f-return-name">이름</label>
            <AutoGrowText id="f-return-name" className="field-input" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} placeholder="예: 장원영" autoComplete="off" />
          </div>
          <button type="submit" className="btn btn-secondary">검색</button>
        </form>
      )}
      {method === 'number' && (
        <form onSubmit={searchByClass} style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="field" style={{ width: 110 }}>
            <label htmlFor="f-return-grade">학년</label>
            <select id="f-return-grade" className="field-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">전체</option>
              {grades.map((g) => <option key={g} value={g}>{g}학년</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 110 }}>
            <label htmlFor="f-return-class">반</label>
            <select id="f-return-class" className="field-input" value={classNo} onChange={(e) => setClassNo(e.target.value)}>
              <option value="">전체</option>
              {classNos.map((c) => <option key={c} value={c}>{c}반</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 110 }}>
            <label htmlFor="f-return-number">번호</label>
            <select id="f-return-number" className="field-input" value={number} onChange={(e) => setNumber(e.target.value)}>
              <option value="">전체</option>
              {numbers.map((n) => <option key={n} value={n}>{n}번</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">검색</button>
        </form>
      )}

      {error && <div className="badge-error" role="alert" style={{ marginTop: 16 }}><Ic.Alert width="16" height="16" />{error}</div>}
    </div>

    {results && results.length === 0 && (
      <p className="muted small">검색 결과가 없습니다. 이미 반납되었거나 대여 기록이 없습니다.</p>
    )}
    {results && results.length > 0 && (
      <div className={`ret-wrap${wide ? ' out' : ''}`} ref={wrapRef}>
        <div className="card tight">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  {(wide ? RETURN_RESULT_HEADS.slice(0, -1) : RETURN_RESULT_HEADS).map((h, i) => (
                    <th key={h} scope="col" style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--purple-dark)', borderLeft: i > 0 ? '1px solid var(--border)' : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="num" style={tdStyle(0)}>{r.borrower_grade ? `${r.borrower_grade}학년` : '—'}</td>
                    <td className="num" style={tdStyle(1)}>{r.borrower_class_no ? `${r.borrower_class_no}반` : '—'}</td>
                    <td className="num" style={tdStyle(1)}>{r.borrower_number ?? '—'}</td>
                    <td style={tdStyle(1)}>{r.borrower_name}</td>
                    <td style={tdStyle(1)}>{r.item_name || r.item_type}</td>
                    <td className="num" style={tdStyle(1)}>{r.rented_on}</td>
                    <td className="num" style={tdStyle(1)}>
                      <DatePicker aria-label="반납 날짜" value={returnedOnByRow[r.id] ?? today()}
                        disabled={busyId === r.id} onChange={(e) => setReturnedOnByRow({ ...returnedOnByRow, [r.id]: e.target.value })} />
                    </td>
                    <td style={tdStyle(1)}>
                      <select className="field-input" aria-label="확인자" value={confirmerByRow[r.id] ?? ''}
                        disabled={busyId === r.id} onChange={(e) => setConfirmerByRow({ ...confirmerByRow, [r.id]: e.target.value })}>
                        <option value="" disabled>선택</option>
                        {confirmers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle(1)}>
                      <AutoGrowText className="field-input" aria-label="비고" value={memoByRow[r.id] ?? r.memo ?? ''}
                        disabled={busyId === r.id} onChange={(e) => setMemoByRow({ ...memoByRow, [r.id]: e.target.value })} />
                    </td>
                    {!wide && <td style={tdStyle(1)}>{saveBtn(r)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {wide && (
          <div className="ret-save">
            {results.map((r, i) => rowPos[i] && <div key={r.id} className="ret-save-row" style={{ top: rowPos[i].top, height: rowPos[i].h }}>{saveBtn(r)}</div>)}
          </div>
        )}
      </div>
    )}
    </>
  );
}
const RETURN_RESULT_HEADS = ['학년', '반', '번호', '이름', '대여 물품', '대여 날짜', '반납 날짜', '확인자', '비고', ''];
const tdStyle = (i) => ({ padding: '10px 14px', borderTop: '1px solid var(--border)', borderLeft: i > 0 ? '1px solid var(--border)' : undefined });

/** 드롭다운 + "기타(직접 입력)" 고르면 뜨는 입력칸. */
function PickOrOther({ id, label, options, value, otherValue, onChange, onOtherChange, otherPlaceholder = '직접 입력', required }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="field-input" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="" disabled>선택</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value={OTHER}>기타(직접 입력)</option>
      </select>
      {value === OTHER && (
        <AutoGrowText className="field-input" style={{ marginTop: 6 }} value={otherValue ?? ''} onChange={(e) => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder} autoComplete="off" required={required} />
      )}
    </div>
  );
}

function QuickFormShell({ title, onBack, onSubmit, busy, error, children }) {
  return (
    <form className="card fade" onSubmit={onSubmit}>
      <h2 className="section-title">{title}</h2>
      <div className="form-stack">{children}</div>
      {error && <div className="badge-error" role="alert" style={{ marginTop: 12 }}><Ic.Alert width="16" height="16" />{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <SaveButton busy={busy} />
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={busy}>뒤로</button>
      </div>
    </form>
  );
}

function StaffQuickForm({ onBack }) {
  const staff = useQuery(api.staff);
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [nameOther, setNameOther] = useState('');
  const [item, setItem] = useState(''); const [itemOther, setItemOther] = useState('');
  const [rentedOn, setRentedOn] = useState(today());
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const names = [...new Set((staff.data ?? []).map((s) => s.name))].sort((a, b) => a.localeCompare(b, 'ko'));

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const isCustomItem = item === OTHER;
    const itemType = isCustomItem ? '기타' : resolved(item, itemOther);
    try {
      const row = await api.addRental({
        item_type: itemType, item_name: isCustomItem ? resolved(item, itemOther) : undefined,
        borrower_name: resolved(name, nameOther), rented_on: rentedOn, memo,
      });
      navigate(destFor(row.item_type, 'staff'), { state: { savedMsg: `${row.borrower_name} 님의 ${row.item_type} 대여가 저장되었습니다.` } });
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <QuickFormShell title="교직원 대여 작성" onBack={onBack} onSubmit={submit} busy={busy} error={error}>
      <PickOrOther id="f-staff-name" label="성함" options={names} value={name} otherValue={nameOther}
        onChange={setName} onOtherChange={setNameOther} otherPlaceholder="예: 홍길동" required />
      <PickOrOther id="f-staff-item" label="대여물품" options={QUICK_ITEMS} value={item} otherValue={itemOther}
        onChange={setItem} onOtherChange={setItemOther} otherPlaceholder="예: 빔프로젝터" required />
      <div className="field">
        <label htmlFor="f-staff-date">대여 날짜</label>
        <DatePicker id="f-staff-date" value={rentedOn} onChange={(e) => setRentedOn(e.target.value)} required />
      </div>
      <div className="field full">
        <label htmlFor="f-staff-memo">비고</label>
        <AutoGrowText id="f-staff-memo" className="field-input" value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>
    </QuickFormShell>
  );
}

function StudentQuickForm({ onBack }) {
  const studentsQ = useQuery(api.students);
  const navigate = useNavigate();
  const students = studentsQ.data ?? [];
  const grades = [...new Set(students.map((s) => s.grade))].sort((a, b) => a - b);
  const classNos = [...new Set(students.map((s) => s.class_no))].sort((a, b) => a - b);
  const numbers = [...new Set(students.map((s) => s.number))].sort((a, b) => a - b);
  const names = [...new Set(students.map((s) => s.name))].sort((a, b) => a.localeCompare(b, 'ko'));

  const [grade, setGrade] = useState(''); const [gradeOther, setGradeOther] = useState('');
  const [classNo, setClassNo] = useState(''); const [classNoOther, setClassNoOther] = useState('');
  const [number, setNumber] = useState(''); const [numberOther, setNumberOther] = useState('');
  const [name, setName] = useState(''); const [nameOther, setNameOther] = useState('');
  const [item, setItem] = useState('태블릿'); const [itemOther, setItemOther] = useState('');
  const [rentedOn, setRentedOn] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const isCustomItem = item === OTHER;
    const itemType = isCustomItem ? '기타' : resolved(item, itemOther);
    const g = Number(resolved(grade, gradeOther)), c = Number(resolved(classNo, classNoOther)), n = Number(resolved(number, numberOther));
    const canComposeNo = grade !== OTHER && classNo !== OTHER && number !== OTHER && [g, c, n].every((v) => Number.isInteger(v) && v > 0);
    const payload = { item_type: itemType, item_name: isCustomItem ? resolved(item, itemOther) : undefined, rented_on: rentedOn };
    if (canComposeNo) payload.borrower_student_no = `${g}${String(c).padStart(2, '0')}${String(n).padStart(2, '0')}`;
    else payload.borrower_name = resolved(name, nameOther);
    try {
      const row = await api.addRental(payload);
      navigate(destFor(row.item_type, 'student'), { state: { savedMsg: `${row.borrower_name} 님의 ${row.item_type} 대여가 저장되었습니다.` } });
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <QuickFormShell title="학생 대여 작성" onBack={onBack} onSubmit={submit} busy={busy} error={error}>
      <PickOrOther id="f-stu-grade" label="학년" options={grades.map(String)} value={grade} otherValue={gradeOther}
        onChange={setGrade} onOtherChange={setGradeOther} otherPlaceholder="예: 1" required />
      <PickOrOther id="f-stu-class" label="반" options={classNos.map(String)} value={classNo} otherValue={classNoOther}
        onChange={setClassNo} onOtherChange={setClassNoOther} otherPlaceholder="예: 5" required />
      <PickOrOther id="f-stu-number" label="번호" options={numbers.map(String)} value={number} otherValue={numberOther}
        onChange={setNumber} onOtherChange={setNumberOther} otherPlaceholder="예: 12" required />
      <PickOrOther id="f-stu-name" label="이름" options={names} value={name} otherValue={nameOther}
        onChange={setName} onOtherChange={setNameOther} otherPlaceholder="예: 홍길동" required />
      <PickOrOther id="f-stu-item" label="대여물품" options={QUICK_ITEMS} value={item} otherValue={itemOther}
        onChange={setItem} onOtherChange={setItemOther} otherPlaceholder="예: 계산기" required />
      <div className="field">
        <label htmlFor="f-stu-date">대여 날짜</label>
        <DatePicker id="f-stu-date" value={rentedOn} onChange={(e) => setRentedOn(e.target.value)} required />
      </div>
    </QuickFormShell>
  );
}

export { SheetButton };
