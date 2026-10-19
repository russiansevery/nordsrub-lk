import { currentView } from '@/lib/current-view';
import { demoChecklist, demoMaterials } from '@/lib/project/demo-content';
import { Checklist } from '@/components/sections/Checklist';
import { NotConnected } from '@/components/sections/NotConnected';

export default async function Page() {
  const { view } = await currentView();
  if (!view?.demo) return <NotConnected title="Полезные материалы" text="Чек-листы к текущему этапу и памятки по дому." />;
  return (
    <div className="materials">
      <Checklist title={demoChecklist.title} items={demoChecklist.items} />
      <section className="card materials-card">
        <h2>Памятки по дому</h2>
        {demoMaterials.map((m) => (
          <details key={m.title} className="memo">
            <summary>{m.title}</summary>
            <ul>{m.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </details>
        ))}
      </section>
    </div>
  );
}
