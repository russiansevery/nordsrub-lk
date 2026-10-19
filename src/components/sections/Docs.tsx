'use client';

import { useState } from 'react';

export type FileItem = { section: string; name: string; date: string; file: string; status?: string; pending?: boolean };

/** Список файлов с фильтром по разделам и кнопками «Открыть» / «Скачать». Общий для документов и материалов. */
export function Docs({ docs, sections, dateLabel = 'Дата', note }: { docs: FileItem[]; sections: Record<string, string>; dateLabel?: string; note: string }) {
  const [filter, setFilter] = useState('all');
  const filters: [string, string][] = [['all', 'Все'], ...Object.entries(sections)];
  const shown = docs.filter((d) => filter === 'all' || d.section === filter);
  return (
    <div className="docs">
      <div className="chips">
        {filters.map(([k, label]) => (
          <button key={k} type="button" className={`chip${filter === k ? ' on' : ''}`} onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>
      <div className="card docs-table">
        <div className="docs-row docs-head"><span /><span>Документ</span><span>Раздел</span><span>{dateLabel}</span><span>Статус</span><span /></div>
        {shown.map((d) => (
          <div key={d.name} className="docs-row">
            <a className="docs-ext" href={d.file} target="_blank" rel="noopener" aria-label={`Открыть: ${d.name}`}>PDF</a>
            <a className="docs-name" href={d.file} target="_blank" rel="noopener">{d.name}</a>
            <span className="muted docs-section">{sections[d.section]}</span>
            <span className="muted docs-date">{d.date}</span>
            {d.status ? <span className={`badge${d.pending ? ' pending' : ''}`}>{d.status}</span> : <span />}
            <span className="docs-actions">
              <a className="docs-btn" href={d.file} target="_blank" rel="noopener">Открыть</a>
              <a className="docs-btn" href={d.file} download>Скачать</a>
            </span>
          </div>
        ))}
      </div>
      <span className="muted small">{note}</span>
    </div>
  );
}
