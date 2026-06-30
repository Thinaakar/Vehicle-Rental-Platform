import {
  handleRouteError,
  jsonData,
  requireAuth,
  tryEnsureDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { ensureSeedData } from '@/lib/firestore/seed';
import { hasPermission } from '@/data/roles-permissions';
import { listVendors } from '@/lib/firestore/app-data';
import { createVendor } from '@/lib/firestore/app-writes';
import { addDemoVendor, getDemoVendors } from '@/lib/firestore/demo-fallback';
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
    if (!ready) return jsonData(getDemoVendors());
    const data = await listVendors();
    return jsonData(data);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const authUser = sessionToAuthUser(session);

    if (!hasPermission(authUser, 'platform:settings')) {
      return apiError('Forbidden', 403);
    }

    const body = (await request.json()) as { name?: string; location?: string };
    if (!body.name?.trim()) return apiError('Vendor name is required', 400);

    const ready = await tryEnsureDb();
    if (!ready) {
      const vendor = addDemoVendor({ name: body.name, location: body.location });
      return jsonData(vendor, 201);
    }

    await ensureSeedData();
    const vendor = await createVendor({ name: body.name, location: body.location });
    return jsonData(vendor, 201);
  } catch (e) {
    return handleRouteError(e);
  }
}
