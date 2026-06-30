import {
  handleRouteError,
  jsonData,
  requireAuth,
  tryEnsureDb,
} from '@/lib/api/route-helpers';
import { apiError } from '@/lib/http/api-error';
import { ensureSeedData } from '@/lib/firestore/seed';
import { hasPermission } from '@/data/roles-permissions';
import type { AuthRole } from '@/context/AuthContext';
import {
  addDemoMasterDataItem,
  getDemoMasterData,
  removeDemoMasterDataItem,
} from '@/lib/firestore/demo-fallback';
import {
  addMasterDataItem,
  getMasterData,
  removeMasterDataItem,
} from '@/lib/firestore/master-data';

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
    if (!ready) return jsonData(getDemoMasterData());
    const data = await getMasterData();
    return jsonData(data);
  } catch (e) {
    console.error(e);
    return jsonData(getDemoMasterData());
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuth(request);
    const authUser = sessionToAuthUser(session);

    if (!hasPermission(authUser, 'platform:settings')) {
      return apiError('Forbidden', 403);
    }

    const body = (await request.json()) as {
      action?: 'add' | 'remove';
      type?: 'locations' | 'categories';
      value?: string;
    };

    if (body.action !== 'add' && body.action !== 'remove') {
      return apiError('Valid action is required', 400);
    }
    if (body.type !== 'locations' && body.type !== 'categories') {
      return apiError('Valid type is required', 400);
    }
    if (!body.value?.trim()) return apiError('Value is required', 400);

    const ready = await tryEnsureDb();
    if (!ready) {
      try {
        const data =
          body.action === 'add'
            ? addDemoMasterDataItem(body.type, body.value)
            : removeDemoMasterDataItem(body.type, body.value);
        return jsonData(data);
      } catch (err) {
        return apiError(err instanceof Error ? err.message : 'Master data update failed', 400);
      }
    }

    await ensureSeedData();
    const data =
      body.action === 'add'
        ? await addMasterDataItem(body.type, body.value)
        : await removeMasterDataItem(body.type, body.value);
    return jsonData(data);
  } catch (e) {
    return handleRouteError(e);
  }
}
