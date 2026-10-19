import { describe, expect, it, vi } from 'vitest';
import { BitrixError, createBitrixClient } from './client';

const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

describe('createBitrixClient', () => {
  it('posts to <webhook>/<method>.json and returns result', async () => {
    const fetchMock = vi.fn(async () => json({ result: { ID: '5' } }));
    const b = createBitrixClient('https://portal.bitrix24.ru/rest/1/key', fetchMock as unknown as typeof fetch);
    await expect(b.call('crm.deal.get', { id: 5 })).resolves.toEqual({ ID: '5' });
    expect(fetchMock).toHaveBeenCalledWith('https://portal.bitrix24.ru/rest/1/key/crm.deal.get.json', expect.objectContaining({ method: 'POST', body: '{"id":5}' }));
  });

  it('collects every page of a list method', async () => {
    const pages = [json({ result: [1, 2], next: 2 }), json({ result: [3] })];
    const fetchMock = vi.fn(async () => pages.shift()!);
    const b = createBitrixClient('https://p/rest/1/k/', fetchMock as unknown as typeof fetch);
    await expect(b.list<number>('crm.deal.list')).resolves.toEqual([1, 2, 3]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws BitrixError with the API error code', async () => {
    const b = createBitrixClient('https://p/rest/1/k/', (async () => json({ error: 'NOT_FOUND', error_description: 'Not found' })) as unknown as typeof fetch);
    await expect(b.call('crm.deal.get')).rejects.toBeInstanceOf(BitrixError);
  });
});
