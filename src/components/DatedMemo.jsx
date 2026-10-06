/**
 * 날짜 태그가 붙는 기록 칸(반별 TV·충전함 비고, 반별 A/S HDMI·LAN·비고, 장비 A/S 기록). 시트에는 "AS기록" 탭에
 * 날짜·대상·항목·내용 한 줄씩 저장되고, 데이터 계층(src/lib/api/asLogs.js)이 그 행들을 "2026.10.02 내용" 줄로 묶어 이 칸에 넣는다.
 *   - 고칠 때 입력칸에는 오늘 줄의 내용만 나온다. 저장하면 오늘 줄을 바꾸고(없으면 맨 아래에 새 줄), 비우면 오늘 줄을 지운다.
 *   - 다른 날짜의 줄과 날짜 없는 예전 글은 그대로 둔다(고치려면 시트의 AS기록 탭에서).
 * 표 열은 datedColumn(key, header) 로 만든다(반별 TV·태블릿·A/S 비고, 장비 A/S 기록).
 */
import { memoToday, parseLines as parse, joinLines } from '../lib/datedLines.js';

/** 입력칸에 넣을 값: 오늘 줄의 내용 */
function memoTodayText(row, key = 'memo') {
  return parse(row[key]).find((x) => x.date === memoToday())?.body ?? '';
}

/** 저장할 값: 오늘 줄을 입력값으로 바꾼(없으면 맨 아래에 더한) 전체 글자 */
function memoWithToday(row, input, key = 'memo') {
  const today = memoToday();
  const lines = parse(row[key]).filter((x) => x.date !== today);
  const body = String(input ?? '').replace(/\s*\n\s*/g, ' ').trim(); // 기록 한 건 = 한 줄(AS기록 탭의 행 하나)
  if (body) lines.push({ date: today, body });
  return joinLines(lines);
}

export default function DatedMemo({ text }) {
  const lines = parse(text);
  if (!lines.length) return '';
  return (
    <span className="memo-lines">
      {lines.map((x, i) => (
        <span className="memo-line" key={i}>
          {x.date && <span className="memo-date">{x.date}</span>}
          <span>{x.body}</span>
        </span>
      ))}
    </span>
  );
}

/** DataTable 열: 날짜 태그 칸(editable). 고치면 오늘 날짜 줄이 붙고, 날짜가 다르면 줄이 나뉜다. */
// schemaCol: 이 칸은 각 표의 열이 아니라 AS기록 탭의 행이라(시트 정의에 없음) 편집 칸 모양을 직접 준다.
export const datedColumn = (key, header) => ({
  key, header, editable: true, schemaCol: { key, header },
  render: (r) => <DatedMemo text={r[key]} />,
  editValue: (r) => memoTodayText(r, key),
  saveValue: (r, v) => memoWithToday(r, v, key),
});
