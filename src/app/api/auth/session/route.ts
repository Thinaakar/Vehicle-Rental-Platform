import { getSessionFromRequest } from '@/lib/auth/session';
import { ensureDb, handleRouteError, jsonData } from '@/lib/api/route-helpers';
import { getUserForSession } from '@/lib/firestore/app-writes';
import { ensureSeedData } from '@/lib/firestore/seed';

export async function GET(request: Request) {
  try {
    await ensureDb();
    await ensureSeedData();
    const session = getSessionFromRequest(request);
    if (!session) return jsonData(null);
    const user = await getUserForSession(session.id);
    return jsonData(user);
  } catch (e) {
    return handleRouteError(e);
  }
}
