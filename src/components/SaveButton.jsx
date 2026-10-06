import * as Ic from './Icons.jsx';

/**
 * 저장 버튼. 누르면 잠기고(busy → disabled + aria-busy) 돌아가는 원과 "저장 중…"을 보인다. 중복 저장을 막고,
 * 스크린리더에는 "저장 중입니다."가 읽힌다. 끝나서 화면에 남아 있을 때는 done 으로 "저장됨"(초록)을 잠깐 보일 수 있다.
 * 너비(.save-btn min-width)는 상태가 바뀌어도 그대로다.
 *  busy / done: 상태. 나머지는 <button> 속성 그대로(type 은 기본 submit).
 *  size: 'sm' 이면 작은 버튼. label/busyLabel/doneLabel 로 글자를 바꾼다(기본 저장 / 저장 중… / 저장됨).
 */
export default function SaveButton({ busy = false, done = false, size, label = '저장', busyLabel = '저장 중…', doneLabel = '저장됨', type = 'submit', className = '', disabled, ...rest }) {
  return (
    <>
      <button type={type} className={`btn btn-primary save-btn${size === 'sm' ? ' sm' : ''}${done ? ' done' : ''} ${className}`.trim()}
        disabled={disabled || busy} aria-busy={busy || undefined} {...rest}>
        {busy ? <><span className="spin" aria-hidden="true" />{busyLabel}</> : done ? <><Ic.Check />{doneLabel}</> : label}
      </button>
      <span className="sr-only" role="status">{busy ? '저장 중입니다.' : done ? '저장되었습니다.' : ''}</span>
    </>
  );
}
