import { useSyncExternalStore } from 'react';

/**
 * "저장하지 않은 변경" 저장소. 수정·삭제 모드가 켜진 표(DataTable)가 자기 변경 건수와 저장·버리기 함수를 여기에 올려 두고,
 * 화면을 옮기거나(UnsavedGuard) 창을 닫으려 할 때(beforeunload) 여기서 합계를 읽어 저장할지 묻는다.
 *   setUnsaved(id, { count, save, discard }) : 건수가 0 이면 항목을 지운다. save() 는 성공하면 true 를 돌려주는 비동기 함수.
 */
const entries = new Map();
const subscribers = new Set();
let total = 0;

function emit() {
  total = [...entries.values()].reduce((n, e) => n + e.count, 0);
  subscribers.forEach((f) => f());
}

export function setUnsaved(id, info) {
  if (info && info.count > 0) entries.set(id, info); else entries.delete(id);
  emit();
}

export function clearUnsaved(id) {
  if (entries.delete(id)) emit();
}

/** 지금 저장하지 않은 변경 건수(훅이 아닌 곳에서 읽을 때) */
export const getUnsavedTotal = () => total;

export function useUnsavedTotal() {
  return useSyncExternalStore((cb) => { subscribers.add(cb); return () => subscribers.delete(cb); }, () => total, () => 0);
}

/** 올라와 있는 변경을 모두 저장한다. 하나라도 실패하면 false. */
export async function saveAllUnsaved() {
  let ok = true;
  for (const e of [...entries.values()]) {
    if (!(await e.save())) ok = false;
  }
  return ok;
}

export function discardAllUnsaved() {
  [...entries.values()].forEach((e) => e.discard());
}
