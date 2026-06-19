import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session';
import { ensureDb, handleRouteError, jsonData } from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { getUserRecordByEmail } from '@/lib/firestore/app-data';
import { markUserLogin } from '@/lib/firestore/app-writes';
import { ensureSeedData } from '@/lib/firestore/seed';
import { loginSchema } from '@/lib/validation/entities';

export async function POST(request: Request) {
  try {
    await ensureDb();
    await ensureSeedData();
    const body = loginSchema.parse(await request.json());
    const account = await getUserRecordByEmail(body.email);

    if (!account || !verifyPassword(body.password, account.passwordHash)) {
      return apiError('Invalid email or password.', 401);
    }
    if (account.status !== 'active') {
      return apiError('This account is inactive.', 403);
    }

    if (account.role === 'vendor') {
      if (body.selectedRole !== 'vendor') {
        return apiError(
          body.selectedRole === 'customer'
            ? 'These credentials belong to a Vendor account. Please select Vendor.'
            : 'Please select Vendor before signing in with vendor credentials.',
          401,
        );
      }
    } else if (account.role === 'customer') {
      if (body.selectedRole !== 'customer') {
        return apiError(
          body.selectedRole === 'vendor'
            ? 'These credentials belong to a Customer account. Please select Customer.'
            : 'Please select Customer before signing in with customer credentials.',
          401,
        );
      }
    }

    await markUserLogin(account.email);

    const token = createSessionToken({
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      vendorId: account.vendorId,
      vendorName: account.vendorName,
      avatar: account.avatar,
    });

    const res = jsonData({
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      vendorId: account.vendorId,
      vendorName: account.vendorName,
      avatar: account.avatar,
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    return handleRouteError(e);
  }
}
