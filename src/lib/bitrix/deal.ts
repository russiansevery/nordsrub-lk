import 'server-only';
import { env } from '../env';
import { createBitrixClient, type BitrixClient } from './client';
import { DEAL_CATEGORY_PROJECTS, DEAL_FIELDS, TEAM_FIELDS } from './fields';
import type { RawDeal } from '../project/view';

let client: BitrixClient | null = null;
export function bitrix(): BitrixClient {
  if (!env.bitrixWebhookUrl) throw new Error('BITRIX_WEBHOOK_URL не задан');
  client ??= createBitrixClient(env.bitrixWebhookUrl);
  return client;
}

// Справочник стадий меняется редко: держим в памяти 10 минут.
let stageCache: { at: number; names: Record<string, string> } | null = null;
export async function projectStageNames(): Promise<Record<string, string>> {
  if (stageCache && Date.now() - stageCache.at < 10 * 60_000) return stageCache.names;
  const rows = await bitrix().call<{ STATUS_ID: string; NAME: string }[]>('crm.status.list', {
    filter: { ENTITY_ID: `DEAL_STAGE_${DEAL_CATEGORY_PROJECTS}` },
  });
  stageCache = { at: Date.now(), names: Object.fromEntries(rows.map((r) => [r.STATUS_ID, r.NAME])) };
  return stageCache.names;
}

export async function loadRawDeal(dealId: number): Promise<RawDeal> {
  const b = bitrix();
  const [deal, stageNames, history] = await Promise.all([
    b.call<Record<string, unknown>>('crm.deal.get', { id: dealId }),
    projectStageNames(),
    b.list<{ STAGE_ID: string; CREATED_TIME: string }>(
      'crm.stagehistory.list',
      { entityTypeId: 2, filter: { OWNER_ID: dealId }, order: { CREATED_TIME: 'ASC' }, select: ['STAGE_ID', 'CREATED_TIME'] },
      (r) => (r as { items: { STAGE_ID: string; CREATED_TIME: string }[] }).items,
    ),
  ]);

  if (Number(deal.CATEGORY_ID) !== DEAL_CATEGORY_PROJECTS) {
    throw new Error(`Сделка ${dealId} не из воронки «Проекты»`);
  }

  const userIds = [...new Set(TEAM_FIELDS.map(({ field }) => String(deal[field] ?? '')).filter((id) => id && id !== '0'))];
  const users = userIds.length
    ? await b.call<{ ID: string; NAME?: string; LAST_NAME?: string; WORK_PHONE?: string; PERSONAL_MOBILE?: string }[]>('user.get', {
        filter: { ID: userIds },
      })
    : [];

  return {
    deal,
    stageNames,
    history: history.map((h) => ({ stageId: h.STAGE_ID, at: new Date(h.CREATED_TIME) })),
    users: Object.fromEntries(
      users.map((u) => [u.ID, { NAME: u.NAME, LAST_NAME: u.LAST_NAME, PHONE: u.WORK_PHONE || u.PERSONAL_MOBILE || undefined }]),
    ),
  };
}

export type DealContact = { contactId: number; name: string; email: string | null; phone: string | null };

/** Основной контакт сделки: от него берутся email и телефон для приглашения. */
export async function loadDealContact(dealId: number): Promise<DealContact | null> {
  const b = bitrix();
  const items = await b.call<{ CONTACT_ID: number; IS_PRIMARY: string }[]>('crm.deal.contact.items.get', { id: dealId });
  const primary = items.find((i) => i.IS_PRIMARY === 'Y') ?? items[0];
  if (!primary) return null;
  const c = await b.call<{
    ID: string;
    NAME?: string;
    LAST_NAME?: string;
    EMAIL?: { VALUE: string }[];
    PHONE?: { VALUE: string }[];
  }>('crm.contact.get', { id: primary.CONTACT_ID });
  return {
    contactId: Number(c.ID),
    name: [c.NAME, c.LAST_NAME].filter(Boolean).join(' ').trim(),
    email: c.EMAIL?.[0]?.VALUE?.trim().toLowerCase() || null,
    phone: c.PHONE?.[0]?.VALUE?.trim() || null,
  };
}

/** Комментарий в таймлайн сделки, чтобы менеджер видел результат прямо в карточке. */
export async function addDealComment(dealId: number, text: string) {
  await bitrix().call('crm.timeline.comment.add', { fields: { ENTITY_ID: dealId, ENTITY_TYPE: 'deal', COMMENT: text } });
}

/** Короткие названия объектов для переключателя: «Мюнхен» или название сделки. */
export async function loadDealTitles(dealIds: number[]): Promise<Record<number, string>> {
  if (dealIds.length === 0) return {};
  const rows = await bitrix().list<Record<string, string>>('crm.deal.list', {
    filter: { '@ID': dealIds, CATEGORY_ID: DEAL_CATEGORY_PROJECTS },
    select: ['ID', 'TITLE', DEAL_FIELDS.project],
  });
  return Object.fromEntries(rows.map((r) => [Number(r.ID), (r[DEAL_FIELDS.project] || r.TITLE || `Объект ${r.ID}`).trim()]));
}
