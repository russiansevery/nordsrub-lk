'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { query } from '@/lib/db';
import { createSession, destroySession, requireClient, SHOWCASE_CLIENT_ID } from '@/lib/auth/session';
import { env, isShowcaseMode } from '@/lib/env';
import { timingSafeEqual } from 'node:crypto';
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/auth/password';
import { clearFailures, isLocked, recordFailure } from '@/lib/auth/rate-limit';

// Хеш случайной строки: нужен только для одинакового времени ответа.
const DUMMY_HASH = '$2b$12$4Rm5oGWkxQyB6dDM590pIeMvCrdnyIliXw0z34Jv.z4URppOc9Ky.';

export type FormState = { error?: string };

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: 'Введите email и пароль.' };
  const { email, password } = parsed.data;

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const key = `${email}|${ip}`;
  if (isLocked(key)) return { error: 'Слишком много попыток. Попробуйте через 15 минут.' };

  if (isShowcaseMode()) {
    if (email !== env.demoEmail || !sameText(password, env.demoPassword)) {
      recordFailure(key);
      return { error: 'Неверный email или пароль.' };
    }
    clearFailures(key);
    await createSession(SHOWCASE_CLIENT_ID);
    redirect('/');
  }

  const [client] = await query<{ id: number; password_hash: string; blocked: boolean }>(
    'SELECT id, password_hash, blocked FROM clients WHERE email = $1',
    [email],
  );
  // Хеш сравниваем всегда, чтобы время ответа не выдавало, есть ли такой email.
  const ok = await verifyPassword(password, client?.password_hash ?? DUMMY_HASH);
  if (!client || !ok) {
    recordFailure(key);
    return { error: 'Неверный email или пароль.' };
  }
  if (client.blocked) return { error: 'Доступ к кабинету закрыт. Свяжитесь с вашим менеджером.' };

  clearFailures(key);
  await query('UPDATE clients SET last_login_at = now() WHERE id = $1', [client.id]);
  await createSession(client.id);
  redirect('/');
}

const passwordSchema = z
  .object({ password: z.string().min(MIN_PASSWORD_LENGTH), repeat: z.string() })
  .refine((v) => v.password === v.repeat, { path: ['repeat'] });

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const client = await requireClient({ allowTempPassword: true });
  if (isShowcaseMode()) redirect('/');
  const parsed = passwordSchema.safeParse({ password: form.get('password'), repeat: form.get('repeat') });
  if (!parsed.success) {
    const repeatIssue = parsed.error.issues.some((i) => i.path[0] === 'repeat');
    return { error: repeatIssue ? 'Пароли не совпадают.' : `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов.` };
  }
  await query('UPDATE clients SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [
    await hashPassword(parsed.data.password),
    client.id,
  ]);
  redirect('/');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
