import { withAuthMutation, withPublicRead } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { listVehicles, getVehicle } from '@/lib/firestore/app-data';
import { createVehicle } from '@/lib/firestore/app-writes';
import { getDemoVehicles } from '@/lib/firestore/demo-fallback';
import { vehicleCreateSchema } from '@/lib/validation/entities';

export async function GET() {
  return withPublicRead(() => listVehicles(), () => getDemoVehicles());
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
