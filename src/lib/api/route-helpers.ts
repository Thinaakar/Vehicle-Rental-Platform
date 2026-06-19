import { NextResponse } from 'next/server';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { ensureAppTables } from '@/lib/firebase/collections';
import { getSessionFromRequest, type SessionPayload } from '@/lib/auth/session';
import { apiError } from '@/lib/http/api-error';

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export async function ensureDb() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Set FIREBASE_CREDENTIALS in .env.local');
  }
  const db = getAdminFirestore();
  await ensureAppTables(db);
  return db;
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
    return apiError(e.message, 503);
  }
  console.error(e);
  return apiError(e instanceof Error ? e.message : 'Internal server error', 500);
}
