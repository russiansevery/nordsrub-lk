import { requireClient } from '@/lib/auth/session';

export default async function Page() {
  await requireClient();
  return (
    <div className="card placeholder">
      <h2 style={{ fontSize: 18 }}>Камера</h2>
      <p className="muted" style={{ margin: 0 }}>Прямой эфир с камеры на объекте.</p>
      <p className="muted small" style={{ margin: 0 }}>Раздел появится в следующих версиях кабинета.</p>
    </div>
  );
}
