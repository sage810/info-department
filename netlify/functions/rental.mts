/**
 * POST /.netlify/functions/rental
 *   { action: 'add', item_type, borrower_name?, borrower_student_no?, manufacturer?, model?, item_name?, rented_on, checked_by_staff_id?, memo? }
 *     borrower_student_no(학번, 예: 21011) 가 있으면 학생 대여, 없으면 borrower_name 으로 교직원 대여.
 *   { action: 'return', id, returned_on }   returned_on 이 없으면 오늘 날짜, null 이면 반납 취소(대여 중으로)
 * 시트(대여 탭)에 먼저 쓰고, 성공하면 DB 에 반영한다. (동기화가 시트 기준으로 DB 를 통째 교체하므로 순서가 중요)
 */
import { appendRow, updateCellById } from '../lib/google-sheets.mts';
import { requireUser, waitForSync, json, errorResponse } from '../lib/supabase-admin.mts';
import { byTable, ITEM_TYPES, parseStudentNo, SCHOOL_YEAR } from '../../shared/sheet-schema.js';

const TAB = byTable.rentals.tab;
const H = Object.fromEntries(byTable.rentals.columns.filter((c: any) => c.key).map((c: any) => [c.key, c.header]));

// 오늘 날짜는 학교(한국) 기준으로. Netlify 함수는 UTC 로 돌아 toISOString 이면 새벽 0~9시에 하루 전 날짜가 된다.
const seoulToday = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb } = await requireUser(req);
    await waitForSync(sb); // 시트 동기화가 도는 중이면 끝난 뒤에 쓴다
    const body: any = await req.json();

    if (body.action === 'add') {
      if (!ITEM_TYPES.includes(body.item_type)) throw Object.assign(new Error('구분이 올바르지 않습니다.'), { status: 400 });
      const studentNo = String(body.borrower_student_no ?? '').trim();

      let borrowerStaffId: string | null = null, borrowerStudentId: string | null = null, borrowerName = '';
      if (studentNo) {
        const p = parseStudentNo(studentNo);
        if (!p) throw Object.assign(new Error('학번 형식이 올바르지 않습니다(예: 21011).'), { status: 400 });
        const { data: st } = await sb.from('students').select('id,name')
          .match({ school_year: SCHOOL_YEAR, grade: p.grade, class_no: p.class_no, number: p.number }).maybeSingle();
        if (!st) throw Object.assign(new Error(`학번 "${studentNo}" 학생을 찾지 못했습니다.`), { status: 400 });
        borrowerStudentId = st.id; borrowerName = st.name;
      } else {
        borrowerName = String(body.borrower_name ?? '').trim();
        if (!borrowerName) throw Object.assign(new Error('대여자 성함을 입력하세요.'), { status: 400 });
        const { data: staffMatch } = await sb.from('staff').select('id,name').eq('name', borrowerName).maybeSingle();
        borrowerStaffId = staffMatch?.id ?? null;
      }
      const { data: checker } = await sb.from('staff').select('id,name').eq('id', body.checked_by_staff_id ?? '').maybeSingle();

      const row = {
        id: `rt-${Date.now().toString(36)}`,
        item_type: body.item_type,
        borrower_staff_id: borrowerStaffId,
        borrower_student_id: borrowerStudentId,
        borrower_name: borrowerName,
        manufacturer: body.manufacturer || null, model: body.model || null, item_name: body.item_name || null,
        rented_on: body.rented_on || seoulToday(), returned_on: null,
        checked_by_staff_id: checker?.id ?? null, memo: body.memo || null,
      };

      // 1) 시트
      await appendRow(TAB, {
        [H.id]: row.id, [H.item_type]: row.item_type, [H.borrower_name]: row.borrower_name,
        [H.borrower_student_id]: studentNo, // 시트에는 학번 자연키로 적어 둔다(동기화가 다시 학생 id 로 바꿔 넣는다)
        [H.manufacturer]: row.manufacturer ?? '', [H.model]: row.model ?? '', [H.item_name]: row.item_name ?? '',
        [H.rented_on]: row.rented_on, [H.returned_on]: '', [H.checked_by_staff_id]: checker?.name ?? '', [H.memo]: row.memo ?? '',
      });
      // 2) DB
      const { error } = await sb.from('rentals').upsert(row, { onConflict: 'id' });
      if (error) throw new Error(`시트에는 기록됐지만 DB 저장 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ row });
    }

    if (body.action === 'return') {
      // returned_on === null 이면 "반납 취소"(대여 중으로 되돌리기) — undefined/빈 값이면 기존처럼 오늘 날짜로 반납.
      const date: string | null = body.returned_on === null ? null : (body.returned_on || seoulToday());
      const found = await updateCellById(TAB, body.id, H.returned_on, date ?? '');
      if (!found) throw Object.assign(new Error('시트에서 해당 대여 기록(ID)을 찾지 못했습니다.'), { status: 404 });
      const { error } = await sb.from('rentals').update({ returned_on: date }).eq('id', body.id);
      if (error) throw new Error(`시트에는 반영됐지만 DB 갱신 실패: ${error.message}`);
      return json({ ok: true });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e) { return errorResponse(e); }
};
