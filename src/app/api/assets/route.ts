import { withPublicRead } from '@/lib/api/auth-handler';
import { getAssetsBundle } from '@/lib/firestore/app-data';
import { getDemoAssetsBundle } from '@/lib/firestore/demo-fallback';

export async function GET() {
  return withPublicRead(() => getAssetsBundle(), () => getDemoAssetsBundle());
}
