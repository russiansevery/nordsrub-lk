'use client';

import { useEffect, useRef } from 'react';

/** Прокручивает горизонтальную ленту так, чтобы линия «сегодня» была видна (на узких экранах). */
export function ScrollToToday({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const line = box?.querySelector<HTMLElement>('.gantt-today');
    if (!box || !line || box.scrollWidth <= box.clientWidth) return;
    const x = line.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft;
    box.scrollLeft = Math.max(0, x - box.clientWidth * 0.6);
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
