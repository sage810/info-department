import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import * as Ic from './Icons.jsx';

const MENU = [
  { to: '/', label: '홈', icon: Ic.Home, end: true },
  { sep: true },
  { to: '/manuals', label: '메뉴얼', icon: Ic.Book },
  { to: '/staff', label: '교직원 검색', icon: Ic.Users },
  { to: '/goedu', label: 'Goedu', icon: Ic.Cloud },
  { to: '/devices', label: '전자기기', icon: Ic.Laptop },
  { to: '/edutech', label: '에듀테크', icon: Ic.Sparkle },
  { to: '/manage/staff', label: '교직원별 관리', icon: Ic.UserCog },
  { to: '/manage/class', label: '반별 관리', icon: Ic.Grid },
  { to: '/rentals', label: '대여', icon: Ic.Swap },
];

const COLLAPSED_KEY = 'infodept.sidebar.collapsed';

export default function Layout() {
  const { profile, logout, isAdmin, isDemo } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { const s = localStorage.getItem(COLLAPSED_KEY); if (s !== null) return s === '1'; } catch { /* ignore */ }
    return typeof window !== 'undefined' && window.innerWidth <= 640;
  });
  useEffect(() => { try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); } catch { /* ignore */ } }, [collapsed]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="logo"><Ic.Laptop width="16" height="16" /></span>
          정보부 업무 관리
        </Link>
        {isDemo && <span className="mode-badge" title="Supabase 환경변수가 없어 데모 데이터로 동작 중">데모</span>}
        <div className="spacer" />
        <span className="user"><b>{profile?.name ?? profile?.email}</b>{isAdmin ? ' · 관리자' : ''}</span>
        <button type="button" className="btn-outline-light" onClick={logout}>로그아웃</button>
      </header>

      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} aria-label="주 메뉴">
        <nav>
          {MENU.map((m, i) => m.sep
            ? <hr key={i} className="nav-sep" />
            : (
              <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <m.icon className="ico" /><span>{m.label}</span>
              </NavLink>
            ))}
          {isAdmin && (
            <>
              <div className="nav-grow" />
              <hr className="nav-sep" />
              <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <Ic.Shield className="ico" /><span>관리자</span>
              </NavLink>
            </>
          )}
        </nav>
        <button type="button" className="sidebar-handle" onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? '메뉴 열기' : '메뉴 닫기'} aria-expanded={!collapsed}>
          {collapsed ? <Ic.ChevronRight width="16" height="16" /> : <Ic.ChevronLeft width="16" height="16" />}
        </button>
      </aside>

      <main id="main" tabIndex={-1} className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="content fade"><Outlet /></div>
      </main>
    </div>
  );
}
