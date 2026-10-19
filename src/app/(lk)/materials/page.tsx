import { currentView } from '@/lib/current-view';
import { MATERIAL_SECTIONS, demoMaterials } from '@/lib/project/demo-content';
import { Docs } from '@/components/sections/Docs';
import { NotConnected } from '@/components/sections/NotConnected';

export default async function Page() {
  const { view } = await currentView();
  if (!view?.demo) return <NotConnected title="Полезные материалы" text="Чек-листы к этапам, памятки по дому и материалы о компании." />;
  return <Docs docs={demoMaterials} sections={MATERIAL_SECTIONS} dateLabel="Объём" note="Чек-листы и памятки можно открыть на экране или скачать и распечатать." />;
}
