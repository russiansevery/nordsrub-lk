import { CLIENT_STAGES, clientStageIndex, WORK_START_STAGE } from './stages';

const DAY = 86_400_000;

export type StageStatus = 'done' | 'current' | 'planned';

export type TimelineStage = {
  key: string;
  name: string;
  status: StageStatus;
  /** Начало и окончание этапа. Для будущих этапов и окончания текущего даты ориентировочные. */
  start: Date | null;
  end: Date | null;
  estimated: boolean;
  /** Доля пройденного для текущего этапа, 0..1. */
  progress: number;
};

export type StageHistoryEntry = { stageId: string; at: Date };

export type Timeline = {
  stages: TimelineStage[];
  currentIndex: number;
  /** Дней в работе с начала этапа «Фундамент», или null, если работы ещё не начались. */
  daysInWork: number | null;
  /** true, если сделка закрыта успешно и дом сдан. */
  finished: boolean;
};

export function buildTimeline(params: {
  currentStageId: string;
  stageNames: Record<string, string>;
  history: StageHistoryEntry[];
  today: Date;
}): Timeline {
  const { currentStageId, stageNames, today } = params;
  const history = [...params.history].sort((a, b) => a.at.getTime() - b.at.getTime());
  const finished = currentStageId.endsWith(':WON');

  // Первый вход в каждый этап клиента по истории стадий.
  const firstEntry: (Date | null)[] = CLIENT_STAGES.map(() => null);
  let lastSeen = -1;
  for (const h of history) {
    const idx = clientStageIndex(h.stageId, stageNames[h.stageId]);
    if (idx === null) continue;
    if (firstEntry[idx] === null) firstEntry[idx] = h.at;
    lastSeen = Math.max(lastSeen, idx);
  }

  // Текущий этап: по текущей стадии, а если она скрыта или не распознана — последний пройденный по истории.
  const fromCurrent = clientStageIndex(currentStageId, stageNames[currentStageId]);
  let currentIndex = Math.max(fromCurrent ?? -1, lastSeen, 0);
  if (finished) currentIndex = CLIENT_STAGES.length;
  if (currentIndex < CLIENT_STAGES.length && firstEntry[currentIndex] === null) {
    firstEntry[currentIndex] = history.at(-1)?.at ?? today;
  }

  const stages: TimelineStage[] = [];
  let cursor: Date | null = null; // окончание предыдущего этапа, от него считаются плановые даты
  for (let i = 0; i < CLIENT_STAGES.length; i++) {
    const def = CLIENT_STAGES[i];
    const status: StageStatus = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'planned';
    let start = firstEntry[i];
    let end: Date | null = null;
    let estimated = false;
    let progress = 0;

    if (status === 'done') {
      // Окончание пройденного этапа — начало следующего известного этапа.
      const next = firstEntry.slice(i + 1).find((d): d is Date => d !== null);
      end = start ? (next ?? start) : null;
      progress = 1;
    } else if (status === 'current') {
      start ??= today;
      end = new Date(Math.max(start.getTime() + def.typicalDays * DAY, today.getTime() + DAY));
      estimated = true;
      progress = clamp((today.getTime() - start.getTime()) / (end.getTime() - start.getTime()));
    } else {
      start = cursor ? new Date(cursor) : null;
      end = start ? new Date(start.getTime() + def.typicalDays * DAY) : null;
      estimated = true;
    }

    stages.push({ key: def.key, name: def.name, status, start, end, estimated, progress });
    cursor = end ?? cursor;
  }

  const workStart = firstEntry[CLIENT_STAGES.findIndex((s) => s.key === WORK_START_STAGE)];
  const daysInWork = workStart ? Math.max(0, Math.floor((today.getTime() - workStart.getTime()) / DAY)) : null;

  return { stages, currentIndex: Math.min(currentIndex, CLIENT_STAGES.length - 1), daysInWork, finished };
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}
