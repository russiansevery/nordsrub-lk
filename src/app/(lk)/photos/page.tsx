import { requireClient } from '@/lib/auth/session';

export default async function Page() {
  await requireClient();
  return (
    <div className="card placeholder">
      <h2 style={{ fontSize: 18 }}>Фото и видео</h2>
      <p className="muted" style={{ margin: 0 }}>Фото и видео с объекта по этапам работ.</p>
      <p className="muted small" style={{ margin: 0 }}>Раздел появится в следующих версиях кабинета.</p>
    </div>
  );
}
