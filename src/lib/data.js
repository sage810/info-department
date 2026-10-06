/**
 * 데이터 API — 화면은 여기만 부른다.
 *  - 데모 모드: src/data/demo.js 를 시작값으로 삼아 표마다 localStorage 에 덮어쓴다(그래야 셀 편집이 남는다).
 *    학급만 이 앱에서 직접 고치는 화면이 없어 정적 값을 그대로 쓴다.
 *  - Supabase 모드: 0001_schema.sql 의 v_* 뷰를 읽는다. 쓰기(대여·메뉴얼·셀 편집)는 Netlify 함수(시트 먼저, DB 다음).
 *  구현은 src/lib/api/ 에 있다(demo.js · supabase.js · 공용 common.js · 날짜 기록 칸 asLogs.js). 여기는 모드에 맞는 API 를 고르고 공용 훅을 둔다.
 */
import { useCallback, useEffect, useState } from 'react';
import { isDemo } from './supabase.js';
import { demoApi } from './api/demo.js';
import { supaApi } from './api/supabase.js';
import { withAsLogs } from './api/asLogs.js';

export { today } from './api/common.js';

/* ---------------- 공용 훅 ---------------- */
// 떠 있는 useQuery 들의 reload. 시트 동기화로 DB 가 바뀐 뒤 화면 데이터를 한꺼번에 다시 읽는 데 쓴다.
const refreshers = new Set();
export const refreshAllData = () => refreshers.forEach((f) => f());

export function useQuery(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => { refreshers.add(reload); return () => { refreshers.delete(reload); }; }, [reload]);
  return { ...state, reload };
}

// 날짜 기록 칸(비고·HDMI·LAN·A/S 기록)은 AS기록 탭의 행이라 두 모드 모두 같은 감싸개를 거친다
export const api = withAsLogs(isDemo ? demoApi : supaApi);

/* ---------------- 링크 헬퍼 ---------------- */
export function useLinks() {
  const q = useQuery(api.links);
  const byKey = Object.fromEntries((q.data ?? []).map((l) => [l.key, l]));
  return { ...q, byKey, link: (key) => byKey[key] ?? null };
}
