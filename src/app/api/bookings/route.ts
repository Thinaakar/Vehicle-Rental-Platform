import { withAuth, withAuthMutation } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { listBookingsForSession } from '@/lib/firestore/app-data';
import { createBooking } from '@/lib/firestore/app-writes';
import { bookingCreateSchema } from '@/lib/validation/entities';

export async function GET(request: Request) {
  return withAuth(request, async () => {
    const session = getSessionFromRequest(request)!;
    return listBookingsForSession(session);
  });
}

export async function POST(request: Request) {
  return withAuthMutation(
    request,
    async () => {
      const session = getSessionFromRequest(request)!;
      const body = bookingCreateSchema.parse(await request.json());
      return createBooking(session, body);
    },
    { created: true },
  );
}
