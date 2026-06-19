import { withAuthMutation, withPublicRead } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getVehicle } from '@/lib/firestore/app-data';
import { deleteVehicle } from '@/lib/firestore/app-writes';
import { getDemoVehicles } from '@/lib/firestore/demo-fallback';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withPublicRead(
    async () => {
      const vehicle = await getVehicle(id);
      if (!vehicle) return null;
      return vehicle;
    },
    () => getDemoVehicles().find((v) => v.id === id) ?? null,
  );
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuthMutation(request, async () => {
    const session = getSessionFromRequest(request)!;
    const deleted = await deleteVehicle(session, id);
    return deleted ? { ok: true } : null;
  });
}
