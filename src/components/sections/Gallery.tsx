'use client';

import { useState } from 'react';
import type { GalleryStage } from '@/lib/project/demo-content';
import { Lightbox, type LightboxPhoto } from './Lightbox';

export function Gallery({ stages }: { stages: GalleryStage[] }) {
  const [open, setOpen] = useState<{ photos: LightboxPhoto[]; index: number } | null>(null);
  return (
    <div className="gallery">
      {stages.map((g) => {
        const photos = g.photos.map((p) => ({ ...p, caption: `Этап «${g.stage}»` }));
        return (
          <section key={g.stage} className="gallery-stage">
            <div className="gallery-head">
              <h2>{g.stage}</h2>
              <span className="muted small">{g.reports} {g.reports === 1 ? 'отчёт' : g.reports < 5 ? 'отчёта' : 'отчётов'} · {g.files} файлов</span>
            </div>
            <div className="gallery-grid">
              {g.photos.map((p, i) => (
                <button key={i} type="button" onClick={() => setOpen({ photos, index: i })} aria-label={`Открыть фото ${i + 1}`}>
                  <img src={p.src} alt="" loading="lazy" style={{ objectPosition: p.position }} />
                  {i === g.photos.length - 1 && g.files > g.photos.length ? <span className="more">+{g.files - g.photos.length}</span> : null}
                </button>
              ))}
            </div>
          </section>
        );
      })}
      {open ? <Lightbox photos={open.photos} index={open.index} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
