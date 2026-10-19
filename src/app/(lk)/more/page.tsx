import Link from 'next/link';
import { currentView } from '@/lib/current-view';
import { logout } from '../../login/actions';

const initials = (name: string) => name.split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();

export default async function Page() {
  const { view } = await currentView();
  const manager = view?.manager ?? null;
  return (
    <div className="section-stack">
      {manager ? (
        <section className="card more-manager">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="avatar">{initials(manager.name)}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="muted small">Ваш менеджер</span>
              <b>{manager.name}</b>
              {manager.phone ? <span className="muted" style={{ fontSize: 13 }}>{manager.phone}</span> : null}
            </div>
          </div>
          {manager.phone ? <a className="btn btn-accent" href={`tel:${manager.phone.replace(/[^\d+]/g, '')}`}>Позвонить</a> : null}
        </section>
      ) : null}
      <Link href="/write" className="btn btn-outline">Написать руководству</Link>
      <nav className="card more-links">
        <Link href="/materials">Полезные материалы<span aria-hidden="true">›</span></Link>
      </nav>
      <form action={logout}>
        <button type="submit" className="more-logout">Выйти</button>
      </form>
    </div>
  );
}
