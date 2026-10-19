import { currentView } from '@/lib/current-view';
import { demoGallery } from '@/lib/project/demo-content';
import { Gallery } from '@/components/sections/Gallery';
import { NotConnected } from '@/components/sections/NotConnected';

export default async function Page() {
  const { view } = await currentView();
  if (!view?.demo) return <NotConnected title="Фото и видео" text="Фото и видео с объекта, разложенные по этапам работ." />;
  return (
    <div className="section-stack">
      <p className="muted" style={{ margin: 0 }}>Фото и видео загружает прораб по ходу работ, они раскладываются по этапам.</p>
      <Gallery stages={demoGallery} />
    </div>
  );
}
