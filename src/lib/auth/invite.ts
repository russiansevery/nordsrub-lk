import 'server-only';
import { addDealComment, loadDealContact } from '../bitrix/deal';
import { query } from '../db';
import { env } from '../env';
import { sendMail } from '../mail';
import { generateTempPassword, hashPassword } from './password';

export type InviteResult =
  | { ok: true; action: 'created' | 'resent' | 'deal_added'; email: string }
  | { ok: false; reason: 'no_contact' | 'no_email' | 'blocked'; email?: string };

/**
 * Кнопка «Открыть личный кабинет» в сделке. Создаёт аккаунт по контакту сделки
 * или добавляет объект существующему клиенту и отправляет письмо.
 * Результат пишется комментарием в таймлайн сделки.
 */
export async function openCabinetForDeal(dealId: number): Promise<InviteResult> {
  const result = await invite(dealId);
  await addDealComment(dealId, commentFor(result)).catch((e) => console.error('timeline comment failed', e));
  return result;
}

async function invite(dealId: number): Promise<InviteResult> {
  const contact = await loadDealContact(dealId);
  if (!contact) return { ok: false, reason: 'no_contact' };
  if (!contact.email) return { ok: false, reason: 'no_email' };
  const email = contact.email;

  const [existing] = await query<{ id: number; must_change_password: boolean; blocked: boolean }>(
    'SELECT id, must_change_password, blocked FROM clients WHERE email = $1',
    [email],
  );
  if (existing?.blocked) return { ok: false, reason: 'blocked', email };

  const link = `${env.appUrl}/login`;

  if (!existing || existing.must_change_password) {
    // Новый клиент или ещё ни разу не входил: выдаём новый временный пароль.
    const temp = generateTempPassword();
    const hash = await hashPassword(temp);
    const [row] = await query<{ id: number }>(
      `INSERT INTO clients(email, phone, name, bitrix_contact_id, password_hash, must_change_password)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, must_change_password = TRUE,
         phone = COALESCE(EXCLUDED.phone, clients.phone), name = COALESCE(NULLIF(EXCLUDED.name, ''), clients.name)
       RETURNING id`,
      [email, contact.phone, contact.name, contact.contactId, hash],
    );
    await linkDeal(row.id, dealId);
    await sendMail({
      to: email,
      subject: 'Ваш личный кабинет «Русский Север»',
      text: [
        `Здравствуйте${contact.name ? `, ${contact.name}` : ''}!`,
        '',
        'Для вас открыт личный кабинет: здесь видно, как идёт стройка вашего дома, фото и видео с объекта, документы и общий чат с командой проекта.',
        '',
        `Адрес: ${link}`,
        `Логин: ${email}`,
        `Временный пароль: ${temp}`,
        '',
        'При первом входе кабинет попросит придумать свой пароль.',
        '',
        'Команда «Русский Север»',
      ].join('\n'),
    });
    return { ok: true, action: existing ? 'resent' : 'created', email };
  }

  await linkDeal(existing.id, dealId);
  await sendMail({
    to: email,
    subject: 'В личном кабинете новый объект',
    text: ['Здравствуйте!', '', `В вашем личном кабинете появился ещё один объект. Войдите как обычно: ${link}`, '', 'Команда «Русский Север»'].join('\n'),
  });
  return { ok: true, action: 'deal_added', email };
}

async function linkDeal(clientId: number, dealId: number) {
  await query('INSERT INTO client_deals(client_id, deal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [clientId, dealId]);
}

export function commentFor(r: InviteResult): string {
  if (r.ok) {
    if (r.action === 'created') return `Личный кабинет открыт. Приглашение с временным паролем отправлено на ${r.email}.`;
    if (r.action === 'resent') return `Приглашение в личный кабинет отправлено повторно на ${r.email} с новым временным паролем.`;
    return `Объект добавлен в личный кабинет клиента ${r.email}, клиенту отправлено уведомление.`;
  }
  if (r.reason === 'no_contact') return 'Личный кабинет не открыт: к сделке не привязан контакт.';
  if (r.reason === 'no_email') return 'Личный кабинет не открыт: у контакта сделки не указан email.';
  return `Личный кабинет не открыт: доступ клиента ${r.email} заблокирован.`;
}
