// Этапы стройки, которые видит клиент, и их связь со стадиями воронки «Проекты».

export type ClientStage = {
  key: string;
  name: string;
  /** Типовая длительность, дней. По ней считаются ориентировочные даты будущих этапов. */
  typicalDays: number;
};

export const CLIENT_STAGES: ClientStage[] = [
  { key: 'geology', name: 'Геология', typicalDays: 14 },
  { key: 'design', name: 'Проектирование', typicalDays: 30 },
  { key: 'estimate', name: 'Расчёт сметы', typicalDays: 14 },
  { key: 'waiting', name: 'Ожидание выхода', typicalDays: 14 },
  { key: 'foundation', name: 'Фундамент', typicalDays: 21 },
  { key: 'walls', name: 'Стены', typicalDays: 60 },
  { key: 'roof', name: 'Кровля', typicalDays: 21 },
  { key: 'windows', name: 'Окна', typicalDays: 14 },
  { key: 'facade', name: 'Наружная отделка', typicalDays: 30 },
  { key: 'utilities', name: 'Инженерные сети', typicalDays: 30 },
  { key: 'interior', name: 'Внутренняя отделка', typicalDays: 45 },
];

/** С какого этапа считаются «дни в работе». */
export const WORK_START_STAGE = 'foundation';

/**
 * Явное соответствие кодов стадий Битрикса (C2:...) этапам клиента.
 * Коды заполняются по выводу `npm run bitrix:stages`. Значение null скрывает
 * внутреннюю стадию: клиент продолжает видеть предыдущий этап.
 * Пока кода нет в списке, этап ищется по названию стадии (см. matchStageByName).
 */
export const BITRIX_STAGE_MAP: Record<string, string | null> = {
  'C2:WON': 'interior',
};

const NAME_HINTS: Record<string, string[]> = {
  geology: ['геолог'],
  design: ['проектир', 'проект ар', 'проект кр'],
  estimate: ['смет'],
  waiting: ['ожидание выхода', 'выход бригад'],
  foundation: ['фундамент'],
  walls: ['стен', 'каркас', 'коробк'],
  roof: ['кровл', 'стропил'],
  windows: ['окн'],
  facade: ['наружн', 'фасад'],
  utilities: ['инженер'],
  interior: ['внутрен', 'отделк'],
};

export function matchStageByName(name: string): string | null {
  const n = name.toLowerCase();
  for (const stage of CLIENT_STAGES) {
    if (NAME_HINTS[stage.key]?.some((hint) => n.includes(hint))) return stage.key;
  }
  return null;
}

/** Индекс этапа клиента для стадии Битрикса или null, если стадия скрыта или не распознана. */
export function clientStageIndex(statusId: string, statusName: string | undefined): number | null {
  const key = statusId in BITRIX_STAGE_MAP ? BITRIX_STAGE_MAP[statusId] : matchStageByName(statusName ?? '');
  if (!key) return null;
  const idx = CLIENT_STAGES.findIndex((s) => s.key === key);
  return idx >= 0 ? idx : null;
}
