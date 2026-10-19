import { requireClient } from '@/lib/auth/session';
import { currentDealId } from '@/lib/current-object';
import { getProjectView } from '@/lib/project';
import { Gantt } from '@/components/Gantt';
import { CameraView } from '@/components/sections/CameraView';

const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export default async function HomePage() {
  const client = await requireClient();
  const dealId = await currentDealId(client);
  if (!dealId) {
    return (
      <div className="card placeholder">
        <h2 style={{ fontSize: 18 }}>Объект ещё не добавлен</h2>
        <p className="muted" style={{ margin: 0 }}>Ваш менеджер добавит объект в кабинет, и здесь появится ход строительства.</p>
      </div>
    );
  }

  const view = await getProjectView(dealId);
  const today = new Date();
  const { timeline } = view;
  const current = timeline.stages[timeline.currentIndex];
  const facts = [
    view.material,
    view.area ? `${view.area.toLocaleString('ru-RU')} м²` : '',
    view.floors ? `${view.floors} ${plural(view.floors, 'этаж', 'этажа', 'этажей')}` : '',
    timeline.daysInWork !== null ? `${timeline.daysInWork} ${plural(timeline.daysInWork, 'день', 'дня', 'дней')} в работе` : '',
    `этап ${timeline.currentIndex + 1} из ${timeline.stages.length}`,
  ].filter(Boolean);

  return (
    <div className="home">
      <CameraView name="Камера объекта" still={view.demo ? '/demo/render.webp' : null} live={false} />

      <section className="card project">
        <div className="project-head">
          <span className="muted small">Проект «{view.projectName}»{view.contractNumber ? ` · договор № ${view.contractNumber}` : ''}</span>
          <h2>{[view.material, view.area ? `${view.area.toLocaleString('ru-RU')} м²` : ''].filter(Boolean).join(' · ') || view.projectName}</h2>
          {view.address ? <span className="muted" style={{ fontSize: 13 }}>{view.address}</span> : null}
        </div>
        {view.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="project-cover" src={view.coverUrl} alt={`Фасад дома, проект «${view.projectName}»`} />
        ) : (
          <div className="project-cover project-cover-empty">Изображение дома появится после загрузки альбома</div>
        )}
        <div className="facts">
          {facts.map((f) => <span className="fact" key={f}>{f}</span>)}
        </div>
      </section>

      <section className="card progress home-wide">
        <div className="progress-head">
          <h2>Ход строительства</h2>
          <span className="muted small">обновлено {fmt.format(today)}</span>
        </div>
        {timeline.finished ? (
          <div className="now">
            <span className="now-label" style={{ color: 'var(--ink)' }}>ДОМ СДАН</span>
            <span className="now-title">Все этапы завершены</span>
          </div>
        ) : (
          <div className="now">
            <span className="now-label">СЕЙЧАС</span>
            <span className="now-title">{current.name}</span>
            <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>
              {current.end ? `Ориентировочное окончание ${fmt.format(current.end)}` : ''}
              {view.foreman ? `${current.end ? ' · ' : ''}отвечает прораб ${view.foreman.name}` : ''}
            </span>
          </div>
        )}
        <Gantt stages={timeline.stages} today={today} />
      </section>
    </div>
  );
}
