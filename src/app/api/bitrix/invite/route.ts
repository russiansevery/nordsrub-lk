import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { env, isDemoMode } from '@/lib/env';
import { openCabinetForDeal } from '@/lib/auth/invite';

// Вызывается бизнес-процессом «Открыть личный кабинет» из карточки сделки:
// https://lk.nordsrub.ru/api/bitrix/invite?deal={{ID}}&token=<INVITE_SECRET>
export async function GET(req: NextRequest) {
  return handle(req, new URLSearchParams(req.nextUrl.search));
}

export async function POST(req: NextRequest) {
  const params = new URLSearchParams(req.nextUrl.search);
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
    const form = await req.formData();
    for (const [k, v] of form) if (typeof v === 'string' && !params.has(k)) params.set(k, v);
  }
  return handle(req, params);
}

async function handle(_req: NextRequest, params: URLSearchParams) {
  if (!env.inviteSecret || !safeEqual(params.get('token') ?? '', env.inviteSecret)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  if (isDemoMode()) {
    return NextResponse.json({ ok: false, error: 'BITRIX_WEBHOOK_URL не задан' }, { status: 503 });
  }
  const dealId = Number(params.get('deal'));
  if (!Number.isInteger(dealId) || dealId <= 0) {
    return NextResponse.json({ ok: false, error: 'bad deal id' }, { status: 400 });
  }
  try {
    const result = await openCabinetForDeal(dealId);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (e) {
    console.error('invite failed', e);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
