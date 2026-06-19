import { withAuthMutation } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { updateBookingStatus } from '@/lib/firestore/app-writes';
import { bookingStatusSchema } from '@/lib/validation/entities';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuthMutation(request, async () => {
    const session = getSessionFromRequest(request)!;
    const body = bookingStatusSchema.parse(await request.json());
    return updateBookingStatus(session, id, body.status);
  });
}
