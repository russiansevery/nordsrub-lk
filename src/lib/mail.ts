import 'server-only';
import nodemailer from 'nodemailer';
import { env } from './env';

export type Mail = { to: string; subject: string; text: string };

export async function sendMail(mail: Mail) {
  if (!env.smtpUrl) {
    if (env.isProduction) throw new Error('SMTP_URL не задан: письмо не отправлено');
    console.info(`[mail:dev] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
    return;
  }
  const transport = nodemailer.createTransport(env.smtpUrl);
  await transport.sendMail({ from: env.mailFrom, ...mail });
}
