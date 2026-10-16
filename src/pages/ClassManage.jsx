import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import { TV_BRANDS } from '../../shared/sheet-schema.js';
import PageHeader, { TabCard, LinkButton } from '../components/PageHeader.jsx';
import DataTable, { GradePills, EditSelectCell, ChipToggle } from '../components/DataTable.jsx';
import { datedColumn as dated } from '../components/DatedMemo.jsx';
import * as Ic from '../components/Icons.jsx';

const TABS = [
  { to: '/manage/class/cyber', label: '반별 담임 & 사이버지킴이', icon: Ic.Shield },
  { to: '/manage/class/tv', label: '반별 TV 브랜드', icon: Ic.Tv },
  { to: '/manage/class/cabinets', label: '반별 태블릿 & 태블릿 충전함', icon: Ic.BatteryCharging },
];

/** 반별 TV·태블릿 충전함·사이버지킴이 화면이 공용으로 쓰는 "함께 볼 데이터"(담임은 교직원 검색에서, 위치·내선은 그 담임의 값) */
const CLASS_EXTRA = [
  { key: 'homeroom', header: '담임' },
  { key: 'homeroom_location', header: '담임 위치' },
  { key: 'homeroom_extension', header: '내선 연락망' },
];

export default function ClassManage() {
  return (
    <>
      <PageHeader title="반별 관리" />
      <TabCard items={TABS}>
        <Routes>
          <Route index element={<Navigate to="cyber" replace />} />
          <Route path="tv" element={<Tv />} />
          <Route path="cyber" element={<Cyber />} />
          <Route path="cabinets" element={<Cabinets />} />
          <Route path="as" element={<Navigate to="/as/class" replace />} />
        </Routes>
      </TabCard>
    </>
  );
}

const G = { key: 'grade', header: '학년', className: 'num', render: (r) => `${r.grade}학년` };
const C = { key: 'class_no', header: '반', className: 'num', render: (r) => `${r.class_no}반` };

/**
 * 학년 필터 + 학년·반 검색이 붙은 표. table 을 주면 셀 편집이 켜진다(devices 화면도 같이 쓴다).
 * noGradeFilter 면 학년 알약·건수를 아예 안 그린다(반별 관리 3화면 전용) — grade 는 항상 0(전체)로 남아
 * 학년 필터링 자체가 없어질 뿐, "학년" 머리글을 눌러 거르거나 검색창에 학년을 적는 건 여전히 된다.
 */
function ClassTable({ query, columns, sheet, sheetInSearchRow = false, text, searchKeys = [], filter, table, noGradeFilter = false, toolbar, tableTop, crud, showCount }) {
  const q = useQuery(query);
  const [grade, setGrade] = useState(0);
  const rows = (q.data ?? []).map((r) => ({ ...r, _cls: `${r.grade}학년${r.class_no}반 ${r.grade}-${r.class_no}` }));
  const cols = typeof columns === 'function' ? columns(q.reload) : columns;
  const top = tableTop ?? (noGradeFilter ? undefined : <GradePills value={grade} onChange={setGrade} />); // 표 위 띠(함께 볼 정보 칩 또는 학년 알약). 있으면 시트에서 열기도 그 띠 오른쪽에
  return (
    <>
      {(text || (sheet && !sheetInSearchRow)) && (
        <div className="page-head">{text && <p className="muted small">{text}</p>}{sheet && !sheetInSearchRow && <LinkButton linkKey={`sheet:${sheet}`} label="시트에서 열기" />}</div>
      )}
      <DataTable columns={cols} rows={rows} loading={q.loading} error={q.error}
        filter={(r) => (grade === 0 || r.grade === grade) && (!filter || filter(r))}
        searchKeys={['_cls', 'homeroom', ...searchKeys]} classSearch searchPlaceholder="예: 2-5, 이름"
        toolbar={toolbar} tableTop={top} showCount={showCount ?? !noGradeFilter}
        table={table} reload={q.reload} sheetTab={sheetInSearchRow ? sheet : undefined} sheetInTop={!!top} crud={crud} />
    </>
  );
}

