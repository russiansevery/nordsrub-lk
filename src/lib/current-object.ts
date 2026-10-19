import 'server-only';
import { cookies } from 'next/headers';
import { isDemoMode } from './env';
import { DEMO_DEAL_ID } from './project/demo';
import type { SessionClient } from './auth/session';

/** Выбранный объект клиента: из cookie переключателя, иначе первый по дате добавления. */
export async function currentDealId(client: SessionClient): Promise<number | null> {
  if (isDemoMode() && client.dealIds.length === 0) return DEMO_DEAL_ID;
  const chosen = Number((await cookies()).get('lk_object')?.value);
  return client.dealIds.includes(chosen) ? chosen : (client.dealIds[0] ?? null);
}
