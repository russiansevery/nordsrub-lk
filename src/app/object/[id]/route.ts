import { NextResponse, type NextRequest } from 'next/server';
import { getSessionClient } from '@/lib/auth/session';

// Переключатель объекта: запоминаем выбранную сделку в cookie и возвращаем на главную.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getSessionClient();
  const res = NextResponse.redirect(new URL('/', req.url));
  if (client && client.dealIds.includes(Number(id))) {
    res.cookies.set('lk_object', id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 365 * 86_400 });
  }
  return res;
}
