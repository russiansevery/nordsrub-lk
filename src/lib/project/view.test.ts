import { describe, expect, it } from 'vitest';
import { buildProjectView, parseAddress } from './view';

describe('buildProjectView', () => {
  it('maps deal fields and team from Bitrix user fields', () => {
    const view = buildProjectView(
      {
        deal: {
          ID: '412',
          TITLE: 'Сделка 412',
          STAGE_ID: 'C2:ROOF',
          ASSIGNED_BY_ID: '7',
          UF_CRM_1701762205698: 'Мюнхен',
          UF_CRM_AMO_567635: 'Клеёный брус',
          UF_CRM_1706679289939: '170.5',
          UF_CRM_1701843708399: 'Ленинградская обл., пос. Сосново|60.5;30.2|99',
          UF_CRM_1706534828948: '0412',
          UF_CRM_1703837502: '15',
          UF_CRM_1703837445: '0',
        },
        stageNames: { 'C2:ROOF': 'Кровля' },
        history: [],
        users: { '7': { NAME: 'Ольга', LAST_NAME: 'Смирнова', PHONE: '+7 900' }, '15': { NAME: 'Иван', LAST_NAME: 'Петров', PHONE: '+7 911' } },
      },
      new Date('2026-10-16T12:00:00+03:00'),
    );
    expect(view).toMatchObject({
      dealId: 412,
      projectName: 'Мюнхен',
      material: 'Клеёный брус',
      area: 170.5,
      address: 'Ленинградская обл., пос. Сосново',
      contractNumber: '0412',
    });
    expect(view.team).toEqual([
      { userId: '7', name: 'Ольга Смирнова', role: 'Менеджер проекта', phone: '+7 900' },
      { userId: '15', name: 'Иван Петров', role: 'Прораб' },
    ]);
    expect(view.foreman?.name).toBe('Иван Петров');
    expect(view.foreman?.phone).toBeUndefined();
    expect(view.timeline.stages[view.timeline.currentIndex].name).toBe('Кровля');
  });

  it('falls back to the deal title when the project field is empty', () => {
    const view = buildProjectView({ deal: { ID: 1, TITLE: 'Дом Ивановых', STAGE_ID: 'C2:NEW' }, stageNames: {}, history: [], users: {} }, new Date());
    expect(view.projectName).toBe('Дом Ивановых');
    expect(view.area).toBeNull();
  });

  it('parses address fields', () => {
    expect(parseAddress('Москва, ул. Ленина 1|55.7;37.6')).toBe('Москва, ул. Ленина 1');
    expect(parseAddress(undefined)).toBe('');
  });
});
