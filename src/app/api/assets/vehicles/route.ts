import { withPublicRead } from '@/lib/api/auth-handler';
import { getVehicleImagesMap } from '@/lib/firestore/app-data';
import { FIREBASE_VEHICLE_IMAGES } from '@/data/firebase-assets';

export async function GET() {
  return withPublicRead(
    () => getVehicleImagesMap(),
    () => ({ ...FIREBASE_VEHICLE_IMAGES }),
  );
}
