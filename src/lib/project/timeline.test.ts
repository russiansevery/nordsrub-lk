import { describe, expect, it } from 'vitest';
import { buildTimeline } from './timeline';

const names: Record<string, string> = {
  'C2:NEW': 'Геология участка',
  'C2:PREPAY': 'Ждём предоплату',
  'C2:DESIGN': 'Проектирование',
  'C2:EST': 'Расчёт сметы',
  'C2:WAIT': 'Ожидание выхода бригады',
  'C2:FOUND': 'Фундамент',
  'C2:WALLS': 'Сборка стен',
  'C2:ROOF': 'Кровля',
};
const d = (s: string) => new Date(`${s}T12:00:00+03:00`);

describe('buildTimeline', () => {
  const history = [
    { stageId: 'C2:NEW', at: d('2026-05-01') },
    { stageId: 'C2:DESIGN', at: d('2026-05-13') },
    { stageId: 'C2:EST', at: d('2026-06-10') },
    { stageId: 'C2:PREPAY', at: d('2026-06-15') },
    { stageId: 'C2:WAIT', at: d('2026-06-21') },
    { stageId: 'C2:FOUND', at: d('2026-07-04') },
    { stageId: 'C2:WALLS', at: d('2026-07-29') },
    { stageId: 'C2:ROOF', at: d('2026-10-13') },
  ];

  it('marks stages before the current one as done with real dates', () => {
    const t = buildTimeline({ currentStageId: 'C2:ROOF', stageNames: names, history, today: d('2026-10-16') });
    expect(t.currentIndex).toBe(6);
    expect(t.stages[5]).toMatchObject({ name: 'Стены', status: 'done', start: d('2026-07-29'), end: d('2026-10-13'), estimated: false });
    expect(t.stages[6].status).toBe('current');
    expect(t.stages[6].progress).toBeGreaterThan(0);
    expect(t.stages[6].progress).toBeLessThan(1);
    expect(t.stages[7]).toMatchObject({ status: 'planned', estimated: true });
    expect(t.stages[7].start?.getTime()).toBe(t.stages[6].end?.getTime());
  });

  it('counts days in work from the foundation stage', () => {
    const t = buildTimeline({ currentStageId: 'C2:ROOF', stageNames: names, history, today: d('2026-10-16') });
    expect(t.daysInWork).toBe(104);
  });

  it('keeps showing the previous stage while the deal sits in a hidden internal stage', () => {
    const t = buildTimeline({ currentStageId: 'C2:PREPAY', stageNames: names, history: history.slice(0, 4), today: d('2026-06-16') });
    expect(t.stages[t.currentIndex].name).toBe('Расчёт сметы');
    expect(t.daysInWork).toBeNull();
  });

  it('treats a won deal as finished with every stage done', () => {
    const t = buildTimeline({ currentStageId: 'C2:WON', stageNames: names, history, today: d('2027-02-01') });
    expect(t.finished).toBe(true);
    expect(t.stages.every((s) => s.status === 'done')).toBe(true);
  });

  it('starts at the first stage when there is no history', () => {
    const t = buildTimeline({ currentStageId: 'C2:NEW', stageNames: names, history: [], today: d('2026-05-02') });
    expect(t.currentIndex).toBe(0);
    expect(t.stages[0].start).toEqual(d('2026-05-02'));
  });
});
