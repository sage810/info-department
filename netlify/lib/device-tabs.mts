/**
 * 보유 묶음(devices)과 개별 장비(device_units)는 분류별 시트 탭에 나뉘어 적힌다(shared/sheet-schema.js DEVICE_TABS · UNIT_TABS).
 * 묶음의 탭은 자기 물품 분류명으로, 장비의 탭은 자기 묶음의 분류로 정한다. 행 추가·수정·삭제 함수(row·cell)가
 * "어느 탭을 고쳐야 하나"를 알 때 쓴다.
 */
import { DEVICE_TABS, UNIT_TABS, unitTab, deviceTab } from '../../shared/sheet-schema.js';

const bad = (msg: string, status = 400) => Object.assign(new Error(msg), { status });

/** 묶음 ID → 물품 분류명. 묶음을 못 찾으면 null */
export async function batchCategory(sb: any, batchId: unknown): Promise<string | null> {
  const id = String(batchId ?? '');
  if (!id) return null;
  const { data } = await sb.from('devices').select('item_category').eq('id', id).maybeSingle();
  return data?.item_category ?? null;
}

/** 새 장비를 적을 탭. 묶음이 없거나 그 분류에 개별 장비 탭이 없으면 사용자에게 보여 줄 오류를 던진다. */
export async function tabForNewUnit(sb: any, batchId: unknown): Promise<string> {
  const cat = await batchCategory(sb, batchId);
  if (!cat) throw bad(`묶음 "${batchId ?? ''}" 을(를) 찾지 못했습니다. 보유_* 탭의 ID 와 똑같이 입력하세요.`);
  const tab = unitTab(cat);
  if (!tab) throw bad(`"${cat}" 묶음에는 개별 장비를 적을 수 없습니다. (개별 장비 탭: ${Object.keys(UNIT_TABS).join(' · ')})`);
  return tab;
}

/** 탭 목록 앞에 first 를 두고 나머지를 뒤에 붙인다(중복 없이). */
const firstThenRest = (first: string | undefined, all: string[]) => [...(first ? [first] : []), ...all.filter((t) => t !== first)];

/**
 * 기존 장비 한 줄이 있을 만한 탭들. 그 장비 묶음의 분류 탭이 먼저고, 나머지는 시트와 DB 가 어긋난 경우를 위한 대비다
 * (보통은 첫 탭에서 찾아 시트를 한 번만 읽는다).
 */
export async function unitTabsToSearch(sb: any, unitId: string): Promise<string[]> {
  const { data: u } = await sb.from('device_units').select('batch_id').eq('id', unitId).maybeSingle();
  return firstThenRest(unitTab((await batchCategory(sb, u?.batch_id)) ?? ''), Object.values(UNIT_TABS));
}

/** 기존 묶음 한 줄이 있을 만한 탭들(자기 분류 탭이 먼저). */
export async function deviceTabsToSearch(sb: any, batchId: string): Promise<string[]> {
  const cat = await batchCategory(sb, batchId);
  return firstThenRest(cat == null ? undefined : deviceTab(cat), Object.values(DEVICE_TABS));
}

/** tabs 를 차례로 시도해 처음 성공한(true) 탭에서 멈춘다. 어디에도 없으면 false. */
export async function firstTabThatHas(tabs: string[], run: (tab: string) => Promise<boolean>): Promise<boolean> {
  for (const tab of tabs) if (await run(tab)) return true;
  return false;
}
