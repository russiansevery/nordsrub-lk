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

export function NavLinks({ variant }: { variant: 'side' | 'bottom' }) {
  const path = usePathname();
  const items = variant === 'bottom' ? SECTIONS.filter((s) => s.href !== '/materials') : SECTIONS;
  return (
    <>
      {items.map((s) => (
        <Link key={s.href} href={s.href} aria-current={path === s.href ? 'page' : undefined}>
          {variant === 'bottom' ? s.short : s.label}
        </Link>
      ))}
    </>
  );
}

export function PageTitle() {
  const path = usePathname();
  return <h1>{SECTIONS.find((s) => s.href === path)?.label ?? 'Личный кабинет'}</h1>;
}
