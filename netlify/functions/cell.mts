/**
 * POST /.netlify/functions/cell
 *   { table, id, field, value }
 * 표에서 셀 하나를 눌러 고칠 때 쓰는 범용 함수. 어느 표든 shared/sheet-schema.js 의 정의를 보고
 * 시트에 먼저 쓰고(대여·메뉴얼과 같은 규칙) DB 에 반영한다.
 *   - value 는 항상 사람이 입력한 문자열. 열의 type 에 따라 정수·날짜로 바꾸고,
 *     ref 열이면 자연키(성함/학번/학년-반)를 부모 테이블의 id 로 찾는다.
 *   - refKey 가 있는 열(예: 대여자 성함)은 자연키 텍스트 자체를 저장하고, 찾은 id 는 refKey 에 곁들여 넣는다
 *     (못 찾아도 에러 아님 — 교직원이 아닌 사람도 대여자가 될 수 있다).
 *   - refKey 가 없는 순수 ref 열(사용자, 확인자 등)은 반드시 찾아야 하고, 못 찾으면 에러.
 *   - 보유 묶음(devices)·개별 장비(device_units)는 분류별 탭에 나뉘어 있어, 그 행이 있는 탭에서 고친다(lib/device-tabs.mts).
 *     행을 다른 분류 탭으로 보내게 되는 수정(장비의 묶음 바꾸기·묶음의 분류 바꾸기)은 막는다 — 시트에서 줄을 옮겨야 하기 때문.
 */
import { updateFieldsById } from '../lib/google-sheets.mts';
import { requireUser, waitForSync, selectAll, json, errorResponse } from '../lib/supabase-admin.mts';
import { byTable, findEditableColumn, resolveRef, refHint, SCHOOL_YEAR } from '../../shared/sheet-schema.js';
import { batchCategory, unitCategory, unitTabsToSearch, deviceTabsToSearch, firstTabThatHas } from '../lib/device-tabs.mts';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb } = await requireUser(req);
    await waitForSync(sb); // 시트 동기화가 도는 중이면 끝난 뒤에 쓴다
    const { table, id, field, value } = await req.json() as { table: string; id: string; field: string; value: string };

    const t = byTable[table];
    if (!t) throw Object.assign(new Error(`알 수 없는 표: ${table}`), { status: 400 });
    const col = findEditableColumn(table, field);
    if (!col) throw Object.assign(new Error('이 셀은 고칠 수 없습니다.'), { status: 400 });
    if (!id) throw Object.assign(new Error('id가 없습니다.'), { status: 400 });

    const text = String(value ?? '').trim();

    // 개별 장비 탭 구조를 깨는 수정은 막는다(동기화가 어긋난 종류의 줄을 건너뛰어 화면에서 사라진다)
    if (table === 'device_units' && field === 'batch_id') {
      // 묶음 ID 는 비워도 된다(묶음 연결 해제). 적으면 이 장비와 같은 종류의 묶음이어야 한다
      if (text) {
        const [now, next] = await Promise.all([unitCategory(sb, id), batchCategory(sb, text)]);
        if (!next) throw Object.assign(new Error(`묶음 "${text}" 을(를) 찾지 못했습니다. 보유_* 탭의 ID 와 똑같이 입력하거나 비워 두세요.`), { status: 400 });
        if (now && next !== now) throw Object.assign(new Error(`다른 종류(${now} → ${next})의 묶음으로는 바꿀 수 없습니다. 시트에서 이 장비 줄을 ${next} 개별 장비 탭으로 옮기세요.`), { status: 400 });
      }
    }
    if (table === 'devices' && field === 'item_category') {
      const { data: cur } = await sb.from('devices').select('item_category').eq('id', id).maybeSingle();
      if ((cur?.item_category ?? '') !== text) {
        throw Object.assign(new Error('물품 분류명은 앱에서 바꿀 수 없습니다. 보유_* 시트에서 이 묶음 줄을 새 분류의 탭으로 옮기고(개별 장비가 있으면 그 줄들도 새 분류의 전자기기_개별_* 탭으로) 동기화하세요.'), { status: 400 });
      }
    }

    const db: Record<string, unknown> = {};
    let sheetValue: unknown = text;
    let displayValue: unknown = text;

    if (col.ref) {
      // 학번·학년-반 해석에 필요한 학년도: 이 행이 이미 가진 값을 먼저 본다
      let year = SCHOOL_YEAR;
      if (t.columns.some((c: any) => c.key === 'school_year')) {
        const { data: row } = await sb.from(table).select('school_year').eq('id', id).maybeSingle();
        if (row?.school_year) year = row.school_year;
      }
      const [staff, students, classrooms] = await Promise.all([
        selectAll(sb, 'staff', 'id,name'),
        selectAll(sb, 'students', 'id,school_year,grade,class_no,number'),
        selectAll(sb, 'classrooms', 'id,school_year,grade,class_no'),
      ]);
      const resolvedId = resolveRef(col.ref, text, year, { staff, students, classrooms });

      if (col.refKey) {
        // 자연키 텍스트 자체를 저장하는 열(대여자 성함 등) — 못 찾아도 괜찮다
        db[col.key] = text || null;
        db[col.refKey] = resolvedId;
      } else {
        // 순수 ref 열(사용자, 확인자 등) — 반드시 찾아야 한다
        if (text && !resolvedId) throw Object.assign(new Error(`"${text}" 을(를) 찾지 못했습니다. ${refHint(col.ref)}`), { status: 400 });
        db[col.key] = resolvedId;
      }
      sheetValue = text; // 시트에는 사람이 적는 자연키 그대로
      displayValue = text;
    } else if (col.type === 'int') {
      const n = text === '' ? null : parseInt(text.replace(/[^\d-]/g, ''), 10);
      if (text !== '' && Number.isNaN(n)) throw Object.assign(new Error('숫자만 입력하세요.'), { status: 400 });
      db[col.key] = n; sheetValue = n ?? ''; displayValue = n;
    } else if (col.type === 'date') {
      if (text && !/^\d{4}-\d{2}-\d{2}$/.test(text)) throw Object.assign(new Error('날짜는 YYYY-MM-DD 형식으로 입력하세요.'), { status: 400 });
      db[col.key] = text || null; sheetValue = text; displayValue = text;
    } else {
      db[col.key] = text || null; sheetValue = text; displayValue = text;
    }

    const write = (tab: string) => updateFieldsById(tab, id, { [col.header]: sheetValue });
    const found = table === 'device_units' ? await firstTabThatHas(await unitTabsToSearch(sb, id), write)
      : table === 'devices' ? await firstTabThatHas(await deviceTabsToSearch(sb, id), write)
      : await write(t.tab);
    if (!found) throw Object.assign(new Error('시트에서 해당 행(ID)을 찾지 못했습니다.'), { status: 404 });
    const { error } = await sb.from(table).update(db).eq('id', id);
    if (error) throw new Error(`시트에는 반영됐지만 DB 갱신 실패: ${error.message} (다음 동기화 때 반영됩니다)`);

    return json({ ok: true, value: displayValue });
  } catch (e) { return errorResponse(e); }
};
