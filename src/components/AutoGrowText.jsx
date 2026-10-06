import { useLayoutEffect, useRef } from 'react';

/**
 * 한 줄짜리 <input> 자리에 쓰는 텍스트 칸. 글자가 칸 너비를 넘으면 <input> 과 달리 안 보이게 가로로
 * 밀리지 않고, 자동으로 다음 줄로 넘어가며 칸이 늘어나 전체 글자가 항상 보인다(<input> 은 구조적으로
 * 줄바꿈이 안 돼서 내부는 <textarea> 로 만들고 높이를 내용에 맞춰 스스로 조절한다).
 * Enter 는 줄바꿈 대신 가장 가까운 폼을 제출한다 — 원래 <input> 의 "Enter = 제출" 동작을 그대로 유지한다.
 * value/onChange 등은 <input> 과 똑같이 쓴다.
 */
export default function AutoGrowText({ className = '', onKeyDown, ...rest }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  });
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
    onKeyDown?.(e);
  }
  return <textarea ref={ref} rows={1} className={`auto-grow ${className}`} onKeyDown={handleKeyDown} {...rest} />;
}
