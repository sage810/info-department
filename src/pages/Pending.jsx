import { useAuth } from '../lib/auth.jsx';
import * as Ic from '../components/Icons.jsx';

/** 로그인은 했지만 아직 관리자 승인이 나지 않은 사용자 */
export default function Pending() {
  const { user, logout, refreshProfile } = useAuth();
  return (
    <div className="auth">
      <div className="card fade">
        <h1>승인 대기 중</h1>
        <p className="sub"><b>{user?.email}</b> 계정은 아직 관리자 승인이 나지 않았습니다. 정보과학부(내선 739)에 승인을 요청해 주세요.</p>
        <div className="badge-info"><Ic.Info width="16" height="16" />승인이 끝나면 이 화면에서 "다시 확인"을 누르면 바로 들어갈 수 있습니다.</div>
        <button type="button" className="btn btn-primary" onClick={refreshProfile}><Ic.Refresh />다시 확인</button>
        <button type="button" className="btn btn-secondary" onClick={logout}>다른 계정으로 로그인</button>
      </div>
    </div>
  );
}
