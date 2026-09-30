/**
 * POST /.netlify/functions/rental
 *   { action: 'add', item_type, borrower_name, manufacturer?, model?, item_name?, rented_on, checked_by_staff_id?, memo? }
 *   { action: 'return', id, returned_on }
 * 시트(대여 탭)에 먼저 쓰고, 성공하면 DB 에 반영한다. (동기화가 시트 기준으로 DB 를 통째 교체하므로 순서가 중요)
 */
import { appendRow, updateCellById } from '../lib/google-sheets.mts';
import { requireUser, json, errorResponse } from '../lib/supabase-admin.mts';
import { byTable, ITEM_TYPES } from '../../shared/sheet-schema.js';

const TAB = byTable.rentals.tab;
const H = Object.fromEntries(byTable.rentals.columns.filter((c: any) => c.key).map((c: any) => [c.key, c.header]));

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb } = await requireUser(req);
    const body: any = await req.json();

    if (body.action === 'add') {
      if (!ITEM_TYPES.includes(body.item_type)) throw Object.assign(new Error('구분이 올바르지 않습니다.'), { status: 400 });
      const borrower = String(body.borrower_name ?? '').trim();
      if (!borrower) throw Object.assign(new Error('대여자 성함을 입력하세요.'), { status: 400 });

      const { data: staff } = await sb.from('staff').select('id,name').in('id', [body.checked_by_staff_id].filter(Boolean)).or(`name.eq.${borrower}`);
      const borrowerStaff = (staff ?? []).find((s: any) => s.name === borrower);
      const checker = (staff ?? []).find((s: any) => s.id === body.checked_by_staff_id);

      const row = {
        id: `rt-${Date.now().toString(36)}`,
        item_type: body.item_type,
        borrower_staff_id: borrowerStaff?.id ?? null,
        borrower_name: borrower,
        manufacturer: body.manufacturer || null, model: body.model || null, item_name: body.item_name || null,
        rented_on: body.rented_on || new Date().toISOString().slice(0, 10), returned_on: null,
        checked_by_staff_id: checker?.id ?? null, memo: body.memo || null,
      };

      // 1) 시트
      await appendRow(TAB, {
        [H.id]: row.id, [H.item_type]: row.item_type, [H.borrower_name]: row.borrower_name,
        [H.manufacturer]: row.manufacturer ?? '', [H.model]: row.model ?? '', [H.item_name]: row.item_name ?? '',
        [H.rented_on]: row.rented_on, [H.returned_on]: '', [H.checked_by_staff_id]: checker?.name ?? '', [H.memo]: row.memo ?? '',
      });
      // 2) DB
      const { error } = await sb.from('rentals').upsert(row, { onConflict: 'id' });
      if (error) throw new Error(`시트에는 기록됐지만 DB 저장 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ row });
    }

    if (body.action === 'return') {
      const date = body.returned_on || new Date().toISOString().slice(0, 10);
      const found = await updateCellById(TAB, body.id, H.returned_on, date);
      if (!found) throw Object.assign(new Error('시트에서 해당 대여 기록(ID)을 찾지 못했습니다.'), { status: 404 });
      const { error } = await sb.from('rentals').update({ returned_on: date }).eq('id', body.id);
      if (error) throw new Error(`시트에는 반영됐지만 DB 갱신 실패: ${error.message}`);
      return json({ ok: true });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e) { return errorResponse(e); }
};
