/**
 * 날짜 기록 칸 ↔ AS기록 탭(as_logs). 시트에는 기록 한 건이 한 줄(날짜·학년도·학년-반 또는 개별 장비 ID·항목·내용)이고,
 * 화면에는 지금처럼 칸 하나에 "2026.10.02 내용" 줄로 묶여 보인다(DatedMemo). 데모·Supabase API 를 감싸서
 *   - 읽기: 반별 TV·A/S·태블릿 충전함, 개별 장비 행에 그 대상·항목의 기록 줄을 붙인다.
 *   - 셀 저장: 그 칸이면 오늘 줄만 AS기록의 행으로 더하거나 고치거나 지운다(같은 addRow·updateCell·deleteRow 를 써서 시트 먼저).
 *   - 행 삭제: 그 대상의 기록 줄도 같이 지운다.
 */
import { classroomKey } from '../../../shared/sheet-schema.js';
import { memoToday, parseLines, joinLines } from '../datedLines.js';
import { today } from './common.js';

// 표.칸 → AS기록의 항목. tablet_cabinets.memo 는 반별 보관함만(여유 보관함의 "기타 메모"는 보통 칸).
const LOG_FIELDS = {
  classroom_tvs: { memo: 'TV 비고' },
  classroom_as: { hdmi: 'HDMI', lan: 'LAN', memo: '반별 A/S 비고' },
  tablet_cabinets: { memo: '충전함 비고' },
  device_units: { as_log: '장비 A/S' },
};
// 표 → 그 표의 행을 읽는 API 이름
const READER = { classroom_tvs: 'classroomTvs', classroom_as: 'classroomAs', tablet_cabinets: 'tabletCabinets', device_units: 'deviceUnits' };

const usesLogs = (table, row) => !!LOG_FIELDS[table] && !(table === 'tablet_cabinets' && row.is_spare);
// 기록의 대상: 개별 장비는 그 ID, 학급 기록은 "학년도|학년-반"
const targetOfRow = (table, r) => (table === 'device_units' ? r.id : `${r.school_year}|${classroomKey(r)}`);
const targetOfLog = (l) => l.unit_id || `${l.school_year}|${classroomKey(l)}`;
const toDot = (d) => String(d ?? '').replaceAll('-', '.');

/** 기록 줄(날짜순, 날짜 없는 예전 글이 먼저) → 칸 글자 */
function linesOf(logs = []) {
  const sorted = logs.slice().sort((a, b) => String(a.logged_on ?? '').localeCompare(String(b.logged_on ?? '')) || String(a.id).localeCompare(String(b.id)));
  return joinLines(sorted.map((l) => ({ date: toDot(l.logged_on), body: l.body ?? '' })));
}

export function withAsLogs(base) {
  const groupLogs = async () => {
    const by = {};
    for (const l of await base.asLogs()) (by[`${l.item}|${targetOfLog(l)}`] ??= []).push(l);
    return by;
  };
  const read = (table) => async () => {
    const [rows, by] = await Promise.all([base[READER[table]](), groupLogs()]);
    return rows.map((r) => {
      if (!usesLogs(table, r)) return r;
      const out = { ...r };
      for (const [field, item] of Object.entries(LOG_FIELDS[table])) out[field] = linesOf(by[`${item}|${targetOfRow(table, r)}`]);
      return out;
    });
  };
  const findRow = async (table, id) => {
    const row = (await base[READER[table]]()).find((r) => r.id === id);
    if (!row) throw new Error('행을 찾지 못했습니다.');
    return row;
  };
  const logsFor = async (table, row, items) => {
    const target = targetOfRow(table, row);
    return (await base.asLogs()).filter((l) => items.includes(l.item) && targetOfLog(l) === target);
  };

  const api = {
    ...base,
    classroomTvs: read('classroom_tvs'),
    classroomAs: read('classroom_as'),
    tabletCabinets: read('tablet_cabinets'),
    deviceUnits: read('device_units'),

    /** 기록 칸이면 value(칸 전체 글자) 중 오늘 줄만 AS기록에 반영한다. 다른 날짜 줄은 화면에서 고칠 수 없어 그대로다. */
    updateCell: async (table, id, field, value) => {
      const item = LOG_FIELDS[table]?.[field];
      if (!item) return base.updateCell(table, id, field, value);
      const row = await findRow(table, id);
      if (!usesLogs(table, row)) return base.updateCell(table, id, field, value);
      const body = parseLines(value).filter((x) => x.date === memoToday()).map((x) => x.body).join(' ').trim();
      const todays = (await logsFor(table, row, [item])).filter((l) => toDot(l.logged_on) === memoToday());
      if (!body) {
        for (const l of todays) await base.deleteRow('as_logs', l.id);
      } else if (todays.length) {
        await base.updateCell('as_logs', todays[0].id, 'body', body);
        for (const l of todays.slice(1)) await base.deleteRow('as_logs', l.id);
      } else {
        await base.addRow('as_logs', table === 'device_units'
          ? { logged_on: today(), unit_id: row.id, item, body }
          : { logged_on: today(), school_year: String(row.school_year), classroom_id: classroomKey(row), item, body });
      }
      return { value };
    },
    /** 대상 행을 지우면 그 행의 기록 줄도 같이 지운다(시트의 AS기록 탭에서도) */
    deleteRow: async (table, id) => {
      if (LOG_FIELDS[table]) {
        const row = await findRow(table, id);
        if (usesLogs(table, row)) for (const l of await logsFor(table, row, Object.values(LOG_FIELDS[table]))) await base.deleteRow('as_logs', l.id);
      }
      return base.deleteRow(table, id);
    },
  };
  return api;
}
