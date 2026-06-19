import { withAuth } from '@/lib/api/auth-handler';
import { listVendors } from '@/lib/firestore/app-data';
import { getDemoVendors } from '@/lib/firestore/demo-fallback';

export async function GET(request: Request) {
  return withAuth(request, () => listVendors(), () => getDemoVendors());
}
