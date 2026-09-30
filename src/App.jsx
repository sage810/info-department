import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import StaffManage from './pages/StaffManage.jsx';
import ClassManage from './pages/ClassManage.jsx';
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
        <Route path="staff" element={<Staff />} />
        <Route path="goedu/*" element={<Goedu />} />
        <Route path="devices/*" element={<Devices />} />
        <Route path="edutech" element={<Edutech />} />
        <Route path="manage/staff/*" element={<StaffManage />} />
        <Route path="manage/class/*" element={<ClassManage />} />
        <Route path="rentals/*" element={<Rentals />} />
        {isAdmin && <Route path="admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