/** 충전함 표의 "모델" 드롭다운: 태블릿 충전함 묶음(보유_태블릿보관함 탭) 목록 */
export const cabinetBatchOptions = (batches) => [['', '(모델 미지정)'], ...batches.map((b) => [b.id, `${[b.manufacturer, b.model].filter(Boolean).join(' ') || b.id}${b.capacity ? ` · ${b.capacity}대용` : ''}${b.purchase_date ? ` · ${String(b.purchase_date).slice(0, 7)}` : ''}`])];
/** 추가 폼/삭제 확인에서 학급을 부르는 말. 새로 추가한 행(아직 조회 전)은 입력한 "학년-반" 글자를 그대로 쓴다. */
const classLabel = (r) => (r.grade ? `${r.grade}학년 ${r.class_no}반` : String(r.classroom_id ?? ''));
/** 반별 태블릿 보관함 추가 폼의 칸 — 반별 관리 화면과 전자기기 → 반별 태블릿 보관함 화면이 같이 쓴다. */
const CABINET_FIELDS = [
  { key: 'classroom_id', header: '학년-반', required: true, hint: '예: 2-5' },
  { key: 'location', header: '위치' },
  { key: 'tablet_count', header: '태블릿 수량', hint: '비우면 0' },
  { key: 'password', header: '비번' },
];

