import { withPublicRead } from '@/lib/api/auth-handler';
import { getAssetsBundle } from '@/lib/firestore/app-data';
import { FIREBASE_FAVICON } from '@/data/firebase-assets';

export async function GET() {
  return withPublicRead(
    async () => {
      const bundle = await getAssetsBundle();
      return { url: bundle.favicon };
    },
    () => ({ url: FIREBASE_FAVICON }),
  );
}
