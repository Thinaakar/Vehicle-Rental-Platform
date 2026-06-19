import { withOptionalAuth } from '@/lib/api/auth-handler';
import { getPlatformSnapshot } from '@/lib/firestore/app-data';

export async function GET(request: Request) {
  return withOptionalAuth(request, (session) => getPlatformSnapshot(session));
}
