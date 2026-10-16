// Тонкий клиент REST API Битрикс24 через входящий вебхук.
// Вебхук — секрет: используется только на сервере и никогда не пишется в логи.

export class BitrixError extends Error {
  constructor(
    public readonly method: string,
    public readonly code: string,
    description: string,
  ) {
    super(`Bitrix ${method}: ${code} ${description}`.trim());
  }
}

type BitrixResponse<T> = {
  result?: T;
  next?: number;
  total?: number;
  error?: string;
  error_description?: string;
};

const RETRYABLE = new Set(['QUERY_LIMIT_EXCEEDED', 'OPERATION_TIME_LIMIT']);

export function createBitrixClient(webhookUrl: string, fetchImpl: typeof fetch = fetch) {
  const base = webhookUrl.endsWith('/') ? webhookUrl : `${webhookUrl}/`;

  async function raw<T>(method: string, params: Record<string, unknown>, attempt = 0): Promise<BitrixResponse<T>> {
    const res = await fetchImpl(`${base}${method}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store',
    });
    let body: BitrixResponse<T>;
    try {
      body = (await res.json()) as BitrixResponse<T>;
    } catch {
      throw new BitrixError(method, `HTTP_${res.status}`, 'ответ не JSON');
    }
    if (body.error) {
      if (RETRYABLE.has(body.error) && attempt < 4) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        return raw<T>(method, params, attempt + 1);
      }
      throw new BitrixError(method, body.error, body.error_description ?? '');
    }
    return body;
  }

  return {
    async call<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
      return (await raw<T>(method, params)).result as T;
    },

    /** Списочные методы отдают по 50 записей; собираем все страницы. */
    async list<T>(method: string, params: Record<string, unknown> = {}, pick?: (result: unknown) => T[]): Promise<T[]> {
      const out: T[] = [];
      let start: number | undefined = 0;
      while (start !== undefined) {
        const body: BitrixResponse<unknown> = await raw<unknown>(method, { ...params, start });
        out.push(...(pick ? pick(body.result) : (body.result as T[])));
        start = body.next;
      }
      return out;
    },
  };
}

export type BitrixClient = ReturnType<typeof createBitrixClient>;
