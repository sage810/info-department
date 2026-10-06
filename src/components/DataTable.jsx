import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as Ic from './Icons.jsx';
import { SheetButton, TabCrumb } from './PageHeader.jsx';
import AutoGrowText from './AutoGrowText.jsx';
import SaveButton from './SaveButton.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { setUnsaved, clearUnsaved } from '../lib/unsaved.js';
import { useMediaQuery, SIDE_RAIL_QUERY } from '../lib/useMediaQuery.js';
import { parseClassQuery, classQueryMatch } from '../lib/classQuery.js';
import { api } from '../lib/data.js';
import { findEditableColumn } from '../../shared/sheet-schema.js';
import HeaderFilter, { ALL, cellText } from './table/HeaderFilter.jsx';
import { EditableCell } from './table/cells.jsx';
import AddRowForm from './table/AddRowForm.jsx';

export { SelectCell, SelectOrTextCell, EditSelectCell } from './table/cells.jsx';
export { ChipToggle, GradePills } from './table/chips.jsx';

/**
 * 검색 + 머리글 클릭 드롭다운 필터 + 표.
 *  columns: [{ key, header, render?(row), className?, filterValue?(row), noFilter? }]
 *    - 값 목록은 filterValue → render 가 문자열이면 그 값 → 원본 순으로 정한다.
 *    - header 가 비었거나 noFilter 면 머리글을 눌러도 드롭다운이 뜨지 않는다(작업 버튼 열 등).
 *  searchKeys: 검색 대상 열(key 배열). 없으면 검색창 숨김.
 *  classSearch: 학년·반·번호 검색(true 면 행의 grade·class_no·number, 객체면 { grade, class_no, number } 열 이름). "1학년2반", "1학년 2반 3번",
 *    "1-2", "10203" 처럼 쓴 검색어는 글자 포함이 아니라 그 반·번호의 행만 찾는다(src/lib/classQuery.js). 그 모양이 아닌 검색어는 searchKeys 글자 검색.
 *  filter: (row) => boolean  — 검색·필터보다 먼저 적용
 *  toolbar: 검색창 옆에 넣을 요소(필터 알약, 열 체크 등)
 *  sheetInTop: "시트에서 열기"를 도구줄이 아니라 표 바로 위 띠(.table-top)의 오른쪽 끝으로 옮긴다. tableTop 이 없으면 이 버튼만 있는 띠가 된다.
 *  editInTop: 추가·수정·삭제 버튼을 도구줄이 아니라 표 바로 위 띠의 왼쪽에 둔다(sheetInTop 이면 시트 버튼은 오른쪽 끝). 교직원 검색.
 *  tableTop: 표 카드 맨 위 띠에 넣을 요소("함께 볼 정보" ChipToggle). 도구줄이 아니라 표의 일부라 항상 머리글 바로 위에 붙는다.
 *  sheetTab: 주면 "시트에서 열기" 버튼을 검색창 바로 왼쪽에 붙여서(오른쪽 정렬) 보여준다.
 *  writeButton: 주면 그 버튼도 검색창 바로 왼쪽에(오른쪽 정렬) 붙인다 — 보통 `.mc-write-btn` 클래스를 쓴다.
 *  showCount: false 면 "N건" 텍스트를 숨긴다(기본 true).
 *  heading: 도구줄 카드 맨 위 제목 자리에 넣을 요소(주면 noCrumb 여도 도구줄이 카드로 그려진다). 개별 장비 카드의 제목 토글.
 *  folded / onFoldedChange / foldId: 접힘을 바깥에서 같이 다룰 때(제목 토글이 같은 표를 접게). 안 주면 표가 스스로 기억한다.
 *  foldable: 표 카드를 접고 펼칠 수 있다(기본 true). 위 띠 오른쪽 끝의 "표 접기/표 펼치기" 버튼과, 표 아래 화면 아래에 붙어 따라오는 "표 접기" 띠가 같은 일을 한다. 처음엔 펼쳐져 있다.
 *  bandless: 표 카드 맨 위의 빈 띠(.table-top — 접기 버튼 자리뿐일 때)를 그리지 않는다. 안에 넣을 것(tableTop·시트 열기·추가/수정/삭제)이 있으면 그대로 그린다.
 *    띠가 없으면 위 접기 버튼도 없어지고, 표 아래 "표 접기" 띠로만 접는다(접어 두면 다시 펼칠 버튼이 있어야 해서 접힌 동안만 띠를 그린다). bandGap(px) 을 주면 띠 대신 그만큼의 빈 여백만 둔다.
 *  noCrumb: TabCard 안에서 쓰더라도 위치 제목줄을 그리지 않는다(한 화면에 표가 둘일 때 두 번째 표).
 *
 *  필터는 한 번에 한 열만 걸 수 있다(fCol/fVal). 다른 열 머리글을 누르면 그 열로 바뀐다.
 *
 *  셀 편집: column.editable = true 인 열은 셀을 누르면 바로 고칠 수 있다. table(shared/sheet-schema.js 의
 *  표 이름)을 같이 줘야 하고, 열의 key 가 그 표의 진짜 열 이름과 다르면 column.editField 로 알려준다
 *  (예: 노트북 표의 "사용자" 열은 화면엔 user_name 으로 보이지만 실제로는 staff_id 를 고치는 것).
 *  column.editValue(row) / column.saveValue(row, 입력값) 를 주면 입력칸 값과 저장할 값을 바꿔 쓴다(DatedMemo 참고).
 *  column.schemaCol 을 주면 시트 정의 대신 그 모양으로 편집 칸을 만든다(시트 정의에 없는 칸 — 예: AS기록 탭에서 묶어 온 날짜 기록).
 *  column.canEdit(row) 가 있으면 그 행에서만 고칠 수 있다(예: 사이버 지킴이가 아직 없는 학급 행은 고칠 값이 없다).
 *  reload 를 주면 저장 성공 후 다시 불러와 화면을 새로 맞춘다(연결된 다른 열도 같이 바뀔 수 있어서).
 *
 *  crud: 주면 표가 "기본 읽기 전용" 이 되고, 검색창 왼쪽에 추가·수정·삭제 버튼이 생긴다(오른쪽 정렬).
 *    { add?, edit?, remove?: boolean, required?: string[] (추가 폼 필수 열 key), rowLabel?(row): string,
 *      confirmDelete?(row): string, canRemove?(row): boolean, fields?: [{ key, header?, options?, other?, hint?, required? }],
 *      defaults?: { 열key: 값 }, addTitle?: string }
 *    - 수정·삭제는 **저장 버튼으로 한꺼번에 저장**한다: 셀을 고치거나 삭제를 눌러도 바로 저장되지 않고 표에 모아 두었다가(바뀐 칸은 연보라, 삭제할 행은 흐리게),
 *      수정·삭제 안내 띠의 "저장"을 누르면 시트·DB 에 반영한다. 저장하지 않은 채 수정을 끝내거나 화면을 옮기거나 창을 닫으면 저장할지 묻는다(UnsavedGuard).
 *      열의 render(row, ctx) 의 ctx = { editing, stage, markEditing } — stage(row, 열이름, 값) 으로 같은 방식으로 모은다(드롭다운 열은 EditSelectCell).
 *      저장 버튼은 넓은 화면(1240px↑)에서 고치는 행의 오른쪽 바깥(.side-rail)에 생기고(표 크기는 안 변한다), 좁은 화면에서는 안내 띠의 저장을 쓴다.
 *    - 수정: 켜져 있는 동안만 editable 열의 셀을 누르면 고칠 수 있다(다시 누르면 끝). 열에 render 가 있으면 render(row, { editing })
 *      으로 지금 수정 중인지 알려 준다 — 눌러서 바꾸는 드롭다운 열은 editing 일 때만 그리고 아니면 글자로 보여 준다.
 *    - 추가: 도구줄 카드와 표 카드 사이에 추가 폼 카드가 펼쳐진다. 칸은 fields 로 정하고, 안 주면 editable 열에서 만든다. table 이 shared 의 CRUD_TABLES 에 있어야 한다.
 *    - 삭제: 켜져 있는 동안 행마다 삭제 버튼이 생기고(canRemove 가 false 인 행은 빠짐), 누르면 "삭제 취소"로 바뀌며 저장할 때 확인 뒤 지운다.
 *    crud 가 없으면 예전처럼 editable 열이 늘 눌러서 고쳐진다. crud={{}} (add·edit·remove 가 하나도 없음)면 버튼 없이 **읽기 전용** 표다.
 */
