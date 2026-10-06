import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Pending from './pages/Pending.jsx';
import Home from './pages/Home.jsx';
import Manuals from './pages/Manuals.jsx';
import Staff from './pages/Staff.jsx';
import Goedu from './pages/Goedu.jsx';
import Devices from './pages/Devices.jsx';
import Edutech from './pages/Edutech.jsx';
import ClassManage from './pages/ClassManage.jsx';
import As from './pages/As.jsx';
import Rentals from './pages/Rentals.jsx';
import Admin from './pages/Admin.jsx';

/** 로그인 → 승인 → 앱 순서로 문을 지킨다 */
function Gate() {
  const { user, loading, isApproved, isAdmin } = useAuth();
  if (loading) return <div className="auth"><div className="muted">불러오는 중…</div></div>;
  if (!user) return <Login />;
  if (!isApproved) return <Pending />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="manuals" element={<Manuals />} />
        <Route path="staff/*" element={<Staff />} />
        <Route path="goedu/*" element={<Goedu />} />
        <Route path="devices/*" element={<Devices />} />
        <Route path="edutech/*" element={<Edutech />} />
        <Route path="as/*" element={<As />} />
        <Route path="manage/class/*" element={<ClassManage />} />
        <Route path="rentals/*" element={<Rentals />} />
        {isAdmin && <Route path="admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// 데이터 라우터를 쓴다: 저장하지 않은 표 변경이 있을 때 화면 이동(메뉴·탭·뒤로 가기)을 막고 물어보려면 useBlocker 가 필요하다(UnsavedGuard).
const router = createBrowserRouter([
  { path: '*', element: <AuthProvider><Gate /></AuthProvider> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
