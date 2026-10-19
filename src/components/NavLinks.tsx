'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SECTIONS = [
  { href: '/', label: 'Главная', short: 'Главная' },
  { href: '/chat', label: 'Чат проекта', short: 'Чат' },
  { href: '/photos', label: 'Фото и видео', short: 'Фото' },
  { href: '/docs', label: 'Документы', short: 'Документы' },
  { href: '/camera', label: 'Камера', short: 'Камера' },
  { href: '/materials', label: 'Полезные материалы', short: 'Материалы' },
] as const;

const TITLES: Record<string, string> = { '/write': 'Написать руководству', '/more': 'Ещё' };
// На телефоне камера, материалы и письмо руководству живут во вкладке «Ещё».
const MORE = ['/more', '/camera', '/materials', '/write'];

export function NavLinks({ variant }: { variant: 'side' | 'bottom' }) {
  const path = usePathname();
  if (variant === 'side') {
    return (
      <>
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} aria-current={path === s.href ? 'page' : undefined}>{s.label}</Link>
        ))}
      </>
    );
  }
  return (
    <>
      {SECTIONS.slice(0, 4).map((s) => (
        <Link key={s.href} href={s.href} aria-current={path === s.href ? 'page' : undefined}>{s.short}</Link>
      ))}
      <Link href="/more" aria-current={MORE.includes(path) ? 'page' : undefined}>Ещё</Link>
    </>
  );
}

export function PageTitle() {
  const path = usePathname();
  return <h1>{SECTIONS.find((s) => s.href === path)?.label ?? TITLES[path] ?? 'Личный кабинет'}</h1>;
}
