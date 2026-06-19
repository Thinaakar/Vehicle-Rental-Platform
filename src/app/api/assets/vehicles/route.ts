import { withPublicRead } from '@/lib/api/auth-handler';
import { getVehicleImagesMap } from '@/lib/firestore/app-data';

export async function GET() {
  return withPublicRead(() => getVehicleImagesMap());
}
