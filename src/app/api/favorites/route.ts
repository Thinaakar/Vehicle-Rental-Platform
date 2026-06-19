import { withAuth, withAuthMutation } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { listFavoriteVehicleIds } from '@/lib/firestore/app-data';
import { toggleFavorite } from '@/lib/firestore/app-writes';
import { getDemoPlatformSnapshot } from '@/lib/firestore/demo-fallback';
import { favoriteToggleSchema } from '@/lib/validation/entities';

export async function GET(request: Request) {
  return withAuth(
    request,
    async () => {
      const session = getSessionFromRequest(request)!;
      return listFavoriteVehicleIds(session.id);
    },
    () => {
      const session = getSessionFromRequest(request);
      return session ? getDemoPlatformSnapshot(session).favoriteVehicleIds : [];
    },
  );
}

export async function POST(request: Request) {
  return withAuthMutation(request, async () => {
    const session = getSessionFromRequest(request)!;
    const body = favoriteToggleSchema.parse(await request.json());
    return toggleFavorite(session, body.vehicleId);
  });
}
