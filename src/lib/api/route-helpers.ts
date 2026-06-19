import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { getSessionFromRequest, type SessionPayload } from '@/lib/auth/session';
import { apiError } from '@/lib/http/api-error';

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function requireAuth(request: Request): SessionPayload {
  const session = getSessionFromRequest(request);
  if (!session) throw new AuthError('Unauthorized', 401);
  return session;
}

export function optionalAuth(request: Request): SessionPayload | null {
  return getSessionFromRequest(request);
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function handleRouteError(e: unknown) {
  if (e instanceof AuthError) return apiError(e.message, e.status);
  if (e instanceof Error && e.message === 'Forbidden') return apiError('Forbidden', 403);
  if (e instanceof Error && e.message.includes('not configured')) {
    return apiError('Service temporarily unavailable.', 503);
  }
  console.error(e);
  const message =
    process.env.NODE_ENV === 'production' ? 'Something went wrong. Please try again.' : e instanceof Error ? e.message : 'Internal server error';
  return apiError(message, 500);
}

export async function ensureDb() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured.');
  }
  const { getAdminFirestore } = await import('@/lib/firebase/admin');
  const { ensureAppTables } = await import('@/lib/firebase/collections');
  const db = getAdminFirestore();
  await ensureAppTables(db);
  return db;
}

export async function tryEnsureDb() {
  if (!isFirebaseConfigured()) return false;
  try {
    await ensureDb();
    const { ensureSeedData } = await import('@/lib/firestore/seed');
    await ensureSeedData();
    return true;
  } catch (e) {
    console.error('Firebase init failed:', e);
    return false;
  }
}
