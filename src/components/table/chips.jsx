import * as Ic from '../Icons.jsx';

/** "함께 볼 정보" 칩 토글(Goedu 교사 가입현황, 반별 관리 3화면이 같이 쓴다). on 은 { key: boolean } 상태. */
export function ChipToggle({ label = '함께 볼 정보', options, on, onChange }) {
  return (
    <div className="chipset chipset-box" role="group" aria-label={label}>
      <span className="chipset-label">{label}</span>
      {options.map((o) => (
        <button key={o.key} type="button" className="chip" aria-pressed={!!on[o.key]} onClick={() => onChange({ ...on, [o.key]: !on[o.key] })}>
          {on[o.key] ? <Ic.Check /> : <Ic.Plus />}{o.header}
        </button>
      ))}
    </div>
  );
}

/** 학년 필터 알약 (전자기기 → 태블릿 화면에서 쓴다. 반별 관리 3화면은 이 필터 자체를 안 쓴다). */
export function GradePills({ value, onChange }) {
  return (
    <div className="chipset chipset-box" role="group" aria-label="학년 필터">
      <span className="chipset-label">학년</span>
      <div className="pills sub">
        {[0, 1, 2, 3].map((g) => (
          <button key={g} type="button" className={`pill-tab${value === g ? ' active' : ''}`} onClick={() => onChange(g)}>
            {g === 0 ? '전체' : `${g}학년`}
          </button>
        ))}
      </div>
    </div>
  );
}
