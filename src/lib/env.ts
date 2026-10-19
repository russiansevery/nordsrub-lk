import 'server-only';

// Все настройки читаются только на сервере. В браузер ничего из этого не попадает.
export const env = {
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ?? '',
  bitrixWebhookUrl: (process.env.BITRIX_WEBHOOK_URL ?? '').trim(),
  inviteSecret: process.env.INVITE_SECRET ?? '',
  smtpUrl: process.env.SMTP_URL ?? '',
  mailFrom: process.env.MAIL_FROM ?? 'Русский Север <info@nordsrub.ru>',
  demoEmail: (process.env.DEMO_EMAIL ?? 'demo@nordsrub.ru').trim().toLowerCase(),
  demoPassword: process.env.DEMO_PASSWORD ?? 'demo2026',
  isProduction: process.env.NODE_ENV === 'production',
};

/** Без вебхука кабинет работает на демо-данных, чтобы можно было смотреть интерфейс. */
export const isDemoMode = () => env.bitrixWebhookUrl === '';

/** Показ без базы: нет ни вебхука, ни базы. Вход только под демо-аккаунтом, сессии в памяти процесса. */
export const isShowcaseMode = () => isDemoMode() && env.databaseUrl === '';
