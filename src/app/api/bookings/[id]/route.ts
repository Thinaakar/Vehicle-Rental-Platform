import { withAuth } from '@/lib/api/auth-handler';
import { getBooking, listBookingsForSession } from '@/lib/firestore/app-data';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(request, async () => {
    const session = getSessionFromRequest(request)!;
    const booking = await getBooking(id);
    if (!booking) return null;
    const allowed = (await listBookingsForSession(session)).some((b) => b.id === id);
    if (!allowed) throw new Error('Forbidden');
    return booking;
  });
}
