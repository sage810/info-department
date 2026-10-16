/**
 * POST /.netlify/functions/row
 *   { action: 'add',    table, values: { 열key: 입력문자열 } }
 *   { action: 'delete', table, id }
 * 표 화면의 "추가 / 삭제" 버튼용 범용 함수. shared/sheet-schema.js 의 CRUD_TABLES 에 있는 표만 받는다.
 * 대여·셀 편집과 같은 규칙: 시트에 먼저 쓰고, 성공하면 DB 에 반영한다(동기화가 시트 기준으로 DB 를 통째 교체하므로).
 *
 * 삭제 때 따라 지워지는 것(DB 의 on delete 규칙과 같게 맞춘다):
 *   devices → 개별 장비(device_units)가 연결돼 있으면 삭제를 거절한다(자동으로 지우지 않음).
 *   staff → goedu_teacher_accounts(cascade): 시트의 교사goedu 탭 행도 같이 지운다.
 *           그 밖의 표(노트북 사용자·대여 확인자 등)에 적힌 이름은 시트에 그대로 남고, DB 에선 연결만 끊긴다(set null).
 *           다음 동기화 때 "못 찾음" 안내가 problems 에 뜰 수 있지만 오류는 아니다.
 *   students → goedu_student_accounts·cyber_guardians(cascade): 시트의 학생goedu·사이버지킴이 탭 행도 같이 지운다. 대여의 학생 연결은 set null.
 *
 * devices(보유 묶음)·device_units(개별 장비)는 분류별 탭에 나뉘어 있다: 추가는 그 분류의 탭 끝에, 삭제는 그 행이 있는 탭에서 한다(lib/device-tabs.mts).
 */
import { appendRow, deleteRowById } from '../lib/google-sheets.mts';
import { requireUser, waitForSync, selectAll, json, errorResponse } from '../lib/supabase-admin.mts';
import { byTable, CRUD_TABLES, prepareNewRow, deviceTab } from '../../shared/sheet-schema.js';
import { unitPlaceForNew, unitTabsToSearch, deviceTabsToSearch, firstTabThatHas } from '../lib/device-tabs.mts';

const bad = (msg: string, status = 400) => Object.assign(new Error(msg), { status });

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { sb } = await requireUser(req);
    await waitForSync(sb); // 시트 동기화가 도는 중이면 끝난 뒤에 쓴다
    const body: any = await req.json();
    const t = byTable[body.table];
    if (!t || !CRUD_TABLES[body.table]) throw bad('이 표는 추가·삭제를 지원하지 않습니다.');

    if (body.action === 'add') {
      const existing = await selectAll(sb, body.table); // 겹침 검사용 — 1000행이 넘어도 전부
      // 참조 열(성함·학번·학년-반)을 풀 부모 표들 — cell.mts 와 같은 조회
      const [staff, students, classrooms] = await Promise.all([
        selectAll(sb, 'staff', 'id,name'),
        selectAll(sb, 'students', 'id,school_year,grade,class_no,number'),
        selectAll(sb, 'classrooms', 'id,school_year,grade,class_no'),
      ]);
      const lookups = { staff, students, classrooms };
      const { row, sheet, error } = prepareNewRow(body.table, body.values, existing, lookups);
      if (error || !row) throw bad(error ?? '입력을 확인하세요.');

      // 개별 장비: 종류(묶음의 분류 또는 화면이 보낸 종류)로 탭을 정하고, 종류를 행에도 적는다(시트에는 열이 없음 — 탭이 곧 종류)
      let tab = t.tab;
      if (body.table === 'device_units') { const place = await unitPlaceForNew(sb, row.batch_id, body.values?.category); row.category = place.category; tab = place.tab; }
      if (body.table === 'devices') tab = deviceTab(String(row.item_category ?? ''));
      // 1) 시트 — 머리글 이름으로 칸을 맞춰 한 줄 추가(참조 열은 사람이 적은 자연키 그대로)
      await appendRow(tab, sheet);
      // 2) DB
      const { error: dbErr } = await sb.from(body.table).upsert(row, { onConflict: 'id' });
      if (dbErr) throw new Error(`시트에는 추가됐지만 DB 저장 실패: ${dbErr.message} (다음 동기화 때 반영됩니다)`);
      return json({ row });
    }

    if (body.action === 'delete') {
      const id = String(body.id ?? '');
      if (!id) throw bad('id가 없습니다.');

      // 묶음은 개별 장비가 연결돼 있으면 지우지 않는다(개별 장비는 묶음 ID 를 글자로만 갖고 있어 지우면 고아가 된다)
      if (body.table === 'devices') {
        const { count } = await sb.from('device_units').select('id', { count: 'exact', head: true }).eq('batch_id', id);
        if (count) throw bad(`이 묶음에 개별 장비가 ${count}대 연결돼 있어 지울 수 없습니다. 개별 장비를 먼저 삭제하세요.`);
        const { count: cabs } = await sb.from('tablet_cabinets').select('id', { count: 'exact', head: true }).eq('batch_id', id);
        if (cabs) throw bad(`이 묶음을 쓰는 태블릿 충전함이 ${cabs}대 있어 지울 수 없습니다. 충전함의 묶음을 먼저 바꾸거나 비우세요.`);
      }
      // 연쇄: 이 교직원의 Goedu 교사 계정 행(시트)을 먼저 지운다
      if (body.table === 'staff') {
        const { data: accounts } = await sb.from('goedu_teacher_accounts').select('id').eq('staff_id', id);
        for (const a of accounts ?? []) await deleteRowById(byTable.goedu_teacher_accounts.tab, a.id);
      }
      // 연쇄: 이 학생의 Goedu 학생 계정·사이버 지킴이 행(시트)을 먼저 지운다. 대여 기록은 시트에 학번 글자로 남고 DB 에선 연결만 끊긴다.
      if (body.table === 'students') {
        for (const child of ['goedu_student_accounts', 'cyber_guardians']) {
          const { data: rows } = await sb.from(child).select('id').eq('student_id', id);
          for (const r of rows ?? []) await deleteRowById(byTable[child].tab, r.id);
        }
      }
      // 1) 시트
      const found = body.table === 'device_units' ? await firstTabThatHas(await unitTabsToSearch(sb, id), (tab) => deleteRowById(tab, id))
        : body.table === 'devices' ? await firstTabThatHas(await deviceTabsToSearch(sb, id), (tab) => deleteRowById(tab, id))
        : await deleteRowById(t.tab, id);
      if (!found) throw bad('시트에서 해당 행(ID)을 찾지 못했습니다. 이미 지워졌거나 시트와 DB 가 어긋나 있을 수 있습니다.', 404);
      // 2) DB (자식 표는 FK 규칙대로 따라간다)
      const { error } = await sb.from(body.table).delete().eq('id', id);
      if (error) throw new Error(`시트에서는 지워졌지만 DB 삭제 실패: ${error.message} (다음 동기화 때 반영됩니다)`);
      return json({ ok: true });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e) { return errorResponse(e); }
};
