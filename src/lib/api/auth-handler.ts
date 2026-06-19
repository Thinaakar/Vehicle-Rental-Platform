import { ensureSeedData } from '@/lib/firestore/seed';
import {
  handleRouteError,
  jsonData,
  optionalAuth,
  requireAuth,
  tryEnsureDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';

async function withFirebase<T>(
  handler: () => Promise<T>,
  fallback: () => T,
  status = 200,
): Promise<Response> {
  try {
    const ready = await tryEnsureDb();
    if (!ready) return jsonData(fallback(), status);
    const data = await handler();
    return jsonData(data, status);
  } catch (e) {
    console.error(e);
    return jsonData(fallback(), status);
  }
}

export async function withAuth<T>(
  request: Request,
  handler: () => Promise<T>,
  fallback: () => T,
  status = 200,
) {
  try {
    requireAuth(request);
    return withFirebase(handler, fallback, status);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function withOptionalAuth<T>(
  request: Request,
  handler: (session: ReturnType<typeof optionalAuth>) => Promise<T>,
  fallback: (session: ReturnType<typeof optionalAuth>) => T,
  status = 200,
) {
  try {
    const session = optionalAuth(request);
    return withFirebase(() => handler(session), () => fallback(session), status);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function withAuthMutation<T>(
  request: Request,
  handler: () => Promise<T | null>,
  options?: { notFound?: string; created?: boolean; fallback?: () => T | null },
) {
  try {
    requireAuth(request);
    const ready = await tryEnsureDb();
    if (!ready) {
      const data = options?.fallback?.() ?? null;
      if (data === null) return apiError('Live updates require Firebase. Demo data is read-only.', 503);
      return jsonData(data, options?.created ? 201 : 200);
    }
    await ensureSeedData();
    const data = await handler();
    if (data === null) return apiError(options?.notFound ?? 'Not found', 404);
    return jsonData(data, options?.created ? 201 : 200);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function withPublicRead<T>(handler: () => Promise<T>, fallback: () => T, status = 200) {
  return withFirebase(handler, fallback, status);
}
