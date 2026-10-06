import { useEffect, useState } from 'react';

/** 화면 폭 조건(CSS media query 문자열)이 지금 맞는지. 폭이 바뀌면 다시 계산한다. */
export function useMediaQuery(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

/** 표 오른쪽 바깥 여백(.side-rail)에 버튼을 둘 만큼 화면이 넓은가(본문 980px + 양쪽 여백). */
export const SIDE_RAIL_QUERY = '(min-width: 1240px)';
