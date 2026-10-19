'use client';

import { useState } from 'react';
import { DOC_SECTIONS, type DemoDoc } from '@/lib/project/demo-content';

type Filter = 'all' | DemoDoc['section'];
const FILTERS: [Filter, string][] = [['all', 'Все'], ...(Object.entries(DOC_SECTIONS) as [Filter, string][])];

export function Docs({ docs }: { docs: DemoDoc[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = docs.filter((d) => filter === 'all' || d.section === filter);
  return (
    <div className="docs">
      <div className="chips">
        {FILTERS.map(([k, label]) => (
          <button key={k} type="button" className={`chip${filter === k ? ' on' : ''}`} onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>
      <div className="card docs-table">
        <div className="docs-row docs-head"><span /><span>Документ</span><span>Раздел</span><span>Дата</span><span>Статус</span></div>
        {shown.map((d) => (
          <div key={d.name} className="docs-row">
            <span className="docs-ext">PDF</span>
            <span className="docs-name">{d.name}</span>
            <span className="muted docs-section">{DOC_SECTIONS[d.section]}</span>
            <span className="muted docs-date">{d.date}</span>
            <span className={`badge${d.pending ? ' pending' : ''}`}>{d.status}</span>
          </div>
        ))}
      </div>
      <span className="muted small">Документы появляются здесь, как только их подготовят или подпишут.</span>
    </div>
  );
}
