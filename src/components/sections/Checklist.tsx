'use client';

import { useState } from 'react';

export function Checklist({ title, items }: { title: string; items: { text: string; done: boolean }[] }) {
  const [done, setDone] = useState(items.map((i) => i.done));
  return (
    <section className="card materials-card">
      <div className="materials-head">
        <h2>{title}</h2>
        <span className="small" style={{ fontWeight: 600 }}>{done.filter(Boolean).length} из {done.length}</span>
      </div>
      {items.map((it, i) => (
        <button key={it.text} type="button" className="check-row" onClick={() => setDone(done.map((v, k) => (k === i ? !v : v)))} aria-pressed={done[i]}>
          <span className={`check-box${done[i] ? ' on' : ''}`}>{done[i] ? '✓' : ''}</span>
          <span>{it.text}</span>
        </button>
      ))}
    </section>
  );
}
