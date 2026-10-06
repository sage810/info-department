import { createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
export function SheetButton({ tab, label = '시트에서 열기', className = 'btn btn-secondary' }) {
  return <LinkButton linkKey={`sheet:${tab}`} label={label} className={className} />;
}

/** titleAside: 제목 글자 바로 옆에 붙일 요소(예: 시트 버튼). sheetTab 은 오른쪽 끝에 붙는다. */
export default function PageHeader({ title, desc, sheetTab, titleAside, children }) {
  return (
    <div className="page-head head-center">
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
 * 위치 제목줄("태블릿 › 학생 대여")을 TabCard 가 컨텍스트로 내려 주고, 도구줄 카드 안(DataTable·InventoryOverview 등)이
 * <TabCrumb /> 로 꺼내 그린다. TabCard 밖에서는 아무것도 그리지 않는다.
 */
const TabCrumbContext = createContext(null);
export function TabCrumb() {
  const c = useContext(TabCrumbContext);
  return c ? <h2 className="crumb">{c}</h2> : null;
}

/**
 * 폴더 탭 (라우트 기반 카테고리). 큰 단위는 폴더 탭(아이콘+이름), 선택한 탭의 하위 분류는 그 탭과 이어진 상자 안의
 * 밑줄 글자 탭이다. 하위가 없으면 상자를 만들지 않고(nosub) 바로 아래 내용 카드가 탭에 붙는다.
 *  items: [{ to, label, icon?(컴포넌트), end? }]   sub: [{ to, label, end? }] | null
 */
export function FolderTabs({ items, sub = null, label = '카테고리' }) {
  return (
    <div className={`folder${sub ? '' : ' nosub'}`}>
      <nav className="ftabs" aria-label={label}>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `ftab${isActive ? ' active' : ''}`}>
            {it.icon && <it.icon />}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      {sub && (
        <div className="fpanel">
          <nav className="utabs" aria-label="하위 분류">
            {sub.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `utab${isActive ? ' active' : ''}`}>{it.label}</NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

/**
 * 폴더 탭 + 그 아래 내용. 탭 아래에는 카드가 이 순서로 놓인다: [하위 탭 상자] → 도구줄 카드(위치 제목줄 + 도구줄) → 표 카드.
 * 하위 탭이 없으면 도구줄 카드가 탭에 바로 붙는다. 표는 도구줄 카드와 따로 둔다.
 *  items/sub 는 FolderTabs 와 같다. items 의 short 가 있으면 제목줄에는 그 짧은 이름을 쓴다.
 */
export function TabCard({ items, sub = null, label, children }) {
  const { pathname } = useLocation();
  const on = (it) => (it.end ? pathname === it.to : pathname === it.to || pathname.startsWith(`${it.to}/`));
  const l1 = items.find(on);
  const l2 = sub?.find(on);
  const up = l1 ? (l1.short ?? l1.label) : '';
  const crumb = up ? (l2 ? <><span className="up">{up}</span><span className="sep" aria-hidden="true">›</span><span>{l2.label}</span></> : <span>{up}</span>) : null;
  return (
    <>
      <FolderTabs items={items} sub={sub} label={label} />
      <TabCrumbContext.Provider value={crumb}>
        <section className="tabcard" aria-label={l2 ? `${up} ${l2.label}` : up || undefined}>{children}</section>
      </TabCrumbContext.Provider>
    </>
  );
}
