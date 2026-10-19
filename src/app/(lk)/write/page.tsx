import { requireClient } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { WriteForm } from '@/components/sections/WriteForm';
import { writeToManagement } from './actions';

export default async function Page() {
  await requireClient();
  return (
    <section className="card write">
      <h2>Написать руководству</h2>
      <p className="muted" style={{ margin: 0 }}>Письмо руководству компании в обход команды проекта. Уходит на {env.managementEmail}.</p>
      <WriteForm action={writeToManagement} />
    </section>
  );
}
