import { withOptionalAuth } from '@/lib/api/auth-handler';
import { getPlatformSnapshot } from '@/lib/firestore/app-data';
import { getDemoPlatformSnapshot } from '@/lib/firestore/demo-fallback';

export async function GET(request: Request) {
  return withOptionalAuth(
    request,
    (session) => getPlatformSnapshot(session),
    (session) => getDemoPlatformSnapshot(session),
  );
}
