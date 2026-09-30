import { NavLink } from 'react-router-dom';
import { useLinks } from '../lib/data.js';
import * as Ic from './Icons.jsx';

/** 링크 테이블의 key 로 외부 링크 버튼을 만든다. 없으면 아무것도 그리지 않는다. */
export function LinkButton({ linkKey, label, className = 'btn btn-secondary', icon = 'external' }) {
  const { link } = useLinks();
  const l = link(linkKey);
  if (!l) return null;
  const Icon = icon === 'download' ? Ic.Download : Ic.External;
  return (
    <a className={className} href={l.url} target="_blank" rel="noopener noreferrer">
      <Icon />{label ?? l.label}
    </a>
  );
}

/** 시트 탭 바로가기 버튼: sheetKey 는 "sheet:탭이름" */
export function SheetButton({ tab, label = '시트에서 열기' }) {
  return <LinkButton linkKey={`sheet:${tab}`} label={label} />;
}

/** titleAside: 제목 글자 바로 옆에 붙일 요소(예: 시트 버튼). sheetTab 은 오른쪽 끝에 붙는다. */
export default function PageHeader({ title, desc, sheetTab, titleAside, children }) {
  return (
    <div className="page-head">
      <div>
        <div className="title-row"><h1>{title}</h1>{titleAside}</div>
        {desc && <p>{desc}</p>}
      </div>
      <div className="actions">
        {children}
        {sheetTab && <SheetButton tab={sheetTab} />}
      </div>
    </div>
  );
}

/**
 * 카테고리 탭 (라우트 기반).
 *  1차 탭(sub 없음): 아이콘 타일 카드. items 에 icon(컴포넌트)을 같이 주면 표시된다.
 *  2차 탭(sub=true): 기존처럼 작은 알약 한 줄 — 전자기기의 노트북/태블릿 안 하위 탭 등.
 */
export function SubTabs({ items, sub = false }) {
  if (sub) {
    return (
      <div className="pills sub">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `pill-tab${isActive ? ' active' : ''}`}>{it.label}</NavLink>
        ))}
      </div>
    );
  }
  return (
    <div className="mc-b">
      <div className="mc-grid">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `mc-tile${isActive ? ' active' : ''}`}>
            {it.icon && <it.icon />}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
