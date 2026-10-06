/**
 * src/data/demo.js + shared/sheet-schema.js → demo/정보부_업무관리_데모시트.xlsx
 * 실행: npm run make:sheet  (다른 경로에 만들려면: node scripts/make-demo-sheet.mjs <경로>)
 * 사용: 구글 드라이브에 업로드 → "Google Sheets 로 열기" → 파일 ID 를 GOOGLE_SHEET_ID 에 넣는다.
 */
import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TABLES, ITEM_TYPES, MANUAL_CATEGORIES, LINK_GROUPS, studentNo, classroomKey, TAB_GROUPS, GUIDE_TAB, GUIDE_TAB_COLOR, GUIDE_MARKER } from '../shared/sheet-schema.js';
import db from '../src/data/demo.js';

const FONT = { name: 'Arial', size: 10 };
const HEAD_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDE7FD' } }; // 보라 틴트
const ID_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F1F6' } };

// ref 열: id → 시트에 적는 자연키
const display = {
  staff: (id) => db.staff.find((s) => s.id === id)?.name ?? '',
  students: (id) => { const s = db.students.find((x) => x.id === id); return s ? studentNo(s) : ''; },
  classrooms: (id) => { const c = db.classrooms.find((x) => x.id === id); return c ? classroomKey(c) : ''; },
};
const LISTS = { item_type: ITEM_TYPES, category: MANUAL_CATEGORIES, group_name: LINK_GROUPS };

const wb = new ExcelJS.Workbook();
wb.creator = '정보부 업무 관리 시스템';

/* ---------- 안내 탭 ---------- */
const guide = wb.addWorksheet(GUIDE_TAB, { properties: { tabColor: { argb: 'FF' + GUIDE_TAB_COLOR.slice(1) } } });
guide.columns = [{ width: 18 }, { width: 100 }];
const tabLabel = Object.fromEntries(TABLES.map((t) => [t.tab, t.label]));
const guideRows = [
  ['정보부 업무 관리 시스템 — 데이터 시트', ''],
  ['', ''],
  [GUIDE_MARKER, '탭 이름을 누르면 그 탭으로 이동합니다. 탭 색은 영역별입니다.'],
  ...TAB_GROUPS.flatMap((g) => [[g.name, ''], ...g.tabs.map((tab) => [tab, tabLabel[tab]])]),
  ['', ''],
  ['사용법', '각 탭이 웹앱의 표 하나에 대응합니다. 이 시트를 고치면 웹앱이 주기적으로(기본 10분) 읽어 갑니다.'],
  ['ID 열', '비워 두면 자동으로 채워집니다. 이미 값이 있는 행의 ID 는 바꾸지 마세요.'],
  ['머리글', '1행 머리글은 웹앱이 열을 찾는 기준입니다. 이름을 바꾸거나 열을 지우지 마세요. 열 추가는 괜찮습니다.'],
  ['성함·학번·학년-반', '다른 탭의 사람·교실을 가리키는 열입니다. 교직원 탭의 성함, 학생 탭의 학번(예: 21011), 학급 탭의 "학년-반"(예: 2-5) 과 똑같이 적어야 연결됩니다.'],
  ['날짜', 'YYYY-MM-DD 형식 (예: 2026-03-02).'],
  ['비밀 정보', 'goedu 관리자 계정·학교 공용 메일 비밀번호는 이 시트에 넣지 않습니다. 웹앱의 관리자 메뉴얼(DB) 에만 저장합니다.'],
  ['', ''],
  ['', ''],
  ['데모 데이터', '이 파일의 모든 값은 가짜(데모) 입니다. 실제 데이터로 바꿔서 쓰세요.'],
];
guideRows.forEach((r) => guide.addRow(r));
guide.getRow(1).font = { ...FONT, bold: true, size: 14 };
guide.eachRow((row) => { row.font = FONT; row.alignment = { vertical: 'top', wrapText: true }; });
// 탭 목차: 제목줄·영역 줄(영역 색 바탕)은 굵게, 탭 칸은 그 탭으로 가는 링크
guide.getRow(3).font = { ...FONT, bold: true };
const tint = (hex) => 'FF' + [1, 3, 5].map((i) => Math.round(255 - (255 - parseInt(hex.slice(i, i + 2), 16)) * 0.2).toString(16).padStart(2, '0')).join('').toUpperCase();
let guideRow = 4;
for (const g of TAB_GROUPS) {
  const gr = guide.getRow(guideRow++);
  gr.font = { ...FONT, bold: true };
  gr.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tint(g.color) } };
  for (const tab of g.tabs) {
    const c = guide.getRow(guideRow++).getCell(1);
    c.value = { text: tab, hyperlink: `#'${tab}'!A1` };
    c.font = { ...FONT, color: { argb: 'FF1155CC' }, underline: true };
  }
}

