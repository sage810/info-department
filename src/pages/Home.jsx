import { Link } from 'react-router-dom';
import { api, useQuery, useLinks } from '../lib/data.js';
import { useAuth } from '../lib/auth.jsx';
import PageHeader from '../components/PageHeader.jsx';
import * as Ic from '../components/Icons.jsx';

const QUICK = [
  { to: '/rentals/tablet', title: '태블릿 대여 기록', desc: '빌리러 온 선생님 기록 · 반납 처리' },
  { to: '/manage/class/cabinets', title: '반별 충전함 비번', desc: '학년/반/위치/수량/비번' },
  { to: '/goedu/students', title: 'Goedu 학생 계정 찾기', desc: '학번 또는 이름으로 검색' },
  { to: '/staff', title: '교직원 연락망', desc: '부서·성함·과목·위치·내선' },
  { to: '/manuals', title: '메뉴얼', desc: 'WiFi · 노트북 · 태블릿 · 충전함 · 품의' },
  { to: '/devices/laptops/staff', title: '노트북 IP대장', desc: '교원용 · 보유 노트북' },
];

export default function Home() {
  const { profile } = useAuth();
  const rentals = useQuery(api.rentals);
  const staff = useQuery(api.staff);
  const laptops = useQuery(api.laptops);
  const cabinets = useQuery(api.tabletCabinets);
  const { data: links } = useLinks();

  const open = (rentals.data ?? []).filter((r) => !r.returned_on);
  const spareLaptops = (laptops.data ?? []).filter((l) => !l.staff_id).length;
  const studentTablets = (cabinets.data ?? []).filter((c) => !c.is_spare).reduce((a, c) => a + (c.tablet_count ?? 0), 0);
  const sheets = (links ?? []).filter((l) => l.group_name === '시트');

  return (
    <>
      <PageHeader title={`안녕하세요, ${profile?.name ?? ''} 선생님`} desc="정보부 업무를 한 화면에서. 표는 구글 시트에서 자동으로 읽어 오고, 수정은 시트에서 하면 됩니다." />

      <div className="stats">
        <Link to="/rentals/tablet" className="stat" style={{ textDecoration: 'none' }}>
          <div className="n">{rentals.loading ? '…' : open.length}</div>
          <div className="l">미반납 대여</div>
        </Link>
        <div className="stat soft"><div className="n">{staff.loading ? '…' : staff.data?.length ?? 0}</div><div className="l">교직원</div></div>
        <div className="stat soft"><div className="n">{cabinets.loading ? '…' : studentTablets}</div><div className="l">학생용 태블릿(반 보관함 합계)</div></div>
        <div className="stat soft"><div className="n">{laptops.loading ? '…' : spareLaptops}</div><div className="l">보유(예비) 노트북</div></div>
      </div>

      <section>
        <h2 className="section-title">자주 쓰는 화면</h2>
        <div className="grid">
          {QUICK.map((q) => <Link key={q.to} to={q.to} className="tile"><b>{q.title}</b><span>{q.desc}</span></Link>)}
        </div>
      </section>

      {open.length > 0 && (
        <section className="card">
          <h2 className="section-title">미반납 대여 {open.length}건</h2>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>구분</th><th>대여자</th><th>기종/품목</th><th>대여 날짜</th><th>확인자</th></tr></thead>
              <tbody>
                {open.slice(0, 8).map((r) => (
                  <tr key={r.id}>
                    <td><span className="badge purple">{r.item_type}</span></td>
                    <td>{r.borrower_name}</td>
                    <td>{[r.manufacturer, r.model, r.item_name].filter(Boolean).join(' ')}</td>
                    <td className="num">{r.rented_on}</td>
                    <td>{r.checked_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">구글 시트 바로가기</h2>
        <div className="grid">
          {sheets.map((l) => (
            <a key={l.key} className="tile" href={l.url} target="_blank" rel="noopener noreferrer">
              <b style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Ic.External width="14" height="14" />{l.label}</b>
              <span>{l.memo}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
