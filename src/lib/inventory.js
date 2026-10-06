/**
 * 전자기기 보유 현황 집계표(교육청 제출 양식). 시트(보유현황_제출본 = inventory_snapshots)의 한 연도 7줄로
 * 표를 만든다: 구입연도 구간 7줄 × (학생용 5열 + 교원용·직원용·기타 각 4열) + 소계·합계.
 * 장비 목록(devices)과는 연동하지 않는다 — 숫자는 이 시트에서 따로 관리한다.
 */

export const GROUPS = [
  { key: 'student', label: '학생용', cols: [
    { key: 'student_lab', label: '컴퓨터실습실', top: '데스크톱' }, { key: 'student_other', label: '컴퓨터실습실 외', top: '데스크톱' },
    { key: 'student_laptop', label: '노트북' }, { key: 'student_tablet', label: '태블릿' }, { key: 'student_etc', label: '기타(클라우드PC등)' },
  ] },
  { key: 'teacher', label: '교원용', cols: [{ key: 'teacher_desktop', label: '데스크톱' }, { key: 'teacher_laptop', label: '노트북' }, { key: 'teacher_tablet', label: '태블릿' }, { key: 'teacher_etc', label: '기타' }] },
  { key: 'staff', label: '직원용', cols: [{ key: 'staff_desktop', label: '데스크톱' }, { key: 'staff_laptop', label: '노트북' }, { key: 'staff_tablet', label: '태블릿' }, { key: 'staff_etc', label: '기타' }] },
  { key: 'etc', label: '기타', cols: [{ key: 'etc_desktop', label: '데스크톱' }, { key: 'etc_laptop', label: '노트북' }, { key: 'etc_tablet', label: '태블릿' }, { key: 'etc_etc', label: '기타' }] },
];
export const CELL_KEYS = GROUPS.flatMap((g) => g.cols.map((c) => c.key));

const BAND_NAMES = ['최근1년이내', '최근1년~2년미만', '최근2년~3년미만', '최근3년~4년미만', '최근4년~5년미만', '최근5년~6년미만', '최근6년이전'];
const yy = (y) => String(y).slice(2);

/** 기준연도의 7개 구간. 2026 → [25.1.1~25.12.31, 24…, …, ~19.12.31] */
export function bandsFor(year) {
  return BAND_NAMES.map((name, i) => {
    const py = year - 1 - i;
    return { band: i + 1, name, range: i < 6 ? `${yy(py)}.1.1~${yy(py)}.12.31` : `~${yy(py)}.12.31` };
  });
}
function finish(rows) {
  let grand = 0;
  const out = rows.map((r) => {
    const sub = {};
    let total = 0;
    for (const g of GROUPS) { sub[g.key] = g.cols.reduce((a, c) => a + (r.cells[c.key] ?? 0), 0); total += sub[g.key]; }
    grand += total;
    return { ...r, sub, total };
  });
  return { rows: out, grand };
}

/** 제출본 행(한 연도의 7줄)으로 같은 모양의 표를 만든다. */
export function matrixFromSnapshot(snapRows) {
  const rows = snapRows.slice().sort((a, b) => a.band - b.band).map((s) => ({
    id: s.id, band: s.band, name: BAND_NAMES[s.band - 1] ?? '', range: s.band_label ?? '',
    cells: Object.fromEntries(CELL_KEYS.map((k) => [k, Number(s[k] ?? 0)])),
  }));
  return finish(rows);
}
