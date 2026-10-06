/**
 * POST /.netlify/functions/manual
 *   { action: 'add',    category, title, body, attachments? }
 *   { action: 'update', id, category, title, body, attachments? }   attachments 를 안 보내면 첨부는 그대로
 *   { action: 'delete', id }
 * 대여와 같은 규칙: 시트(메뉴얼 탭)에 먼저 쓰고, 성공하면 DB 에 반영한다.
 * attachments: [{ id, name, size }] — 파일 본문은 브라우저가 Storage(manual-files)에 이미 올려 둔 것이고,
 * 여기서는 목록만 시트·DB 에 적는다. 목록에서 빠지거나 글이 지워지면 Storage 의 파일도 지운다.
 */
import { appendRow, updateFieldsById, deleteRowById } from '../lib/google-sheets.mts';
import { requireUser, waitForSync, json, errorResponse } from '../lib/supabase-admin.mts';
import {
  byTable, MANUAL_CATEGORIES, MAX_ATTACHMENTS, ATTACHMENT_EXTS,
  attachmentExt, isAttachmentId, cleanFileName, formatAttachments, parseAttachments,
} from '../../shared/sheet-schema.js';

const TAB = byTable.manuals.tab;
const H = Object.fromEntries(byTable.manuals.columns.filter((c: any) => c.key).map((c: any) => [c.key, c.header]));
const BUCKET = 'manual-files';
const bad = (msg: string) => Object.assign(new Error(msg), { status: 400 });

function readContent(body: any) {
  if (!MANUAL_CATEGORIES.includes(body.category)) throw bad('카테고리가 올바르지 않습니다.');
  const title = String(body.title ?? '').trim();
  const text = String(body.body ?? '').trim();
  if (!title || !text) throw bad('제목과 내용을 입력하세요.');
  return { category: body.category, title, body: text };
}

/** undefined = 첨부를 건드리지 않음, 배열 = 이 목록으로 교체 */
function readAttachments(body: any) {
  if (body.attachments === undefined) return undefined;
  const list = Array.isArray(body.attachments) ? body.attachments : [];
  if (list.length > MAX_ATTACHMENTS) throw bad(`첨부파일은 ${MAX_ATTACHMENTS}개까지 가능합니다.`);
  return list.map((a: any) => {
    const item = { id: String(a?.id ?? ''), name: cleanFileName(a?.name), size: Math.max(0, parseInt(a?.size, 10) || 0) };
    const ext = attachmentExt(item.name);
    if (!isAttachmentId(item.id) || !item.name || !ATTACHMENT_EXTS.includes(ext) || attachmentExt(item.id) !== ext) throw bad('첨부파일 정보가 올바르지 않습니다.');
    return item;
  });
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb } = await requireUser(req);
    await waitForSync(sb); // 시트 동기화가 도는 중이면 끝난 뒤에 쓴다
    const body: any = await req.json();
    const removeFiles = async (ids: string[]) => { if (ids.length) await sb.storage.from(BUCKET).remove(ids).catch(() => null); };

    if (body.action === 'add') {
      const content = readContent(body);
      const attachments = formatAttachments(readAttachments(body));
      const { data: last } = await sb.from('manuals').select('sort_order').eq('category', content.category).order('sort_order', { ascending: false }).limit(1);
      const row = { id: `mn-${Date.now().toString(36)}`, ...content, sort_order: (last?.[0]?.sort_order ?? 0) + 1, attachments };

      await appendRow(TAB, { [H.id]: row.id, [H.category]: row.category, [H.title]: row.title, [H.body]: row.body, [H.sort_order]: row.sort_order, [H.attachments]: attachments ?? '' });
      const { error } = await sb.from('manuals').upsert(row, { onConflict: 'id' });
      if (error) throw new Error(`시트에는 기록됐지만 DB 저장 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ row });
    }

    if (body.action === 'update') {
      const id = String(body.id ?? '');
      if (!id) throw bad('id가 없습니다.');
      const content = readContent(body);
      const list = readAttachments(body);
      const attachments = list === undefined ? undefined : formatAttachments(list);
      const { data: old } = await sb.from('manuals').select('attachments').eq('id', id).maybeSingle();

      const fields: Record<string, unknown> = { [H.category]: content.category, [H.title]: content.title, [H.body]: content.body };
      if (attachments !== undefined) fields[H.attachments] = attachments ?? '';
      const found = await updateFieldsById(TAB, id, fields);
      if (!found) throw Object.assign(new Error('시트에서 해당 메뉴얼(ID)을 찾지 못했습니다.'), { status: 404 });
      const { error } = await sb.from('manuals').update(attachments === undefined ? content : { ...content, attachments }).eq('id', id);
      if (error) throw new Error(`시트에는 반영됐지만 DB 갱신 실패: ${error.message} (다음 동기화 때 반영됩니다)`);

      if (list) {
        const keep = new Set(list.map((a: any) => a.id));
        await removeFiles(parseAttachments(old?.attachments).map((a) => a.id).filter((fid) => !keep.has(fid)));
      }
      return json({ ok: true });
    }

    if (body.action === 'delete') {
      const id = String(body.id ?? '');
      if (!id) throw bad('id가 없습니다.');
      const { data: old } = await sb.from('manuals').select('attachments').eq('id', id).maybeSingle();

      const found = await deleteRowById(TAB, id);
      if (!found) throw Object.assign(new Error('시트에서 해당 메뉴얼(ID)을 찾지 못했습니다.'), { status: 404 });
      const { error } = await sb.from('manuals').delete().eq('id', id);
      if (error) throw new Error(`시트에서는 지워졌지만 DB 삭제 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      await removeFiles(parseAttachments(old?.attachments).map((a) => a.id));
      return json({ ok: true });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e) { return errorResponse(e); }
};
