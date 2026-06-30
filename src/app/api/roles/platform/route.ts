import {
  handleRouteError,
  jsonData,
  requireAuth,
  tryEnsureDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { ensureSeedData } from '@/lib/firestore/seed';
import { hasPermission, type Permission } from '@/data/roles-permissions';
import type { AuthRole } from '@/context/AuthContext';
import {
  addDemoPlatformRole,
  deleteDemoPlatformRole,
  getDemoPlatformRoles,
} from '@/lib/firestore/demo-fallback';
import {
  createPlatformRole,
  deletePlatformRole,
  listPlatformRoles,
} from '@/lib/firestore/platform-roles';

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

export async function GET() {
  try {
    const ready = await tryEnsureDb();
    if (!ready) return jsonData(getDemoPlatformRoles());
    const data = await listPlatformRoles();
    return jsonData(data);
  } catch (e) {
    console.error(e);
    return jsonData(getDemoPlatformRoles());
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const authUser = sessionToAuthUser(session);

    if (!hasPermission(authUser, 'roles:manage')) {
      return apiError('Forbidden', 403);
    }

    const body = (await request.json()) as {
      label?: string;
      description?: string;
      portal?: AuthRole;
      permissions?: Permission[];
    };

    if (!body.label?.trim()) return apiError('Role name is required', 400);
    if (body.portal !== 'admin' && body.portal !== 'vendor' && body.portal !== 'customer') {
      return apiError('Valid portal is required', 400);
    }

    const ready = await tryEnsureDb();
    if (!ready) {
      try {
        const role = addDemoPlatformRole({
          label: body.label,
          description: body.description,
          portal: body.portal,
          permissions: body.permissions ?? [],
        });
        return jsonData(role, 201);
      } catch (err) {
        return apiError(err instanceof Error ? err.message : 'Failed to create role', 400);
      }
    }

    await ensureSeedData();
    const role = await createPlatformRole(session, {
      label: body.label,
      description: body.description,
      portal: body.portal,
      permissions: body.permissions ?? [],
    });
    return jsonData(role, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = requireAuth(request);
    const authUser = sessionToAuthUser(session);

    if (!hasPermission(authUser, 'roles:manage')) {
      return apiError('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Role id is required', 400);

    const ready = await tryEnsureDb();
    if (!ready) {
      try {
        deleteDemoPlatformRole(id);
        return jsonData({ ok: true });
      } catch (err) {
        return apiError(err instanceof Error ? err.message : 'Failed to delete role', 400);
      }
    }

    await deletePlatformRole(session, id);
    return jsonData({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
