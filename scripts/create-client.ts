// Ручное создание клиента (для проверки и демо): npm run client:create -- email@example.ru пароль [dealId ...]
// В рабочем режиме аккаунты создаёт кнопка «Открыть личный кабинет» в сделке.
import bcrypt from 'bcryptjs';
import { Client } from 'pg';

async function main() {
  const [email, password, ...deals] = process.argv.slice(2);
  if (!email || !password) throw new Error('Использование: npm run client:create -- email пароль [dealId ...]');
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query<{ id: number }>(
      `INSERT INTO clients(email, password_hash, must_change_password) VALUES ($1, $2, FALSE)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id`,
      [email.toLowerCase(), hash],
    );
    for (const d of deals) {
      await db.query('INSERT INTO client_deals(client_id, deal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [rows[0].id, Number(d)]);
    }
    console.log(`client ${email} id=${rows[0].id} deals=${deals.join(',') || '—'}`);
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
