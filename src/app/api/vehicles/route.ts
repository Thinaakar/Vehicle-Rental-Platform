import { withAuthMutation, withOptionalAuth, withPublicRead } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { listVehicles } from '@/lib/firestore/app-data';
import { createVehicle } from '@/lib/firestore/app-writes';
import { vehicleCreateSchema } from '@/lib/validation/entities';

export async function GET() {
  return withPublicRead(() => listVehicles());
}

export async function POST(request: Request) {
  return withAuthMutation(
    request,
    async () => {
      const session = getSessionFromRequest(request)!;
      const body = vehicleCreateSchema.parse(await request.json());
      return createVehicle(session, body);
    },
    { created: true },
  );
}
