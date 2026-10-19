import Image from 'next/image';
import Link from 'next/link';
import { requireClient } from '@/lib/auth/session';
import { currentDealId } from '@/lib/current-object';
import { isDemoMode } from '@/lib/env';
import { getProjectView } from '@/lib/project';
import { loadDealTitles } from '@/lib/bitrix/deal';
import { NavLinks, PageTitle } from '@/components/NavLinks';
import { logout } from '../login/actions';
import '../lk.css';

export const dynamic = 'force-dynamic';

const initials = (name: string) => name.split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const client = await requireClient();
  const dealId = await currentDealId(client);
  const demo = isDemoMode();
  const view = dealId ? await getProjectView(dealId) : null;
  const titles = !demo && client.dealIds.length > 1 ? await loadDealTitles(client.dealIds) : {};
  const manager = view?.manager ?? null;

  return (
    <div className="lk">
      <aside className="lk-side">
        <Image src="/brand/logo.webp" alt="Русский Север" width={120} height={48} style={{ height: 'auto', marginLeft: 8 }} priority />
        {view ? (
          <div className="lk-objects">
            {(client.dealIds.length > 1 ? client.dealIds : [view.dealId]).map((id) => (
              <Link key={id} className="lk-object" href={`/object/${id}`} aria-current={id === view.dealId}>
                <span>Объект</span>
                <span>{id === view.dealId ? view.projectName : (titles[id] ?? `Объект ${id}`)}</span>
              </Link>
            ))}
          </div>
        ) : null}
        <nav className="lk-nav">
          <NavLinks variant="side" />
        </nav>
        <div className="lk-foot">
          {manager ? (
            <div className="lk-manager">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="avatar">{initials(manager.name)}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>Ваш менеджер</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{manager.name}</span>
                  {manager.phone ? <span style={{ fontSize: 12, opacity: 0.7 }}>{manager.phone}</span> : null}
                </div>
              </div>
              {manager.phone ? (
                <a className="btn btn-accent lk-call" href={`tel:${manager.phone.replace(/[^\d+]/g, '')}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
                  Позвонить
                </a>
              ) : null}
            </div>
          ) : null}
          <Link className="lk-write" href="/write">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            Написать руководству
          </Link>
          <form action={logout}>
            <button type="submit" className="lk-logout" title={client.email}>Выйти</button>
          </form>
        </div>
      </aside>

      <div className="lk-main">
        <header className="lk-top">
          <Image className="lk-top-logo" src="/brand/logo.webp" alt="Русский Север" width={80} height={32} style={{ height: 'auto' }} />
          <PageTitle />
          {view ? <span className="muted small">Проект «{view.projectName}»{view.contractNumber ? ` · договор № ${view.contractNumber}` : ''}</span> : null}
        </header>
        {demo ? <div className="demo-banner">Демо-режим: показан тестовый объект, данные ненастоящие.</div> : null}
        <main className="lk-content">{children}</main>
      </div>

      <nav className="lk-bottom">
        <NavLinks variant="bottom" />
      </nav>
    </div>
  );
}