function Tv() {
  const [on, setOn] = useState({});
  return (
    <ClassTable query={api.classroomTvs} sheet="반별TV" sheetInSearchRow table="classroom_tvs" noGradeFilter
      tableTop={<ChipToggle options={CLASS_EXTRA} on={on} onChange={setOn} />}
      crud={{ add: true, edit: true, remove: true, rowLabel: (r) => `${classLabel(r)} TV`, addTitle: '반별 TV 추가',
        fields: [{ key: 'classroom_id', header: '학년-반', required: true, hint: '예: 2-5' },
          { key: 'brand', header: 'TV브랜드', options: TV_BRANDS }, { key: 'location', header: '위치', hint: '비우면 학급 위치' }] }}
      columns={(reload) => [
        { key: 'location', header: '위치', editable: true },
        G, C,
        {
          key: 'brand', header: 'TV브랜드',
          render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="brand" ariaLabel="TV브랜드" options={TV_BRANDS.map((b) => [b, b])} />,
        },
        dated('memo', '비고'),
        ...CLASS_EXTRA.filter((c) => on[c.key]),
      ]}
      searchKeys={['brand', 'location', 'memo']} />
  );
}
function Cyber() {
  const [on, setOn] = useState({});
  const extra = CLASS_EXTRA.filter((c) => c.key !== 'homeroom'); // 담임 성함은 이미 고정 열이라 "함께 볼 데이터"에선 위치·내선만
  return (
    <ClassTable query={api.classHomerooms} sheet="사이버지킴이" sheetInSearchRow table="cyber_guardians" noGradeFilter
      tableTop={<ChipToggle options={extra} on={on} onChange={setOn} />}
      crud={{ add: true, edit: true, remove: true, canRemove: (r) => r.has_guardian,
        rowLabel: (r) => `${classLabel(r)} 사이버지킴이${r.name ? ` ${r.name}` : ''}`, addTitle: '사이버 지킴이 추가',
        confirmDelete: (r) => `'${classLabel(r)} 사이버지킴이${r.name ? ` ${r.name}` : ''}' 지정을 지울까요?\n- 시트 원본(사이버지킴이 탭)에서도 이 줄이 지워집니다.\n- 학급과 학생 자체는 그대로 남습니다.\n되돌릴 수 없습니다.`,
        fields: [{ key: 'classroom_id', header: '학년-반', required: true, hint: '예: 2-5' }, { key: 'student_id', header: '학번', required: true, hint: '학년+반 2자리+번호 2자리, 예: 21011' }] }}
      columns={[G, C, { key: 'homeroom', header: '담임', render: (r) => r.homeroom || '(미지정)' },
        { key: 'student_no', header: '사이버 지킴이 학번', className: 'mono', editable: true, editField: 'student_id', canEdit: (r) => r.has_guardian },
        { key: 'name', header: '사이버 지킴이 이름' },
        ...extra.filter((c) => on[c.key]),
      ]}
      searchKeys={['homeroom', 'name', 'student_no']} />
  );
}
/** 반별 태블릿 충전함. 반별 관리와 전자기기 → 태블릿 충전함 → 학급별이 같은 데이터를 쓴다. withBatch: 모델(묶음)·분류번호 열을 보인다. */
export function Cabinets({ withBatch = false }) {
  const [on, setOn] = useState({});
  const batches = useQuery(api.devices).data?.filter((b) => b.item_category === '태블릿보관함') ?? [];
  const batchCols = withBatch ? [
    { key: 'batch_id', header: '모델', render: (r, ctx) => <EditSelectCell ctx={ctx} row={r} field="batch_id" ariaLabel="모델(묶음)" options={cabinetBatchOptions(batches)} />, filterValue: (r) => `${r.manufacturer} ${r.model}` },
    { key: 'serial_no', header: '분류번호', className: 'mono', editable: true },
  ] : [];
  return (
    <ClassTable query={api.tabletCabinets} sheet="태블릿보관함" sheetInSearchRow filter={(r) => !r.is_spare} table="tablet_cabinets" noGradeFilter
      tableTop={<ChipToggle options={CLASS_EXTRA} on={on} onChange={setOn} />}
      crud={{ add: true, edit: true, remove: true, required: ['classroom_id'], fields: CABINET_FIELDS, addTitle: '반별 태블릿 보관함 추가',
        rowLabel: (r) => `${classLabel(r)} 태블릿 보관함` }}
      columns={[{ key: 'location', header: '위치', editable: true }, G, C, ...batchCols,
        { key: 'tablet_count', header: '태블릿 수량', className: 'num', render: (r) => `${r.tablet_count}대`, editable: true },
        { key: 'password', header: '비번', className: 'mono', editable: true },
        dated('memo', '비고'),
        ...CLASS_EXTRA.filter((c) => on[c.key]),
      ]}
      searchKeys={['location', 'password', 'memo', 'model', 'manufacturer', 'serial_no']} />
  );
}

/* ---------- 반별 A/S: 학급마다 HDMI·LAN 고장·수리 기록. 학급 목록은 시트 "반별AS" 탭, HDMI·LAN·비고 기록은 "AS기록" 탭(날짜 태그 칸). A/S 메뉴에서 쓴다. ---------- */
export function ClassAs() {
  const [on, setOn] = useState({});
  return (
    <ClassTable query={api.classroomAs} sheet="반별AS" sheetInSearchRow table="classroom_as" noGradeFilter
      tableTop={<ChipToggle options={CLASS_EXTRA} on={on} onChange={setOn} />}
      crud={{ add: true, edit: true, remove: true, required: ['classroom_id'], rowLabel: (r) => `${classLabel(r)} A/S`, addTitle: '반별 A/S 추가',
        fields: [{ key: 'classroom_id', header: '학년-반', required: true, hint: '예: 2-5' }, { key: 'location', header: '위치', hint: '비우면 학급 위치' }] }}
      columns={[G, C, { key: 'location', header: '위치', editable: true }, dated('hdmi', 'HDMI'), dated('lan', 'LAN'), dated('memo', '비고'), ...CLASS_EXTRA.filter((c) => on[c.key])]}
      searchKeys={['location', 'hdmi', 'lan', 'memo']} />
  );
}
