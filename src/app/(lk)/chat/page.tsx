import { currentView } from '@/lib/current-view';
import { demoChat } from '@/lib/project/demo-content';
import { Chat } from '@/components/sections/Chat';
import { NotConnected } from '@/components/sections/NotConnected';

export default async function Page() {
  const { view } = await currentView();
  if (!view?.demo) return <NotConnected title="Чат проекта" text="Общий чат с командой: фотоотчёты прораба, вопросы, документы." />;
  const stage = view.timeline.stages[view.timeline.currentIndex]?.name ?? '';
  return <Chat initial={demoChat} team={view.team} currentStage={stage} />;
}
