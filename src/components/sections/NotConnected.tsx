export function NotConnected({ title, text }: { title: string; text: string }) {
  return (
    <div className="card placeholder">
      <h2 style={{ fontSize: 18 }}>{title}</h2>
      <p className="muted" style={{ margin: 0 }}>{text}</p>
      <p className="muted small" style={{ margin: 0 }}>Раздел скоро заработает на данных вашего объекта.</p>
    </div>
  );
}
