import 'server-only';
import { isDemoMode } from '../env';
import { loadRawDeal } from '../bitrix/deal';
import { demoRawDeal } from './demo';
import { buildProjectView, type ProjectView } from './view';

export async function getProjectView(dealId: number): Promise<ProjectView> {
  const today = new Date();
  if (isDemoMode()) {
    return buildProjectView(demoRawDeal(), today, { demo: true, coverUrl: '/demo/facade.webp', floors: 2 });
  }
  return buildProjectView(await loadRawDeal(dealId), today);
}