export default function DataTable({
  columns, rows, loading, error, searchKeys, searchPlaceholder = '검색', filter, toolbar, tableTop,
  emptyText = '데이터가 없습니다.', rowKey = 'id', footer, table, reload, wideSearch = false,
  sheetTab, sheetInTop = false, editInTop = false, foldable = true, heading, foldId: foldIdProp, folded: foldedProp, onFoldedChange, showCount = true, writeButton, crud, noCrumb = false, bandless = false, bandGap = 0, classSearch,
}) {
  const [q, setQ] = useState('');
  const searchId = useId();
  // crud 모드: null | 'add' | 'edit' | 'delete' (한 번에 하나)
  const [mode, setMode] = useState(null);
  const [crudMsg, setCrudMsg] = useState({ kind: '', text: '' });
  // 같은 화면 틀을 쓰는 다른 카테고리로 옮기면(예: 구독 → 기타 에듀테크) 열려 있던 추가 폼·수정·삭제 모드를 닫는다. 저장 여부는 UnsavedGuard 가 이미 물었다.
  const { pathname } = useLocation();
  useEffect(() => { setMode(null); setCrudMsg({ kind: '', text: '' }); }, [pathname]);
  const [saving, setSaving] = useState(false);
  const [foldedState, setFoldedState] = useState(false); // 표 접힘(처음엔 펼침)
  const folded = foldedProp ?? foldedState;
  const setFolded = (v) => { if (foldedProp === undefined) setFoldedState(v); onFoldedChange?.(v); };
  const autoFoldId = useId();
  const foldId = foldIdProp ?? autoFoldId;
  const cardRef = useRef(null);
  // 아직 저장하지 않은 셀 수정(crud 가 있는 표만). 저장 버튼이 눌린 순간의 값을 바로 읽을 수 있게 ref 에도 같이 둔다.
  const [drafts, setDraftsState] = useState({});       // { 행id: { 열이름: { value, key } } }
  const draftsRef = useRef({});
  const setDrafts = (v) => { draftsRef.current = v; setDraftsState(v); };
  const [removals, setRemovalsState] = useState({});   // { 행id: true } — 저장하면 지울 행
  const removalsRef = useRef({});
  const setRemovals = (v) => { removalsRef.current = v; setRemovalsState(v); };
  const [editingRow, setEditingRow] = useState(null);  // 지금 칸을 고치는 중인 행 id (그 행 옆에 저장 버튼이 생긴다)
  const openCommit = useRef(null);                     // 열려 있는 입력칸의 "값 모으기" 함수
  const [dlg, setDlg] = useState(null);                // 앱 안 확인 창: { title, body, actions, cancelValue, resolve }
  const side = useMediaQuery(SIDE_RAIL_QUERY);         // 넓은 화면: 접기·저장 버튼을 표 오른쪽 바깥(.side-rail)에 둔다
  const railRef = useRef(null);
  const [pos, setPos] = useState({ band: null, rows: {} });
  const rowsById = useMemo(() => Object.fromEntries((rows ?? []).map((r) => [r[rowKey], r])), [rows, rowKey]);
  const rowStaged = crud ? Object.values(drafts).reduce((n, x) => n + Object.keys(x).length, 0) + Object.keys(removals).length : 0;
  const staged = rowStaged;
  const editingOn = !crud || mode === 'edit';
  const showDelete = !!crud?.remove && mode === 'delete';
  const delCol = showDelete && !side; // 좁은 화면에서만 표 안 맨 끝 열에 삭제 버튼(넓은 화면은 사이드)
  const flash = (kind, text) => { setCrudMsg({ kind, text }); if (kind === 'ok') setTimeout(() => setCrudMsg((c) => (c.text === text ? { kind: '', text: '' } : c)), 4000); };
  const labelOf = (r) => (crud?.rowLabel ? crud.rowLabel(r) : String(r[columns[0]?.key] ?? ''));
  const ask = (cfg) => new Promise((resolve) => setDlg({ ...cfg, resolve }));
  const answer = (v) => { dlg?.resolve(v); setDlg(null); };

  // 셀 수정은 바로 저장하지 않고 모아 둔다. 값이 원래대로 돌아오면 모음에서 뺀다. key = 화면에 보이는 열 key(보통 field 와 같다).
  function stage(row, field, value, key = field) {
    const id = row[rowKey];
    const same = String(value ?? '').trim() === String(rowsById[id]?.[key] ?? '').trim();
    const cur = draftsRef.current;
    const mine = { ...(cur[id] ?? {}) };
    if (same) delete mine[field]; else mine[field] = { value, key };
    const next = { ...cur };
    if (Object.keys(mine).length) next[id] = mine; else delete next[id];
    setDrafts(next);
  }
  const markEditing = (id, open) => setEditingRow((cur) => (open ? id : (cur === id ? null : cur)));
  const ctx = { editing: editingOn, stage, markEditing: (row, open) => markEditing(row[rowKey], open) }; // 열의 render(row, ctx) 로 넘긴다 — 눌러서 바꾸는 드롭다운 열은 수정 중일 때만 그리고, 고르면 stage 로 모은다
  function toggleFold(fromBottom) {
    setFolded(!folded);
    if (fromBottom) requestAnimationFrame(() => cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); // 아래 띠로 접으면 카드 위가 화면에 오도록
  }
  const view = (r) => { const x = drafts[r[rowKey]]; return x ? { ...r, ...Object.fromEntries(Object.values(x).map((v) => [v.key, v.value])) } : r; };
  const toggleRemove = (r) => { const n = { ...removalsRef.current }; if (n[r[rowKey]]) delete n[r[rowKey]]; else n[r[rowKey]] = true; setRemovals(n); };
  const discardAll = () => { setDrafts({}); setRemovals({}); setCrudMsg({ kind: '', text: '' }); };

  /** 모아 둔 수정·삭제를 저장한다. ids 를 주면 그 행들만(행 옆 저장 버튼), 안 주면 전부. 삭제가 있으면 먼저 확인. 전부 성공하면 true. */
  async function saveRows(ids) {
    openCommit.current?.(); // 값을 적던 칸이 열려 있으면 그 값부터 모은다
    if (saving) return false;
    const dr = draftsRef.current, rm = removalsRef.current;
    const inScope = (id) => !ids || ids.includes(id);
    const delIds = Object.keys(rm).filter(inScope);
    const editIds = Object.keys(dr).filter((id) => inScope(id) && !rm[id]); // 지울 행의 수정은 저장할 필요가 없다
    if (!delIds.length && !editIds.length) return true;
    const delRows = (rows ?? []).filter((r) => delIds.includes(r[rowKey]));
    if (delRows.length) {
      const msgs = delRows.map((r) => (crud.confirmDelete ? crud.confirmDelete(r) : `'${labelOf(r)}' 행을 삭제할까요? 시트 원본에서도 지워지고 되돌릴 수 없습니다.`));
      const ok = await ask({ title: `${delRows.length}건을 삭제할까요?`, body: msgs.join('\n\n'), cancelValue: false,
        actions: [{ label: '삭제', variant: 'danger', value: true }, { label: '취소', value: false }] });
      if (!ok) return false;
    }
    setSaving(true); setCrudMsg({ kind: '', text: '' });
    const errs = []; let done = 0;
    const left = { ...dr }, leftDel = { ...rm };
    for (const id of editIds) {
      for (const [field, v] of Object.entries(dr[id])) {
        try { await api.updateCell(table, id, field, v.value); done++; delete left[id]?.[field]; }
        catch (e) { errs.push(`${labelOf(rowsById[id] ?? { id })}: ${e.message}`); }
      }
      if (left[id] && !Object.keys(left[id]).length) delete left[id];
    }
    for (const id of delIds) {
      const r = rowsById[id];
      try { await api.deleteRow(table, id); done++; delete leftDel[id]; }
      catch (e) { errs.push(`${r ? labelOf(r) : id}: ${e.message}`); }
    }
    for (const id of delIds) if (!leftDel[id]) delete left[id]; // 지운 행에 남은 수정 표시도 같이 치운다
    setDrafts(left); setRemovals(leftDel); setSaving(false);
    reload?.();
    if (errs.length) flash('err', errs.join(' / ')); else flash('ok', `${done}건을 저장했습니다.`);
    return errs.length === 0;
  }

  /** 저장하지 않은 것을 전부 저장(화면을 옮기기 전 확인 창의 "저장"). */
  async function saveEverything() {
    return saveRows();
  }
  const saveAll = saveEverything;

  // 수정·삭제 모드를 끝낼 때(또는 추가로 바꿀 때) 저장하지 않은 것이 있으면 묻는다. 수정 ↔ 삭제로 바꾸는 건 변경을 그대로 둔다.
  async function pickMode(m) {
    const next = mode === m ? null : m;
    const dropsRows = rowStaged > 0 && next !== 'edit' && next !== 'delete';
    if (dropsRows) {
      const choice = await ask({ title: '저장하지 않은 변경이 있습니다', body: `${staged}건의 변경이 아직 저장되지 않았습니다.\n저장하지 않고 닫으면 이 변경은 사라집니다.`, cancelValue: 'stay',
        actions: [{ label: '저장', variant: 'primary', value: 'save' }, { label: '저장하지 않고 닫기', variant: 'danger', value: 'discard' }, { label: '계속 편집', value: 'stay' }] });
      if (choice === 'stay') return;
      if (choice === 'save') { if (!(await saveEverything())) return; } else discardAll();
    }
    setMode(next); setCrudMsg({ kind: '', text: '' });
  }

  // 화면을 옮기거나 창을 닫기 전에 UnsavedGuard 가 이 표의 변경을 알 수 있도록 올려 둔다.
  const uid = useId();
  const saveRef = useRef(null);
  const discardRef = useRef(null);
  saveRef.current = saveEverything;
  discardRef.current = discardAll;
  useEffect(() => {
    setUnsaved(uid, staged > 0 ? { count: staged, save: () => saveRef.current(), discard: () => discardRef.current() } : null);
  }, [staged, uid]);
  useEffect(() => () => clearUnsaved(uid), [uid]);

  // 표 오른쪽 바깥 여백(.side-rail)의 버튼은 각 행의 높이에 맞춰 놓는다 — 행·띠 위치를 재서 버튼 위치를 정한다.
  useLayoutEffect(() => {
    const measure = () => {
      const rail = railRef.current, card = cardRef.current;
      if (!rail || !card) return;
      const base = rail.offsetParent ? rail.offsetParent.getBoundingClientRect().top : 0;
      const out = { band: null, rows: {} };
      const band = card.querySelector(':scope > .table-top');
      if (band) { const r = band.getBoundingClientRect(); out.band = { top: Math.round(r.top - base), h: Math.round(r.height) }; }
      card.querySelectorAll('tbody tr[data-rid]').forEach((tr) => { const r = tr.getBoundingClientRect(); out.rows[tr.dataset.rid] = { top: Math.round(r.top - base), h: Math.round(r.height) }; });
      setPos((p) => (JSON.stringify(p) === JSON.stringify(out) ? p : out));
    };
    measure();
    if (!side || !cardRef.current) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(cardRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  });
  // 아래 "표 접기" 띠는 화면 아래에 떠 있는 띠(자리를 차지하지 않음)다. 그 페이지를 절반 이상 스크롤해 내렸고 표의 끝이 아직 한참 아래일 때만 나타난다 —
  // 표가 끝나는 곳에선 카드가 여백 없이 끝나고(띠 없음), 띠가 나타나도 아래 내용이 밀리지 않는다. 스크롤할 수 없는 짧은 페이지에선 안 나타난다.
  const [footShown, setFootShown] = useState(false);
  useLayoutEffect(() => {
    if (!foldable) return undefined;
    let raf = 0;
    const FOOT_H = 49; // 띠 높이: 표 끝이 이 안으로 들어오면(띠가 마지막 줄을 가리게 되므로) 숨긴다
    const update = () => {
      raf = 0;
      const c = cardRef.current; if (!c) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setFootShown(max > 0 && window.scrollY >= max / 2 && c.getBoundingClientRect().bottom > window.innerHeight + FOOT_H);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body); // 표가 불러와지거나 줄이 늘어 페이지 길이가 바뀌면 다시 잰다
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); ro.disconnect(); };
  }, [foldable]);
  const [fCol, setFCol] = useState('');   // 현재 필터가 걸린 열의 key ('' = 없음)
  const [fVal, setFVal] = useState('');   // 그 열에서 고른 값
  const [openCol, setOpenCol] = useState(''); // 드롭다운이 열려 있는 열의 key

  const col = columns.find((c) => c.key === fCol) ?? null;

  // 검색까지 통과한 행 (열 필터 적용 전 — 드롭다운 목록은 이 기준으로 만든다)
  const base = useMemo(() => {
    let list = rows ?? [];
    if (filter) list = list.filter(filter);
    const needle = q.trim().toLowerCase().replace(/\s+/g, '');
    if (needle && searchKeys?.length) {
      const cq = classSearch ? parseClassQuery(q) : null; // 학년·반·번호 모양이면 그 반(·번호)의 행만
      const fields = classSearch === true ? undefined : classSearch;
      list = list.filter((r) => (cq ? classQueryMatch(cq, r, fields) : searchKeys.some((k) => String(r[k] ?? '').toLowerCase().replace(/\s+/g, '').includes(needle))));
    }
    return list;
  }, [rows, filter, q, searchKeys, classSearch]);

  const active = !!col && fVal !== '';
  // 화면 낭독기 알림: 저장 결과(성공), 검색·필터 뒤 남은 줄 수. 검색은 입력이 멈춘 뒤 한 번만 읽는다.
  const [live, setLive] = useState('');
  useEffect(() => { if (crudMsg.kind === 'ok' && crudMsg.text) setLive(crudMsg.text); }, [crudMsg]);
  const shown = useMemo(() => (active ? base.filter((r) => cellText(col, r) === fVal) : base), [base, col, fVal, active]);
  const filtered = active || q.trim() !== '';
  useEffect(() => {
    if (loading) return undefined;
    const t = setTimeout(() => setLive(filtered ? `조건에 맞는 ${shown.length}건이 보입니다.` : ''), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fCol, fVal, q, loading]);

  const selectValue = (column, value) => {
    if (value === ALL) { setFCol(''); setFVal(''); } else { setFCol(column.key); setFVal(value); }
    setOpenCol('');
  };
  const clear = () => { setFCol(''); setFVal(''); setOpenCol(''); };

  const crudBar = crud && (crud.add || crud.edit || crud.remove) && (
    <div className="crud-bar" role="group" aria-label="표 편집">
      {crud.add && <button type="button" className="btn sm btn-toggle" aria-pressed={mode === 'add'} onClick={() => pickMode('add')}><Ic.Plus />추가</button>}
      {crud.edit && <button type="button" className="btn sm btn-toggle" aria-pressed={mode === 'edit'} onClick={() => pickMode('edit')}>{mode === 'edit' ? <Ic.Check /> : <Ic.Pencil />}수정</button>}
      {crud.remove && <button type="button" className="btn sm btn-toggle" aria-pressed={mode === 'delete'} onClick={() => pickMode('delete')}>{mode === 'delete' ? <Ic.Check /> : <Ic.Trash />}삭제</button>}
    </div>
  );

  return (
    <>
      {/* 검색 도구줄: 표 카드와 분리된 자체 레이아웃. 열 필터는 표 머리글을 눌러서 쓴다 */}
      <div className={`tools-card${noCrumb && !heading ? ' plain' : ''}`}>
        {heading ?? (!noCrumb && <TabCrumb />)}
        <div className="table-tools">
          {toolbar && <div className="tool-extra">{toolbar}</div>}
          {(fCol || q.trim()) && <button type="button" className="btn btn-ghost sm" onClick={() => { clear(); setQ(''); }}>조건 지우기</button>}
          {showCount && <span className="count">{loading ? '불러오는 중…' : `${shown.length}건`}</span>}
          {/* 오른쪽 도구(시트·편집 버튼·검색)는 한 묶음: 줄이 모자라면 묶음째 다음 줄 오른쪽으로 내려간다 */}
          <div className="tools-right">
            {writeButton}
            {sheetTab && !sheetInTop && <SheetButton tab={sheetTab} className="btn btn-secondary sheet-inline" />}
            {!editInTop && crudBar}
            {searchKeys?.length > 0 && (
              <form className={`search-form search-form-narrow${wideSearch ? ' search-form-wide' : ''}`} role="search" onSubmit={(e) => e.preventDefault()}>
                <div className="search">
                  <label htmlFor={searchId} className="sr-only">검색</label>
                  <Ic.Search />
                  <AutoGrowText id={searchId} className="field-input" value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder={searchPlaceholder} />
                </div>
                <button type="submit" className="btn sm search-go">검색</button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="sr-only" role="status">{live}</div>
      {crudMsg.text && (crudMsg.kind === 'ok'
        ? <div className="badge-info"><Ic.Check width="16" height="16" />{crudMsg.text}</div>
        : <div className="badge-error" role="alert"><Ic.Alert width="16" height="16" />{crudMsg.text}</div>)}
      {(mode === 'edit' || mode === 'delete') && (
        <div className={`mode-banner${mode === 'delete' ? ' del' : ''}`} role="status">
          <span className="mode-ico">{mode === 'edit' ? <Ic.Pencil /> : <Ic.Trash />}</span>
          <div className="mode-msg">
            <b>{mode === 'edit' ? '수정 중' : '삭제 중'}{staged > 0 && <span className="mode-count">변경 {staged}건</span>}</b>
            <span>{mode === 'edit'
              ? (side ? '고칠 칸을 누르세요. 칸을 누르면 그 행 오른쪽에 저장 버튼이 생깁니다(한꺼번에 저장은 여기 저장).' : '고칠 칸을 누르세요. 다 고쳤으면 저장을 누르세요.')
              : (side ? "지울 행 오른쪽의 '삭제'를 누르세요. 그 행 오른쪽이나 여기 저장을 누르면 지워집니다." : "지울 행 끝의 '삭제'를 누르세요. 저장을 누르면 지워집니다.")}</span>
          </div>
          <div className="mode-actions">
            <button type="button" className="btn btn-ghost sm" disabled={!rowStaged || saving} onClick={discardAll}>되돌리기</button>
            <SaveButton type="button" size="sm" busy={saving} disabled={!rowStaged} onClick={() => saveRows()} />
          </div>
        </div>
      )}
      {mode === 'add' && crud?.add && (
        <AddRowForm table={table} title={crud.addTitle} fields={crud.fields ?? columns.filter((c) => c.editable).map((c) => ({ key: c.editField ?? c.key, header: c.header }))}
          required={crud.required ?? []} defaults={crud.defaults}
          onCancel={() => setMode(null)}
          onSaved={(row, values) => { setMode(null); flash('ok', `'${labelOf({ ...row, ...values })}' 행을 추가했습니다.`); reload?.(); }} />
      )}
      <div className={`card tight${foldable ? ' foldable' : ''}${folded ? ' folded' : ''}`} ref={cardRef}>
        {bandless && !folded && !(tableTop || (sheetTab && sheetInTop) || (editInTop && crudBar)) && bandGap > 0 && <div aria-hidden="true" style={{ height: bandGap }} />}
        {((foldable && (!bandless || folded)) || tableTop || (sheetTab && sheetInTop) || (editInTop && crudBar)) && (
          <div className="table-top">
            {tableTop}
            {editInTop && crudBar}
            {((sheetTab && sheetInTop) || (foldable && !side)) && (
              <div className="table-top-right">
                {sheetTab && sheetInTop && <SheetButton tab={sheetTab} className="btn btn-secondary sm table-top-sheet" />}
                {foldable && !side && (
                  <button type="button" className="fold-round" aria-expanded={!folded} aria-controls={foldId} aria-label={folded ? '표 펼치기' : '표 접기'} title={folded ? '표 펼치기' : '표 접기'} onClick={() => toggleFold(false)}>
                    <Ic.ChevronDown />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div id={foldId} className={foldable ? `collapse${folded ? ' closed' : ''}` : undefined}>
         <div inert={foldable && folded ? '' : undefined}>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.header && !c.noFilter ? (
                      <HeaderFilter
                        column={c} rows={base}
                        selected={fCol === c.key ? fVal : ALL}
                        open={openCol === c.key}
                        onToggle={() => setOpenCol(openCol === c.key ? '' : c.key)}
                        onClose={() => setOpenCol('')}
                        onSelect={(v) => selectValue(c, v)}
                      />
                    ) : c.header}
                  </th>
                ))}
                {delCol && <th scope="col" className="row-act"><span className="sr-only">삭제</span></th>}
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr><td className="empty" colSpan={columns.length + (delCol ? 1 : 0)}>
                  <span className="empty-search" role="alert">
                    목록을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도하세요.
                    {reload && <button type="button" className="btn btn-ghost sm" onClick={reload}>다시 시도</button>}
                  </span>
                  <span className="muted small"> (오류: {String(error.message ?? error)})</span>
                </td></tr>
              )}
              {!error && !loading && shown.length === 0 && (
                <tr><td className="empty" colSpan={columns.length + (delCol ? 1 : 0)}>
                  {active || q.trim() ? (
                    <span className="empty-search">
                      "{active ? `${col.header}: ${fVal || '(비어 있음)'}` : q.trim()}"{active && q.trim() ? ` + "${q.trim()}"` : ''} 에 맞는 행이 없습니다.
                      <button type="button" className="btn btn-ghost sm" onClick={() => { clear(); setQ(''); }}>조건 지우기</button>
                    </span>
                  ) : emptyText}
                </td></tr>
              )}
              {!error && shown.map((r, i) => {
                const vr = view(r);
                const gone = !!removals[r[rowKey]];
                return (
                  <tr key={r[rowKey] ?? i} data-rid={r[rowKey]} className={gone ? 'staged-del' : undefined}>
                    {columns.map((c) => {
                      const field = c.editField ?? c.key;
                      const schemaCol = c.editable && editingOn && table && !gone && (!c.canEdit || c.canEdit(r)) ? (c.schemaCol ?? findEditableColumn(table, field)) : null;
                      const dirty = !!drafts[r[rowKey]]?.[field];
                      if (schemaCol) {
                        return (
                          <td key={c.key} className={`editable${dirty ? ' dirty' : ''}${c.className ? ` ${c.className}` : ''}`}>
                            <EditableCell row={vr} col={c} field={field} schemaCol={schemaCol} table={table} reload={reload}
                              onStage={crud ? (f, v) => stage(r, f, v, c.key) : undefined}
                              onEditing={(o) => markEditing(r[rowKey], o)} registerCommit={(fn) => { openCommit.current = fn; }}
                              display={c.render ? c.render(vr, ctx) : (vr[c.key] ?? '')} />
                          </td>
                        );
                      }
                      return <td key={c.key} className={`${dirty ? 'dirty ' : ''}${c.className ?? ''}`.trim() || undefined}>{c.render ? c.render(vr, ctx) : (vr[c.key] ?? '')}</td>;
                    })}
                    {delCol && (
                      <td className="row-act">
                        {(!crud.canRemove || crud.canRemove(r)) && (
                          <button type="button" className={`btn sm ${gone ? 'btn-secondary' : 'btn-danger'}`} aria-pressed={gone} aria-label={`${labelOf(r)} ${gone ? '삭제 취소' : '삭제'}`} onClick={() => toggleRemove(r)}>{gone ? '삭제 취소' : '삭제'}</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {footer}
         </div>
        </div>
        {foldable && !folded && (
          <button type="button" className={`fold-foot${footShown ? '' : ' away'}`} aria-expanded="true" aria-controls={foldId} onClick={() => toggleFold(true)}>
            <span className="fold-foot-bar"><span className="btn sm btn-toggle fold-pill"><Ic.ChevronDown />표 접기</span></span>
          </button>
        )}
      </div>
      {side && (
        <div className="side-rail" ref={railRef}>
          {foldable && pos.band && (
            <div className="rail-item" style={{ top: pos.band.top, height: pos.band.h }}>
              <button type="button" className="fold-round" aria-expanded={!folded} aria-controls={foldId} aria-label={folded ? '표 펼치기' : '표 접기'} title={folded ? '표 펼치기' : '표 접기'} onClick={() => toggleFold(false)}>
                <Ic.ChevronDown />
              </button>
            </div>
          )}
          {!folded && showDelete && shown.filter((r) => !crud.canRemove || crud.canRemove(r)).map((r) => {
            const id = r[rowKey]; const p = pos.rows[id]; const gone = !!removals[id];
            if (!p) return null;
            return (
              <div className="rail-item rail-del" key={`del-${id}`} data-rid={id} style={{ top: p.top, height: p.h }}>
                <button type="button" className={`btn sm rail-btn ${gone ? 'btn-secondary' : 'btn-danger'}`} aria-pressed={gone} aria-label={`${labelOf(r)} ${gone ? '삭제 취소' : '삭제'}`} onClick={() => toggleRemove(r)}>{gone ? '취소' : '삭제'}</button>
                {(gone || drafts[id]) && <SaveButton type="button" size="sm" className="half" busy={saving} onClick={() => saveRows([id])} aria-label={`${labelOf(r)} 저장`} />}
              </div>
            );
          })}
          {(folded ? [] : [...new Set([...Object.keys(drafts), ...Object.keys(removals), ...(editingRow ? [editingRow] : [])])]).filter((id) => pos.rows[id] && rowsById[id] && !(showDelete && (!crud.canRemove || crud.canRemove(rowsById[id])))).map((id) => (
            <div className="rail-item" key={id} style={{ top: pos.rows[id].top, height: pos.rows[id].h }}>
              <SaveButton type="button" size="sm" className="half" busy={saving} onMouseDown={(e) => e.preventDefault()} onClick={() => saveRows([id])} aria-label={`${labelOf(rowsById[id])} 저장`} />
            </div>
          ))}
        </div>
      )}
      {dlg && (
        <ConfirmDialog title={dlg.title} onCancel={() => answer(dlg.cancelValue)}
          actions={dlg.actions.map((a) => ({ label: a.label, variant: a.variant, onClick: () => answer(a.value) }))}>{dlg.body}</ConfirmDialog>
      )}
    </>
  );
}
