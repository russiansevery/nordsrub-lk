import type { TimelineStage } from '@/lib/project/timeline';
import { ScrollToToday } from './ScrollToToday';

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

/** Диаграмма Ганта по этапам: шкала по месяцам от начала первого до конца последнего этапа. */
export function Gantt({ stages, today }: { stages: TimelineStage[]; today: Date }) {
  const dated = stages.filter((s) => s.start && s.end);
  if (dated.length === 0) return null;
  const first = new Date(Math.min(...dated.map((s) => s.start!.getTime())));
  const last = new Date(Math.max(...dated.map((s) => s.end!.getTime()), today.getTime()));
  const from = new Date(first.getFullYear(), first.getMonth(), 1);
  const to = new Date(last.getFullYear(), last.getMonth() + 1, 1);
  const span = to.getTime() - from.getTime();
  const pct = (d: Date) => `${(((d.getTime() - from.getTime()) / span) * 100).toFixed(2)}%`;

  const months: { label: string; width: string }[] = [];
  for (let d = new Date(from); d < to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    months.push({ label: MONTHS[d.getMonth()], width: `${(((next.getTime() - d.getTime()) / span) * 100).toFixed(3)}%` });
  }
  const gridlines = months.map((m) => m.width);

  return (
    <div>
      <ScrollToToday className="gantt-scroll">
        <div className="gantt">
          <div className="gantt-row gantt-head">
            <span className="gantt-name" style={{ fontSize: 11, color: 'var(--muted)' }}>Этап</span>
            <div className="gantt-months" style={{ gridTemplateColumns: gridlines.join(' ') }}>
              {months.map((m, i) => <span key={i}>{m.label}</span>)}
            </div>
          </div>
          {stages.map((s) => (
            <div className="gantt-row" key={s.key} title={describe(s)}>
              <span className="gantt-name" style={{ fontWeight: s.status === 'current' ? 700 : 400, color: s.status === 'planned' ? 'var(--muted)' : undefined }}>
                <span className={`gantt-dot ${s.status}`} />
                {s.name}
              </span>
              <span
                className="gantt-track"
                style={{ display: 'grid', gridTemplateColumns: gridlines.join(' '), backgroundImage: 'none' }}
              >
                {months.map((_, i) => <span key={i} style={{ borderLeft: '1px solid var(--surface-2)' }} />)}
                {s.start && s.end ? (
                  <span
                    className={`gantt-bar ${s.status}`}
                    style={{
                      left: pct(s.start),
                      width: `calc(${pct(s.end)} - ${pct(s.start)})`,
                      background: s.status === 'current' ? `linear-gradient(to right, var(--accent) ${Math.round(s.progress * 100)}%, var(--accent-soft) ${Math.round(s.progress * 100)}%)` : undefined,
                    }}
                    aria-label={describe(s)}
                  />
                ) : null}
                <span className="gantt-today" style={{ left: pct(today) }} />
              </span>
            </div>
          ))}
        </div>
      </ScrollToToday>
      <div className="gantt-legend">
        <span><i className="sw done" />выполнено</span>
        <span><i className="sw current" />идёт</span>
        <span><i className="sw planned" />план (ориентировочно)</span>
        <span><i className="sw" style={{ width: 2, height: 12, background: 'var(--accent)' }} />сегодня, {fmt.format(today)}</span>
      </div>
    </div>
  );
}

function describe(s: TimelineStage) {
  const range = s.start && s.end ? `${fmt.format(s.start)} – ${fmt.format(s.end)}` : 'даты уточняются';
  const status = s.status === 'done' ? 'выполнено' : s.status === 'current' ? 'идёт сейчас' : 'по плану';
  return `${s.name}: ${range}, ${status}${s.estimated && s.status !== 'done' ? ' (ориентировочно)' : ''}`;
}
