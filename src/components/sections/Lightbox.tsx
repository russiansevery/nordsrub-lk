'use client';

import { useEffect, useState } from 'react';

export type LightboxPhoto = { src: string; position: string; caption?: string };

/** Просмотр фото на весь экран: стрелки и клавиши ← → листают, Esc закрывает. */
export function Lightbox({ photos, index, onClose }: { photos: LightboxPhoto[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const prev = () => setI((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setI((v) => (v + 1) % photos.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const p = photos[i];
  return (
    <div className="lightbox" role="dialog" aria-label="Просмотр фото" onClick={onClose}>
      <div className="lightbox-top" onClick={(e) => e.stopPropagation()}>
        <span>{p.caption ?? ''} · {i + 1} из {photos.length}</span>
        <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
      </div>
      <img src={p.src} alt="" style={{ objectPosition: p.position }} onClick={(e) => { e.stopPropagation(); next(); }} />
      {photos.length > 1 ? (
        <>
          <button type="button" className="lightbox-nav left" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Предыдущее фото">‹</button>
          <button type="button" className="lightbox-nav right" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Следующее фото">›</button>
        </>
      ) : null}
    </div>
  );
}
