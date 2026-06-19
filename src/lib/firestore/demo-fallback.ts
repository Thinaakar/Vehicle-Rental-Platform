/** Static demo data when Firestore is unavailable (local dev / deploy without Firebase env). */

import type { SessionPayload } from '@/lib/auth/session';
import {
  getSeedAppAssets,
  getSeedBookings,
  SEED_FAVORITES,
  SEED_REVIEWS,
  SEED_VEHICLES,
  SEED_VENDORS,
} from '@/data/seed-defaults';
import {
  FIREBASE_FAVICON,
  FIREBASE_LOGIN_HERO,
  FIREBASE_MARKETING_HERO,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_VEHICLE_IMAGES,
} from '@/data/firebase-assets';
import type { AssetsBundle, PlatformSnapshot, PublicUser } from '@/lib/types/records';
import type { Booking } from '@/data/platform-types';
import { applyVehicleStatusesFromBookings } from '@/data/mock-rental-pipeline';

export function getDemoAssetsBundle(): AssetsBundle {
  return {
    bucket: FIREBASE_STORAGE_BUCKET,
    vehicles: { ...FIREBASE_VEHICLE_IMAGES },
    marketingHero: FIREBASE_MARKETING_HERO,
    loginHero: FIREBASE_LOGIN_HERO,
    favicon: FIREBASE_FAVICON,
  };
}

export function getDemoVehicles() {
  return [...SEED_VEHICLES];
}

export function getDemoReviews() {
  return [...SEED_REVIEWS];
}

export function getDemoBookings(): Booking[] {
  return getSeedBookings();
}

export function getDemoPlatformSnapshot(session: SessionPayload | null): PlatformSnapshot {
  const bookings = getDemoBookings();
  const vehicles = applyVehicleStatusesFromBookings(getDemoVehicles(), bookings);

  let scopedBookings = bookings;
  let favoriteVehicleIds: string[] = [];

  if (session?.role === 'vendor' && session.vendorId) {
    scopedBookings = bookings.filter((b) => b.vendorId === session.vendorId);
  } else if (session?.role === 'customer') {
    scopedBookings = bookings.filter((b) => b.customerId === session.id);
    favoriteVehicleIds = SEED_FAVORITES.filter((f) => f.userId === session.id).map((f) => f.vehicleId);
  } else if (!session) {
    scopedBookings = [];
  }

  return {
    vehicles,
    bookings: scopedBookings,
    reviews: getDemoReviews(),
    favoriteVehicleIds,
  };
}

export function getDemoUsers(): PublicUser[] {
  return [
    {
      id: 'user-admin',
      name: 'System Administrator',
      email: 'admin@vehiclerental.com',
      role: 'admin',
      avatar: 'SA',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'user-vendor',
      name: 'Premium Fleet Vendor',
      email: 'vendor@vehiclerental.com',
      role: 'vendor',
      avatar: 'PV',
      vendorId: 'vendor-1',
      vendorName: 'Apex Exotic Rentals',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'user-customer',
      name: 'John Customer',
      email: 'customer@vehiclerental.com',
      role: 'customer',
      avatar: 'JC',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    },
  ];
}

export function getDemoVendors() {
  return SEED_VENDORS.map((v) => ({
    ...v,
    createdAt: '',
    updatedAt: '',
  }));
}

export function sessionToPublicUser(session: SessionPayload): PublicUser {
  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as PublicUser['role'],
    avatar: session.avatar,
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  };
}
