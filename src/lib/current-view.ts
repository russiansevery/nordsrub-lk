import 'server-only';
import { requireClient } from './auth/session';
import { currentDealId } from './current-object';
import { getProjectView } from './project';

/** Клиент и выбранный объект для страниц разделов. */
export async function currentView() {
  const client = await requireClient();
  const dealId = await currentDealId(client);
  return { client, view: dealId ? await getProjectView(dealId) : null };
}
