import { withAuth, withAuthMutation } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { listFavoriteVehicleIds } from '@/lib/firestore/app-data';
import { toggleFavorite } from '@/lib/firestore/app-writes';
import { favoriteToggleSchema } from '@/lib/validation/entities';

export async function GET(request: Request) {
  return withAuth(request, async () => {
    const session = getSessionFromRequest(request)!;
    return listFavoriteVehicleIds(session.id);
  });
}

export async function POST(request: Request) {
  return withAuthMutation(request, async () => {
    const session = getSessionFromRequest(request)!;
    const body = favoriteToggleSchema.parse(await request.json());
    return toggleFavorite(session, body.vehicleId);
  });
}
