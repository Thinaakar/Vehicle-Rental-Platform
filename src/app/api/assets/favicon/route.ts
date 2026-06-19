import { withPublicRead } from '@/lib/api/auth-handler';
import { getAssetsBundle } from '@/lib/firestore/app-data';

export async function GET() {
  return withPublicRead(async () => {
    const bundle = await getAssetsBundle();
    return { url: bundle.favicon };
  });
}
