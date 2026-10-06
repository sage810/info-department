import { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useUnsavedTotal, saveAllUnsaved, discardAllUnsaved } from '../lib/unsaved.js';

/**
 * 저장하지 않은 표 변경이 있는 채로 화면을 옮기면(메뉴·탭·뒤로 가기 등) 저장할지 묻는다. 창을 닫거나 새로고침하면 브라우저 기본 경고가 뜬다.
 * 같은 화면 안에서 쓰는 쪽(Layout)에 한 번만 둔다. 데이터 라우터(createBrowserRouter)가 필요하다.
 */
export default function UnsavedGuard() {
  const total = useUnsavedTotal();
  const totalRef = useRef(0);
  totalRef.current = total;
  const blocker = useBlocker(useCallback(
    ({ currentLocation, nextLocation }) => totalRef.current > 0 && currentLocation.pathname !== nextLocation.pathname,
    [],
  ));

  useEffect(() => {
    if (total <= 0) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [total > 0]);

  if (blocker.state !== 'blocked') return null;
  return (
    <ConfirmDialog title="저장하지 않은 변경이 있습니다" onCancel={() => blocker.reset()}
      actions={[
        { label: '저장', variant: 'primary', onClick: async () => { const ok = await saveAllUnsaved(); if (ok) blocker.proceed(); else blocker.reset(); } },
        { label: '저장하지 않고 이동', variant: 'danger', onClick: () => { discardAllUnsaved(); blocker.proceed(); } },
        { label: '계속 편집', onClick: () => blocker.reset() },
      ]}>
      {`${total}건의 변경이 아직 저장되지 않았습니다.\n저장하지 않고 이동하면 이 변경은 사라집니다.`}
    </ConfirmDialog>
  );
}
