'use client';

import { useActionState } from 'react';
import type { WriteState } from '@/app/(lk)/write/actions';

export function WriteForm({ action }: { action: (prev: WriteState, form: FormData) => Promise<WriteState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  if (state.sent) {
    return (
      <div className="notice" role="status">
        <b>Письмо отправлено</b>
        <div>{state.sent}</div>
      </div>
    );
  }
  return (
    <form action={formAction} className="write-form">
      {state.error ? <div className="error" role="alert">{state.error}</div> : null}
      <label className="field" htmlFor="write-topic">Тема
        <select id="write-topic" name="topic" defaultValue="Вопрос">
          <option>Вопрос</option><option>Жалоба</option><option>Благодарность</option><option>Финансы</option><option>Другое</option>
        </select>
      </label>
      <label className="field" htmlFor="write-text">Сообщение
        <textarea id="write-text" name="text" rows={6} required maxLength={5000} />
      </label>
      <button className="btn btn-accent" type="submit" disabled={pending}>{pending ? 'Отправляем…' : 'Отправить'}</button>
    </form>
  );
}
