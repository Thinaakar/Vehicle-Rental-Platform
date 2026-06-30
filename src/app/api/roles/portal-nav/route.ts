import {
  handleRouteError,
  jsonData,
  requireAuth,
  tryEnsureDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { ensureSeedData } from '@/lib/firestore/seed';
import type { PortalRole } from '@/data/portal-nav-permissions';
import { hasPermission } from '@/data/roles-permissions';
import { getDemoPortalNavConfig, updateDemoPortalNavConfig } from '@/lib/firestore/demo-fallback';
import { getPortalNavConfig, updatePortalNavConfig } from '@/lib/firestore/portal-roles';

function sessionToAuthUser(session: ReturnType<typeof requireAuth>) {
  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as 'admin' | 'vendor' | 'customer',
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    avatar: session.avatar,
  };
}

export async function GET() {
  try {
    const ready = await tryEnsureDb();
    if (!ready) return jsonData(getDemoPortalNavConfig());
    const data = await getPortalNavConfig();
    return jsonData(data);
  } catch (e) {
    console.error(e);
    return jsonData(getDemoPortalNavConfig());
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireAuth(request);
    const authUser = sessionToAuthUser(session);

    if (!hasPermission(authUser, 'roles:manage')) {
      return apiError('Forbidden', 403);
    }

    const body = (await request.json()) as { role?: PortalRole; permissions?: string[] };
    if (!body.role || (body.role !== 'vendor' && body.role !== 'customer')) {
      return apiError('Valid role (vendor or customer) is required', 400);
    }
    if (!body.permissions?.length) {
      return apiError('At least one navigation permission is required', 400);
    }

    const ready = await tryEnsureDb();
    if (!ready) {
      return jsonData(updateDemoPortalNavConfig(body.role, body.permissions));
    }

    await ensureSeedData();
    const data = await updatePortalNavConfig(session, body.role, body.permissions);
    return jsonData(data);
  } catch (e) {
    return handleRouteError(e);
  }
}
