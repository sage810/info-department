import { useEffect, useId, useRef, useState } from 'react';
import * as Ic from '../Icons.jsx';
import AutoGrowText from '../AutoGrowText.jsx';
import SaveButton from '../SaveButton.jsx';
import DatePicker from '../DatePicker.jsx';
import { api } from '../../lib/data.js';
import { setUnsaved, clearUnsaved } from '../../lib/unsaved.js';
import { byTable } from '../../../shared/sheet-schema.js';
import { REF_HINT, PICK_OTHER } from './cells.jsx';

/**
 * 추가 폼. 칸 목록(fields)은 [{ key, header?, options?, other?, hint?, required? }]:
 *   - header 를 안 주면 shared 스키마의 머리글을 쓴다. 열의 종류(날짜·숫자·참조)도 스키마에서 읽는다.
 *   - options: ['삼성', ...] 또는 [[값, 글자], ...] 면 드롭다운. other 면 "기타(직접 입력)"도 붙는다.
 *   - 참조 열(성함·학번·학년-반)은 글자 칸이고 예시 안내가 placeholder 로 뜬다.
 * defaults 는 칸 없이 같이 보내는 값(예: 이 화면이 노트북 표라서 물품 분류는 늘 '노트북').
 * 저장하면 api.addRow(서버는 시트에 먼저 씀) 뒤 onSaved(새 행, 입력값).
 */
export default function AddRowForm({ table, fields, required, defaults, title = '새 행 추가', onCancel, onSaved }) {
  const uid = useId();
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const schemaCols = byTable[table]?.columns ?? [];
  const specs = fields.map((f) => ({ ...f, schemaCol: schemaCols.find((c) => c.key === f.key) })).filter((f) => f.schemaCol);

  // 저장 버튼을 누르지 않고 다른 메뉴·카테고리로 가려 하면 UnsavedGuard 가 저장할지 묻는다(적은 게 하나도 없으면 묻지 않고 그냥 넘어간다).
  const formId = useId();
  const dirty = Object.values(values).some((v) => String(v ?? '').trim() !== '');
  async function save() {
    const miss = specs.find((f) => (f.required || required.includes(f.key)) && !String(values[f.key] ?? defaults?.[f.key] ?? '').trim());
    if (miss) { setError(`'${miss.header ?? miss.schemaCol.header}' 칸을 입력하세요.`); return false; }
    setBusy(true); setError('');
    try { onSaved(await api.addRow(table, { ...defaults, ...values }), values); return true; }
    catch (err) { setError(err.message); setBusy(false); return false; }
  }
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => { setUnsaved(formId, dirty ? { count: 1, save: () => saveRef.current(), discard: () => setValues({}) } : null); }, [dirty, formId]);
  useEffect(() => () => clearUnsaved(formId), [formId]);

  async function submit(e) {
    e.preventDefault();
    await save();
  }
  return (
    <form className="card fade" onSubmit={submit}>
      <h2 className="section-title">{title}</h2>
      <div className="form-stack">
        {specs.map((f, i) => {
          const id = `${uid}-${f.key}`;
          const req = f.required || required.includes(f.key);
          const set = (v) => setValues((o) => ({ ...o, [f.key]: v }));
          return (
            <div className="field" key={f.key}>
              <label htmlFor={id}>{f.header ?? f.schemaCol.header}{req && <span aria-hidden="true"> *</span>}</label>
              {f.options ? <OptionField id={id} spec={f} value={values[f.key] ?? ''} onChange={set} required={req} />
                : f.schemaCol.type === 'date' ? <DatePicker id={id} value={values[f.key] ?? ''} onChange={(e) => set(e.target.value)} required={req} />
                : <AutoGrowText id={id} className="field-input" value={values[f.key] ?? ''} onChange={(e) => set(e.target.value)} required={req}
                    autoComplete="off" autoFocus={i === 0} placeholder={f.hint ?? (f.schemaCol.ref ? REF_HINT[f.schemaCol.ref] : undefined)}
                    inputMode={f.schemaCol.type === 'int' ? 'numeric' : undefined} />}
            </div>
          );
        })}
      </div>
      {error && <div className="badge-error" role="alert" style={{ marginTop: 12 }}><Ic.Alert width="16" height="16" />{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <SaveButton busy={busy} />
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>취소</button>
      </div>
    </form>
  );
}

/** 드롭다운 칸(+ 선택하면 직접 입력 칸이 펼쳐지는 "기타"). 값은 늘 글자 하나로 올려 보낸다. */
function OptionField({ id, spec, value, onChange, required }) {
  const pairs = spec.options.map((o) => (Array.isArray(o) ? o : [o, o]));
  const [other, setOther] = useState(false);
  return (
    <>
      <select id={id} className="field-input" value={other ? PICK_OTHER : value} required={required && !other}
        onChange={(e) => {
          if (e.target.value === PICK_OTHER) { setOther(true); onChange(''); } else { setOther(false); onChange(e.target.value); }
        }}>
        <option value="">{required ? '선택' : '— (선택 안 함)'}</option>
        {pairs.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        {spec.other && <option value={PICK_OTHER}>기타(직접 입력)</option>}
      </select>
      {other && <AutoGrowText className="field-input" style={{ marginTop: 6 }} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="직접 입력" autoComplete="off" required={required} />}
    </>
  );
}
