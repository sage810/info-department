/**
 * POST /.netlify/functions/manual
 *   { action: 'add',    category, title, body }
 *   { action: 'update', id, category, title, body }
 *   { action: 'delete', id }
 * 대여와 같은 규칙: 시트(메뉴얼 탭)에 먼저 쓰고, 성공하면 DB 에 반영한다.
 */
import { appendRow, updateFieldsById, deleteRowById } from '../lib/google-sheets.mts';
import { requireUser, json, errorResponse } from '../lib/supabase-admin.mts';
import { byTable, MANUAL_CATEGORIES } from '../../shared/sheet-schema.js';

const TAB = byTable.manuals.tab;
const H = Object.fromEntries(byTable.manuals.columns.filter((c: any) => c.key).map((c: any) => [c.key, c.header]));

function readContent(body: any) {
  if (!MANUAL_CATEGORIES.includes(body.category)) throw Object.assign(new Error('카테고리가 올바르지 않습니다.'), { status: 400 });
  const title = String(body.title ?? '').trim();
  const text = String(body.body ?? '').trim();
  if (!title || !text) throw Object.assign(new Error('제목과 내용을 입력하세요.'), { status: 400 });
  return { category: body.category, title, body: text };
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb } = await requireUser(req);
    const body: any = await req.json();

    if (body.action === 'add') {
      const content = readContent(body);
      const { data: last } = await sb.from('manuals').select('sort_order').eq('category', content.category).order('sort_order', { ascending: false }).limit(1);
      const row = { id: `mn-${Date.now().toString(36)}`, ...content, sort_order: (last?.[0]?.sort_order ?? 0) + 1 };

      await appendRow(TAB, { [H.id]: row.id, [H.category]: row.category, [H.title]: row.title, [H.body]: row.body, [H.sort_order]: row.sort_order });
      const { error } = await sb.from('manuals').upsert(row, { onConflict: 'id' });
      if (error) throw new Error(`시트에는 기록됐지만 DB 저장 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ row });
    }

    if (body.action === 'update') {
      const id = String(body.id ?? '');
      if (!id) throw Object.assign(new Error('id가 없습니다.'), { status: 400 });
      const content = readContent(body);

      const found = await updateFieldsById(TAB, id, { [H.category]: content.category, [H.title]: content.title, [H.body]: content.body });
      if (!found) throw Object.assign(new Error('시트에서 해당 메뉴얼(ID)을 찾지 못했습니다.'), { status: 404 });
      const { error } = await sb.from('manuals').update(content).eq('id', id);
      if (error) throw new Error(`시트에는 반영됐지만 DB 갱신 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ ok: true });
    }

    if (body.action === 'delete') {
      const id = String(body.id ?? '');
      if (!id) throw Object.assign(new Error('id가 없습니다.'), { status: 400 });

      const found = await deleteRowById(TAB, id);
      if (!found) throw Object.assign(new Error('시트에서 해당 메뉴얼(ID)을 찾지 못했습니다.'), { status: 404 });
      const { error } = await sb.from('manuals').delete().eq('id', id);
      if (error) throw new Error(`시트에서는 지워졌지만 DB 삭제 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ ok: true });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e) { return errorResponse(e); }
};
