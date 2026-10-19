import Image from 'next/image';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--ink)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: 'var(--ink)', borderRadius: 16, padding: '14px 18px', alignSelf: 'flex-start' }}>
          <Image src="/brand/logo.webp" alt="Русский Север" width={110} height={44} style={{ height: 'auto' }} priority />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{title}</h1>
          {subtitle ? <p className="muted" style={{ margin: 0, fontSize: 14 }}>{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </main>
  );
}
