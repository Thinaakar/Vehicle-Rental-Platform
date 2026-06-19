import { getSessionFromRequest } from '@/lib/auth/session';
import { handleRouteError, jsonData, tryEnsureDb } from '@/lib/api/route-helpers';
import { sessionToPublicUser } from '@/lib/firestore/demo-fallback';
import { getUserForSession } from '@/lib/firestore/app-writes';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return jsonData(null);

    if (!(await tryEnsureDb())) {
      return jsonData(sessionToPublicUser(session));
    }

    const user = await getUserForSession(session.id);
    return jsonData(user ?? sessionToPublicUser(session));
  } catch (e) {
    return handleRouteError(e);
  }
}
