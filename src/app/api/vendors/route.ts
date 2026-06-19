import { withAuth } from '@/lib/api/auth-handler';
import { listVendors } from '@/lib/firestore/app-data';

export async function GET(request: Request) {
  return withAuth(request, () => listVendors());
}
