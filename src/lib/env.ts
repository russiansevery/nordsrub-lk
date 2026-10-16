import 'server-only';

// Все настройки читаются только на сервере. В браузер ничего из этого не попадает.
export const env = {
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ?? '',
  bitrixWebhookUrl: (process.env.BITRIX_WEBHOOK_URL ?? '').trim(),
  inviteSecret: process.env.INVITE_SECRET ?? '',
  smtpUrl: process.env.SMTP_URL ?? '',
  mailFrom: process.env.MAIL_FROM ?? 'Русский Север <info@nordsrub.ru>',
  isProduction: process.env.NODE_ENV === 'production',
};

/** Без вебхука кабинет работает на демо-данных, чтобы можно было смотреть интерфейс. */
export const isDemoMode = () => env.bitrixWebhookUrl === '';
