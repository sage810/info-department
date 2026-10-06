import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { useLinks } from '../lib/data.js';
import { GUIDE_TAB } from '../../shared/sheet-schema.js';
import * as Ic from './Icons.jsx';
import UnsavedGuard from './UnsavedGuard.jsx';
import { SyncChip, SyncBanner, useSyncStatus } from './SyncStatus.jsx';

// 홈 메뉴는 따로 두지 않는다: 왼쪽 위 "정보부 업무 관리"(브랜드)를 누르면 홈으로 간다.
// 순서(사용자 지정): 대여 → 반별 관리 → A/S → 전자기기 → Goedu → 에듀테크 → 학교 정보 → 메뉴얼 (관리자는 맨 끝).
// 홈의 시트 바로가기 영역 줄 순서(Home.jsx 의 AREA_ORDER)도 이 순서를 따른다.
const MENU = [
  { to: '/rentals', label: '대여' },
  { to: '/manage/class', label: '반별 관리' },
  { to: '/as', label: 'A/S' },
  { to: '/devices', label: '전자기기' },
  { to: '/goedu', label: 'Goedu' },
  { to: '/edutech', label: '에듀테크' },
  { to: '/staff', label: '학교 정보' },
  { to: '/manuals', label: '메뉴얼' },
];

/**
 * 상단: 어두운 띠(사용자·로그아웃, 오른쪽 정렬) 위에 흰 카드(브랜드 + 주 메뉴)를 얹는다. 좌측 사이드바는 없다.
 * 폭이 좁으면(≤1000px, 메뉴 9개) 메뉴가 카드 오른쪽 둥근 버튼(햄버거)으로 접혀 아래로 펼쳐진다.
 */
export default function Layout() {
  const { profile, logout, isAdmin, isDemo } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const headRef = useRef(null);
  const toggleRef = useRef(null);
  const guideLink = useLinks().link(`sheet:${GUIDE_TAB}`); // 구글 시트의 "안내" 탭 주소(링크 탭의 sheet:안내)
  const sync = useSyncStatus(!isDemo); // 실제 모드: 시트 동기화 상태·"지금 동기화"

  useEffect(() => { setOpen(false); }, [pathname]); // 이동하면 접는다
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } };
    const onDown = (e) => { if (headRef.current && !headRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <header className="topbar" ref={headRef}>
        <div className="topbar-strip">
          {!isDemo && <SyncChip sync={sync} />}
          <span className="user"><b>{profile?.name ?? profile?.email}</b>{isAdmin ? ' · 관리자' : ''}</span>
          {guideLink && (
            <a className="btn sm btn-toggle strip-btn" href={guideLink.url} target="_blank" rel="noopener noreferrer" aria-label="구글 시트 열기 (새 탭에서 열림, 안내 탭)" title="구글 시트의 안내 탭으로 이동">
              <Ic.Sheet /><span className="strip-label">구글 시트</span>
            </a>
          )}
          <button type="button" className="btn sm btn-toggle logout-btn" onClick={logout}><Ic.Logout />로그아웃</button>
        </div>
        <div className="topbar-card">
          <div className="brand-wrap">
            <Link to="/" className="brand">
              <span className="logo"><Ic.Laptop width="16" height="16" /></span>
              정보부 업무 관리
            </Link>
            {isDemo && <span className="mode-badge" title="Supabase 환경변수가 없어 데모 데이터로 동작 중">데모</span>}
          </div>
          <nav id="main-nav" className={`topnav${open ? ' open' : ''}`} aria-label="주 메뉴"
            onClick={(e) => { if (e.target.closest('a')) setOpen(false); }}>
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>{m.label}</NavLink>
            ))}
            {isAdmin && <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>관리자</NavLink>}
          </nav>
          <button type="button" ref={toggleRef} className="nav-toggle" onClick={() => setOpen((o) => !o)}
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open} aria-controls="main-nav">
            {open ? <Ic.Close width="22" height="22" /> : <Ic.Menu width="22" height="22" />}
          </button>
        </div>
      </header>

      <UnsavedGuard />
      <main id="main" tabIndex={-1} className="main">
        <div className="content fade">
          {!isDemo && <SyncBanner run={sync.run} isAdmin={isAdmin} />}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
