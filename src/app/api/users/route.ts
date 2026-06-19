import { withAuth } from '@/lib/api/auth-handler';
import { listUsers } from '@/lib/firestore/app-data';
import { getDemoUsers } from '@/lib/firestore/demo-fallback';

export async function GET(request: Request) {
  return withAuth(request, () => listUsers(), () => getDemoUsers());
}
