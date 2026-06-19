import { withAuthMutation } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { updateVehicleStatus } from '@/lib/firestore/app-writes';
import { vehicleStatusSchema } from '@/lib/validation/entities';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuthMutation(request, async () => {
    const session = getSessionFromRequest(request)!;
    const body = vehicleStatusSchema.parse(await request.json());
    return updateVehicleStatus(session, id, body.status);
  });
}
