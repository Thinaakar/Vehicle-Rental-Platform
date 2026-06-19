import { withPublicRead } from '@/lib/api/auth-handler';
import { getAssetsBundle } from '@/lib/firestore/app-data';

export async function GET() {
  return withPublicRead(() => getAssetsBundle());
}
