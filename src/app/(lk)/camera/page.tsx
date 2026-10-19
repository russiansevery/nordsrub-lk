import { currentView } from '@/lib/current-view';
import { CameraView } from '@/components/sections/CameraView';

export default async function Page() {
  const { view } = await currentView();
  return (
    <div className="section-stack camera-page">
      <CameraView name="Камера объекта · вид на дом" still={view?.demo ? '/demo/render.webp' : null} live={false} />
      <span className="muted small">
        {view?.demo ? 'В демо показан кадр объекта. В рабочем кабинете здесь идёт трансляция в реальном времени.' : 'Трансляция с объекта в реальном времени.'}
      </span>
    </div>
  );
}
