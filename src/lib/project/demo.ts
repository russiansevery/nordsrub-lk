import type { RawDeal } from './view';

// Тестовый объект для демо-режима (когда BITRIX_WEBHOOK_URL не задан).
export const DEMO_DEAL_ID = 412;

export function demoRawDeal(): RawDeal {
  const at = (s: string) => new Date(`${s}T10:00:00+03:00`);
  return {
    deal: {
      ID: String(DEMO_DEAL_ID),
      TITLE: 'Мюнхен, Сосново',
      CATEGORY_ID: '2',
      STAGE_ID: 'C2:ROOF',
      ASSIGNED_BY_ID: '1',
      UF_CRM_1701762205698: 'Мюнхен',
      UF_CRM_AMO_567635: 'Клеёный брус',
      UF_CRM_1706679289939: '170',
      UF_CRM_1701843708399: 'Ленинградская обл., пос. Сосново, уч. 14',
      UF_CRM_1706534828948: '0412',
      UF_CRM_1703837502: '2',
      UF_CRM_1703837445: '3',
      UF_CRM_1703837464: '4',
      UF_CRM_1703837476: '5',
      UF_CRM_1717081308: '6',
    },
    stageNames: {
      'C2:GEO': 'Геология',
      'C2:DESIGN': 'Проектирование',
      'C2:EST': 'Расчёт сметы',
      'C2:WAIT': 'Ожидание выхода',
      'C2:FOUND': 'Фундамент',
      'C2:WALLS': 'Стены',
      'C2:ROOF': 'Кровля',
    },
    history: [
      { stageId: 'C2:GEO', at: at('2026-05-01') },
      { stageId: 'C2:DESIGN', at: at('2026-05-13') },
      { stageId: 'C2:EST', at: at('2026-06-10') },
      { stageId: 'C2:WAIT', at: at('2026-06-21') },
      { stageId: 'C2:FOUND', at: at('2026-07-04') },
      { stageId: 'C2:WALLS', at: at('2026-07-29') },
      { stageId: 'C2:ROOF', at: at('2026-10-13') },
    ],
    users: {
      '1': { NAME: 'Ольга', LAST_NAME: 'Смирнова', PHONE: '+7 (900) 000-00-00' },
      '2': { NAME: 'Иван', LAST_NAME: 'Петров' },
      '3': { NAME: 'Анна', LAST_NAME: 'Ковалёва' },
      '4': { NAME: 'Сергей', LAST_NAME: 'Морозов' },
      '5': { NAME: 'Елена', LAST_NAME: 'Васильева' },
      '6': { NAME: 'Дмитрий', LAST_NAME: 'Никитин' },
    },
  };
}
