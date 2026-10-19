'use server';

import { z } from 'zod';
import { currentView } from '@/lib/current-view';
import { env, isDemoMode } from '@/lib/env';
import { sendMail } from '@/lib/mail';

export type WriteState = { error?: string; sent?: string };

const schema = z.object({
  topic: z.enum(['Вопрос', 'Жалоба', 'Благодарность', 'Финансы', 'Другое']),
  text: z.string().trim().min(5).max(5000),
});

export async function writeToManagement(_prev: WriteState, form: FormData): Promise<WriteState> {
  const { client, view } = await currentView();
  const parsed = schema.safeParse({ topic: form.get('topic'), text: form.get('text') });
  if (!parsed.success) return { error: 'Напишите сообщение, хотя бы пару слов.' };
  if (isDemoMode()) return { sent: `В демо-режиме письмо никуда не уходит. В рабочем кабинете оно придёт на ${env.managementEmail}, а ответ — вам на почту.` };

  const { topic, text } = parsed.data;
  const object = view ? `«${view.projectName}», сделка ${view.dealId}` : 'объект не выбран';
  try {
    await sendMail({
      to: env.managementEmail,
      subject: `ЛК: ${topic} от ${client.name || client.email}`,
      text: `${text}\n\n—\nКлиент: ${client.name} <${client.email}>\nОбъект: ${object}`,
    });
  } catch (e) {
    console.error('[write] mail failed', e);
    return { error: 'Не удалось отправить письмо. Попробуйте позже или позвоните менеджеру.' };
  }
  return { sent: 'Письмо получено руководством. Ответ придёт вам на почту.' };
}
