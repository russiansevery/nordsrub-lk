import { requireClient } from '@/lib/auth/session';

export default async function Page() {
  await requireClient();
  return (
    <div className="card placeholder">
      <h2 style={{ fontSize: 18 }}>Чат проекта</h2>
      <p className="muted" style={{ margin: 0 }}>Общий чат с командой: фотоотчёты прораба, вопросы, документы.</p>
      <p className="muted small" style={{ margin: 0 }}>Раздел появится в следующих версиях кабинета.</p>
    </div>
  );
}
