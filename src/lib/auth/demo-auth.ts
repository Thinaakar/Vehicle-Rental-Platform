import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getDemoUserAccountsForAuth } from '@/lib/firestore/demo-fallback';
import type { PublicUser } from '@/lib/types/records';

export type DemoLoginResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string; status: number };

export function verifyDemoLogin(
  email: string,
  password: string,
  selectedRole: 'customer' | 'vendor' | null | undefined,
): DemoLoginResult {
  const normalized = email.trim().toLowerCase();
  const account = getDemoUserAccountsForAuth().find((u) => u.email.toLowerCase() === normalized);

  if (!account || !verifyPassword(password, hashPassword(account.password))) {
    return { ok: false, error: 'Invalid email or password.', status: 401 };
  }

  if (account.role === 'vendor') {
    if (selectedRole !== 'vendor') {
      return {
        ok: false,
        error:
          selectedRole === 'customer'
            ? 'These credentials belong to a Vendor account. Please select Vendor.'
            : 'Please select Vendor before signing in with vendor credentials.',
        status: 401,
      };
    }
  } else if (account.role === 'customer') {
    if (selectedRole !== 'customer') {
      return {
        ok: false,
        error:
          selectedRole === 'vendor'
            ? 'These credentials belong to a Customer account. Please select Customer.'
            : 'Please select Customer before signing in with customer credentials.',
        status: 401,
      };
    }
  }

  const user: PublicUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    avatar: account.avatar,
    vendorId: account.vendorId,
    vendorName: account.vendorName,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };

  return { ok: true, user };
}
