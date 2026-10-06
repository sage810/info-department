/**
 * 날짜 기록 칸의 글자 모양: 줄마다 "2026.10.02 내용"(날짜 없는 줄은 내용만).
 * 화면(DatedMemo)과 데이터 계층(api/asLogs.js — AS기록 탭의 행 ↔ 이 글자)이 같이 쓴다.
 */
const LINE_RE = /^(\d{4}\.\d{2}\.\d{2})\s+(.*)$/;

/** 오늘(이 기기 날짜)을 "YYYY.MM.DD" 로 */
export function memoToday() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 글자 → [{ date: 'YYYY.MM.DD' | '', body }] */
export function parseLines(text) {
  return String(text ?? '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = LINE_RE.exec(l);
    return m ? { date: m[1], body: m[2] } : { date: '', body: l };
  });
}

/** [{ date, body }] → 글자 */
export const joinLines = (lines) => lines.map((x) => (x.date ? `${x.date} ${x.body}` : x.body)).join('\n');
