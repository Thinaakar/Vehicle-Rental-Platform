import { withAuthMutation } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { resetDemoData } from '@/lib/firestore/app-writes';

export async function POST(request: Request) {
  return withAuthMutation(
    request,
    async () => {
      const session = getSessionFromRequest(request)!;
      await resetDemoData(session);
      return { ok: true };
    },
    { fallback: () => ({ ok: true }) },
  );
}
