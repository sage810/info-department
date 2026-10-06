/** 데모 모드 첨부파일 저장소 — 파일 본문은 크기 때문에 localStorage 가 아니라 IndexedDB 에 둔다. */
const DB = 'infodept.demo.files';
const STORE = 'files';

function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const d = await db();
  try {
    return await new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { d.close(); }
}

export const putDemoFile = (id, blob) => run('readwrite', (s) => s.put(blob, id));
export const getDemoFile = (id) => run('readonly', (s) => s.get(id));
export const deleteDemoFiles = (ids) => run('readwrite', (s) => { ids.forEach((id) => s.delete(id)); });
