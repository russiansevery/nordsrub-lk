'use client';

import { useRef } from 'react';

/** Окно камеры. В демо вместо трансляции стоит кадр объекта. */
export function CameraView({ name, still, live }: { name: string; still: string | null; live: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const full = () => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };
  return (
    <section className="camera">
      <div className="camera-screen camera-frame" ref={ref}>
        {still ? <img src={still} alt="Кадр с камеры объекта" /> : <span>Здесь будет прямой эфир с камеры объекта, когда её подключат.</span>}
        {still ? <span className="camera-live"><i />{live ? 'в эфире' : 'демо-кадр'}</span> : null}
        {still ? (
          <button type="button" className="camera-full" onClick={full} aria-label="Во весь экран">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </button>
        ) : null}
      </div>
      <div className="camera-bar">
        <span>{name}</span>
        <span className="small" style={{ opacity: 0.8 }}>{still ? (live ? 'в сети' : 'демо') : 'не подключена'}</span>
      </div>
    </section>
  );
}
