import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '../db';
import { env, isShowcaseMode } from '../env';

const COOKIE = 'lk_session';
const TTL_DAYS = 30;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

// В режиме показа базы нет: действующие токены живут в памяти процесса до перезапуска.
const showcaseTokens = new Set<string>();
const SHOWCASE_CLIENT_ID = 0;

export type SessionClient = {
  id: number;
  email: string;
  name: string;
  mustChangePassword: boolean;
  dealIds: number[];
};

export { SHOWCASE_CLIENT_ID };

export async function createSession(clientId: number) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + TTL_DAYS * 86_400_000);
  if (isShowcaseMode()) showcaseTokens.add(sha256(token));
  else await query('INSERT INTO sessions(token_hash, client_id, expires_at) VALUES ($1, $2, $3)', [sha256(token), clientId, expires]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: await isHttps(),
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

// За nginx протокол берём из X-Forwarded-Proto: пока нет сертификата, сайт работает по http и cookie должна сохраниться.
async function isHttps() {
  const proto = (await headers()).get('x-forwarded-proto');
  return proto ? proto.split(',')[0].trim() === 'https' : env.isProduction;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && isShowcaseMode()) showcaseTokens.delete(sha256(token));
  else if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
  jar.delete(COOKIE);
}

export async function getSessionClient(): Promise<SessionClient | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  if (isShowcaseMode()) {
    if (!showcaseTokens.has(sha256(token))) return null;
    return { id: SHOWCASE_CLIENT_ID, email: env.demoEmail, name: 'Демо-клиент', mustChangePassword: false, dealIds: [] };
  }
  const rows = await query<{ id: number; email: string; name: string; must_change_password: boolean; deal_ids: number[] | null }>(
    `SELECT c.id, c.email, c.name, c.must_change_password,
            array_remove(array_agg(cd.deal_id ORDER BY cd.created_at), NULL) AS deal_ids
       FROM sessions s
       JOIN clients c ON c.id = s.client_id
  LEFT JOIN client_deals cd ON cd.client_id = c.id
      WHERE s.token_hash = $1 AND s.expires_at > now() AND NOT c.blocked
   GROUP BY c.id`,
    [sha256(token)],
  );
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, email: r.email, name: r.name, mustChangePassword: r.must_change_password, dealIds: r.deal_ids ?? [] };
}

/** Для страниц кабинета: без входа отправляем на /login, с временным паролем — на смену пароля. */
export async function requireClient(opts: { allowTempPassword?: boolean } = {}): Promise<SessionClient> {
  const client = await getSessionClient();
  if (!client) redirect('/login');
  if (client.mustChangePassword && !opts.allowTempPassword) redirect('/change-password');
  return client;
}
