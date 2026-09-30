import { api, useQuery } from '../lib/data.js';
import PageHeader from '../components/PageHeader.jsx';
import * as Ic from '../components/Icons.jsx';

export default function Edutech() {
  const { data, loading } = useQuery(api.links);
  const list = (data ?? []).filter((l) => l.group_name === '에듀테크');
  return (
    <>
      <PageHeader title="에듀테크" desc="학교에서 쓰는 에듀테크 도구 바로가기. 목록은 시트의 링크 탭(그룹: 에듀테크)에서 관리합니다." sheetTab="링크" />
      <div className="grid">
        {loading && <div className="muted">불러오는 중…</div>}
        {list.map((l) => (
          <a key={l.key} className="tile" href={l.url} target="_blank" rel="noopener noreferrer">
            <b style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Ic.External width="14" height="14" />{l.label}</b>
            <span>{l.memo}</span>
          </a>
        ))}
      </div>
    </>
  );
}
