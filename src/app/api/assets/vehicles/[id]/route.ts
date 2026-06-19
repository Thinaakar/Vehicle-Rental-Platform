import { withPublicRead } from '@/lib/api/auth-handler';
import { getAppAsset } from '@/lib/firestore/app-data';
import { FIREBASE_VEHICLE_IMAGES } from '@/data/firebase-assets';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withPublicRead(async () => {
    const asset = await getAppAsset(id);
    const url = asset?.url || FIREBASE_VEHICLE_IMAGES[id] || null;
    return { id, url };
  });
}
