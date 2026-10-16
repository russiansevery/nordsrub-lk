// Выводит стадии воронки «Проекты» и то, каким этапам кабинета они соответствуют.
// Запуск на сервере: npm run bitrix:stages (нужен BITRIX_WEBHOOK_URL в окружении).
import { createBitrixClient } from '../src/lib/bitrix/client';
import { clientStageIndex, CLIENT_STAGES } from '../src/lib/project/stages';

async function main() {
  const url = process.env.BITRIX_WEBHOOK_URL;
  if (!url) throw new Error('BITRIX_WEBHOOK_URL не задан');
  const b = createBitrixClient(url);
  const rows = await b.call<{ STATUS_ID: string; NAME: string; SORT: string }[]>('crm.status.list', {
    filter: { ENTITY_ID: 'DEAL_STAGE_2' },
    order: { SORT: 'ASC' },
  });
  for (const r of rows) {
    const idx = clientStageIndex(r.STATUS_ID, r.NAME);
    console.log(`${r.STATUS_ID.padEnd(16)} ${r.NAME.padEnd(36)} → ${idx === null ? '(скрыта)' : CLIENT_STAGES[idx].name}`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