/* ---------- 데이터 탭 ---------- */
const groupOf = Object.fromEntries(TAB_GROUPS.flatMap((g) => g.tabs.map((tab) => [tab, g])));
const ordered = TAB_GROUPS.flatMap((g) => g.tabs).map((tab) => TABLES.find((t) => t.tab === tab));
for (const t of ordered) {
  const ws = wb.addWorksheet(t.tab, { properties: { tabColor: { argb: 'FF' + groupOf[t.tab].color.slice(1) } } });
  const cols = t.columns;
  ws.columns = cols.map((c) => ({
    header: c.header,
    key: c.key ?? c.header,
    width: c.key === 'id' ? 14 : c.wide ? 60 : Math.max(12, c.header.length * 2 + 4),
  }));

  for (const row of db[t.table]) {
    const values = cols.map((c) => {
      if (c.derived) return c.derived(row, db);
      if (c.ref) {
        const id = row[c.refKey ?? c.key];
        // refKey 가 있는 열(대여자 성함)은 교직원이 아니어도 원문 이름을 유지
        return id ? display[c.ref](id) : c.refKey ? row[c.key] ?? '' : '';
      }
      const v = row[c.key];
      return v === null || v === undefined ? '' : v;
    });
    ws.addRow(values);
  }

  // 머리글 스타일 + 메모
  const head = ws.getRow(1);
  head.font = { ...FONT, bold: true };
  head.fill = HEAD_FILL;
  head.alignment = { vertical: 'middle' };
  cols.forEach((c, i) => {
    const notes = [];
    if (c.note) notes.push(c.note);
    if (c.ref === 'staff') notes.push('교직원 탭의 성함과 똑같이');
    if (c.ref === 'students') notes.push('학생 탭의 학번(학년+반2자리+번호2자리)');
    if (c.ref === 'classrooms') notes.push('학급 탭의 "학년-반" (예: 2-5)');
    if (c.type === 'date') notes.push('YYYY-MM-DD');
    if (c.derived) notes.push('참고용 자동 표시 (웹앱은 읽지 않음)');
    if (notes.length) head.getCell(i + 1).note = notes.join('\n');
  });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };

  // 본문 스타일
  ws.eachRow((row, i) => {
    if (i === 1) return;
    row.font = FONT;
    row.getCell(1).fill = ID_FILL;
    row.getCell(1).font = { ...FONT, color: { argb: 'FF686B82' } };
    cols.forEach((c, ci) => {
      if (c.wide) row.getCell(ci + 1).alignment = { wrapText: true, vertical: 'top' };
    });
  });

  // 드롭다운(목록) 검증
  cols.forEach((c, ci) => {
    const list = LISTS[c.key];
    if (!list || (t.table === 'staff' && c.key === 'position')) return;
    const col = ws.getColumn(ci + 1).letter;
    ws.dataValidations.add(`${col}2:${col}1000`, {
      type: 'list', allowBlank: true, formulae: [`"${list.join(',')}"`],
      showErrorMessage: true, errorTitle: '목록에서 선택', error: `다음 중 하나: ${list.join(' / ')}`,
    });
  });
}

mkdirSync(new URL('../demo/', import.meta.url), { recursive: true });
// 인자로 경로를 주면 거기에 만든다(기본 파일이 Excel 에서 열려 있어 덮어쓸 수 없을 때)
const file = process.argv[2] ? pathToFileURL(resolve(process.argv[2])) : new URL('../demo/정보부_업무관리_데모시트.xlsx', import.meta.url);
await wb.xlsx.writeFile(file);
console.log('생성 완료:', decodeURIComponent(file.pathname), TABLES.map((t) => `${t.tab}=${db[t.table].length}`).join(', '));
