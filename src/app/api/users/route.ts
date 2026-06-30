import {
  handleRouteError,
  jsonData,
  requireAuth,
  tryEnsureDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { ensureSeedData } from '@/lib/firestore/seed';
import { hasPermission } from '@/data/roles-permissions';
import { listUsers } from '@/lib/firestore/app-data';
import { createUser } from '@/lib/firestore/app-writes';
import { addDemoUser, getDemoUsers } from '@/lib/firestore/demo-fallback';
import type { AuthRole } from '@/context/AuthContext';

function sessionToAuthUser(session: ReturnType<typeof requireAuth>) {
  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as AuthRole,
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    avatar: session.avatar,
  };
}

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const ready = await tryEnsureDb();
    if (!ready) return jsonData(getDemoUsers());
    const data = await listUsers();
    return jsonData(data);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const authUser = sessionToAuthUser(session);

    if (!hasPermission(authUser, 'users:manage')) {
      return apiError('Forbidden', 403);
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: AuthRole;
      vendorId?: string;
      vendorName?: string;
    };

    if (!body.name?.trim()) return apiError('Name is required', 400);
    if (!body.email?.trim()) return apiError('Email is required', 400);
    if (!body.password || body.password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }
    if (body.role !== 'admin' && body.role !== 'vendor' && body.role !== 'customer') {
      return apiError('Valid role is required', 400);
    }

    const ready = await tryEnsureDb();
    if (!ready) {
      try {
        const user = addDemoUser({
          name: body.name,
          email: body.email,
          password: body.password,
          role: body.role,
          vendorId: body.vendorId,
          vendorName: body.vendorName,
        });
        return jsonData(user, 201);
      } catch (err) {
        return apiError(err instanceof Error ? err.message : 'Failed to create user', 400);
      }
    }

    await ensureSeedData();
    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      vendorId: body.vendorId,
      vendorName: body.vendorName,
    });
    return jsonData(user, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
