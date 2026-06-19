import { withAuthMutation, withPublicRead } from '@/lib/api/auth-handler';
import { getSessionFromRequest } from '@/lib/auth/session';
import { listReviews } from '@/lib/firestore/app-data';
import { createReview } from '@/lib/firestore/app-writes';
import { getDemoReviews } from '@/lib/firestore/demo-fallback';
import { reviewCreateSchema } from '@/lib/validation/entities';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
  return withPublicRead(
    () => listReviews(vehicleId),
    () => {
      const reviews = getDemoReviews();
      return vehicleId ? reviews.filter((r) => r.vehicleId === vehicleId) : reviews;
    },
  );
}

export async function POST(request: Request) {
  return withAuthMutation(
    request,
    async () => {
      const session = getSessionFromRequest(request)!;
      const body = reviewCreateSchema.parse(await request.json());
      return createReview(session, body);
    },
    { created: true },
  );
}
