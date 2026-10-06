import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, useQuery } from '../lib/data.js';
import PageHeader, { TabCard } from '../components/PageHeader.jsx';
import DataTable, { ChipToggle } from '../components/DataTable.jsx';
import * as Ic from '../components/Icons.jsx';

// 에듀테크: 반별 관리와 같은 디자인(폴더 탭 → 도구줄 카드 → 함께 볼 정보 띠 → 표). 카테고리는 구독 에듀테크 / 기타 에듀테크.
const TABS = [
  { to: '/edutech/subscribed', label: '구독 에듀테크', icon: Ic.Receipt },
  { to: '/edutech/other', label: '기타 에듀테크', icon: Ic.Sparkle },
];
const CATEGORY = { subscribed: '구독', other: '기타' }; // 시트 "구분" 열의 값

export default function Edutech() {
  return (
    <>
      <PageHeader title="에듀테크" />
      <TabCard items={TABS}>
        <Routes>
          <Route index element={<Navigate to="subscribed" replace />} />
          <Route path="subscribed" element={<Items category={CATEGORY.subscribed} />} />
          <Route path="other" element={<Items category={CATEGORY.other} />} />
          <Route path="*" element={<Navigate to="subscribed" replace />} />
        </Routes>
      </TabCard>
    </>
  );
}

// 함께 볼 정보: 사이트 주소는 이름을 눌러 이동하므로 평소엔 숨기고, 고치려는 사람이 칩으로 켠다.
const EXTRA = [
  { key: 'url', header: '사이트 주소' },
  { key: 'expires_on', header: '사용 기한' },
  { key: 'price', header: '가격' },
  { key: 'memo', header: '기타' },
];

function Items({ category }) {
  const q = useQuery(api.edutechItems);
  const [on, setOn] = useState({});
  const cols = [
    {
      key: 'name', header: '에듀테크 이름', editable: true,
      // 이름을 누르면 그 에듀테크 사이트로 이동. 수정 중에는 셀을 눌러 이름을 고쳐야 하므로 링크가 아니라 글자로 보인다.
      render: (r, { editing }) => (!editing && r.url
        ? <a className="ext-link" href={r.url} target="_blank" rel="noopener noreferrer">{r.name}<Ic.External width="13" height="13" /></a>
        : r.name),
    },
    { key: 'shared_id', header: '공용 아이디', className: 'mono', editable: true },
    { key: 'password', header: '비밀번호', className: 'mono', editable: true },
    { key: 'guide', header: '안내사항', editable: true },
    ...EXTRA.filter((c) => on[c.key]).map((c) => ({ key: c.key, header: c.header, editable: true, className: c.key === 'expires_on' ? 'num date' : undefined })),
  ];
  return (
    <DataTable columns={cols} rows={q.data} loading={q.loading} error={q.error} filter={(r) => r.category === category}
      searchKeys={['name', 'shared_id', 'guide', 'memo', 'price']} searchPlaceholder="예: Padlet" wideSearch
      table="edutech_items" reload={q.reload} sheetTab="에듀테크" sheetInTop showCount={false}
      tableTop={<ChipToggle options={EXTRA} on={on} onChange={setOn} />}
      emptyText={`${category} 에듀테크가 없습니다. '추가'로 새로 만들 수 있습니다.`}
      crud={{ add: true, edit: true, remove: true, required: ['name'], defaults: { category }, rowLabel: (r) => r.name,
        addTitle: `${category} 에듀테크 추가`,
        fields: [
          { key: 'name', header: '에듀테크 이름', required: true },
          { key: 'url', header: '사이트 주소', hint: '예: https://padlet.com — 이름을 누르면 이 주소로 이동' },
          { key: 'shared_id', header: '공용 아이디' },
          { key: 'password', header: '비밀번호' },
          { key: 'guide', header: '안내사항' },
          { key: 'expires_on', header: '사용 기한' },
          { key: 'price', header: '가격' },
          { key: 'memo', header: '기타' },
        ],
        confirmDelete: (r) => `'${r.name}' 에듀테크를 삭제할까요?\n- 시트 원본(에듀테크 탭)에서도 이 행이 지워집니다.\n되돌릴 수 없습니다.` }} />
  );
}
