import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session';
import { jsonData } from '@/lib/api/route-helpers';

export async function POST() {
  const res = jsonData({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
