import { currentView } from '@/lib/current-view';
import { DOC_SECTIONS, demoDocs } from '@/lib/project/demo-content';
import { Docs } from '@/components/sections/Docs';
import { NotConnected } from '@/components/sections/NotConnected';

export default async function Page() {
  const { view } = await currentView();
  if (!view?.demo) return <NotConnected title="Документы" text="Договор, смета, график оплат и акты по вашему объекту." />;
  return <Docs docs={demoDocs} sections={DOC_SECTIONS} note="Документы появляются здесь, как только их подготовят или подпишут." />;
}
