import { Link } from 'react-router-dom';
import { useLinks } from '../lib/data.js';
import { useAuth } from '../lib/auth.jsx';
import PageHeader from '../components/PageHeader.jsx';
import * as Ic from '../components/Icons.jsx';
import { TABLES, TAB_GROUPS, GUIDE_TAB } from '../../shared/sheet-schema.js';

const TAB_LABEL = Object.fromEntries(TABLES.map((t) => [t.tab, t.label]));
const OTHER_COLOR = '#9AA0A6';
// 시트 영역 줄 순서 = 상단 메뉴 순서(Layout.jsx MENU: 대여 → 반별 관리 → A/S → 전자기기 → Goedu → 에듀테크 → 학교 정보 → 메뉴얼).
// 영역 이름은 메뉴 이름과 1:1 이 아니라서(대여·에듀테크·메뉴얼 탭은 "운영" 영역) 메뉴가 처음 나오는 자리를 따른다. 목록에 없는 영역은 그 뒤.
const AREA_ORDER = ['운영', '반별 관리', '전자기기', 'Goedu', '학교 정보'];
const areaRank = (name) => { const i = AREA_ORDER.indexOf(name); return i < 0 ? AREA_ORDER.length : i; };

/** 새 탭으로 열리는 바깥 링크 알약(업무 관리 사이트·시트 바로가기 공용). title 은 마우스를 올렸을 때 나오는 설명. */
function LinkChip({ href, title, children }) {
  return (
    <a className="link-chip" href={href} target="_blank" rel="noopener noreferrer" title={title}>
      {children}<Ic.External width="12" height="12" aria-hidden="true" /><span className="sr-only"> (새 탭에서 열림)</span>
    </a>
  );
}

/** 시트 링크(키 `sheet:<탭 이름>`)를 시트 탭 영역(TAB_GROUPS)별로 묶는다. 영역에 없는 링크는 맨 아래 "기타"에 모아 사라지지 않게 한다. */
function groupSheetLinks(sheets) {
  const tabOf = (l) => String(l.key ?? '').replace(/^sheet:/, '');
  const byTab = new Map(sheets.map((l) => [tabOf(l), l]));
  const rows = [...TAB_GROUPS].sort((a, b) => areaRank(a.name) - areaRank(b.name)).map((g) => ({ name: g.name, color: g.color, links: g.tabs.filter((t) => byTab.has(t)).map((t) => ({ tab: t, link: byTab.get(t) })) }));
  const known = new Set(TAB_GROUPS.flatMap((g) => g.tabs));
  // 안내 탭은 상단 바의 "구글 시트" 버튼이 열어 주므로 여기선 뺀다
  const other = sheets.filter((l) => !known.has(tabOf(l)) && tabOf(l) !== GUIDE_TAB).map((l) => ({ tab: tabOf(l) || l.label, link: l }));
  if (other.length) rows.push({ name: '기타', color: OTHER_COLOR, links: other });
  return rows.filter((r) => r.links.length);
}

export default function Home() {
  const { profile } = useAuth();
  const { data: links } = useLinks();

  const works = (links ?? []).filter((l) => l.group_name === '업무 관리');
  const sheetRows = groupSheetLinks((links ?? []).filter((l) => l.group_name === '시트'));

  return (
    <>
      <PageHeader title={`안녕하세요, ${profile?.name ?? ''} 선생님`} />

      <section className="card">
        <h2 className="section-title section-title-center">대여</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/rentals/new" className="btn btn-primary"><Ic.Plus />대여하기</Link>
          <Link to="/rentals/return" className="btn btn-secondary"><Ic.Check />반납하기</Link>
        </div>
      </section>

      {works.length > 0 && (
        <section className="card">
          <h2 className="section-title section-title-center">업무 관리 사이트 바로가기</h2>
          <div className="link-chips" style={{ '--c': 'var(--purple)' }}>
            {works.map((l) => <LinkChip key={l.key} href={l.url} title={l.memo}>{l.label}</LinkChip>)}
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="section-title section-title-center">구글 시트 바로가기</h2>
        {/* 영역(시트 탭 색과 같은 색)마다 한 줄: 왼쪽 영역 이름, 오른쪽 그 영역의 탭 이름 알약 */}
        <ul className="sheet-rows">
          {sheetRows.map((r) => (
            <li key={r.name} className="sheet-row" style={{ '--c': r.color }}>
              <h3><span className="sheet-dot" aria-hidden="true" />{r.name}</h3>
              <div className="link-chips">
                {r.links.map(({ tab, link }) => (
                  <LinkChip key={link.key} href={link.url} title={TAB_LABEL[tab] ?? link.memo}>{tab}</LinkChip>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
