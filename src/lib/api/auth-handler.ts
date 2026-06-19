import { ensureSeedData } from '@/lib/firestore/seed';
import { ensureDb, handleRouteError, jsonData, optionalAuth, requireAuth } from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';

export async function withAuth<T>(
  request: Request,
  handler: () => Promise<T>,
  status = 200,
) {
  try {
    await ensureDb();
    await ensureSeedData();
    requireAuth(request);
    const data = await handler();
    return jsonData(data, status);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function withOptionalAuth<T>(
  request: Request,
  handler: (session: ReturnType<typeof optionalAuth>) => Promise<T>,
  status = 200,
) {
  try {
    await ensureDb();
    await ensureSeedData();
    const session = optionalAuth(request);
    const data = await handler(session);
    return jsonData(data, status);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function withAuthMutation<T>(
  request: Request,
  handler: () => Promise<T | null>,
  options?: { notFound?: string; created?: boolean },
) {
  try {
    await ensureDb();
    await ensureSeedData();
    requireAuth(request);
    const data = await handler();
    if (data === null) return apiError(options?.notFound ?? 'Not found', 404);
    return jsonData(data, options?.created ? 201 : 200);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function withPublicRead<T>(handler: () => Promise<T>, status = 200) {
  try {
    await ensureDb();
    await ensureSeedData();
    const data = await handler();
    return jsonData(data, status);
  } catch (e) {
    return handleRouteError(e);
  }
}
