/** Firestore write helpers for DriveXPro. */

import { FieldValue } from 'firebase-admin/firestore';
import type { SessionPayload } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import {
  applyVehicleStatusesFromBookings,
  calcBookingTotal,
} from '@/data/mock-rental-pipeline';
import {
  getSeedAppAssets,
  getSeedBookings,
  SEED_FAVORITES,
  SEED_REVIEWS,
  SEED_USERS,
  SEED_VEHICLES,
  SEED_VENDORS,
} from '@/data/seed-defaults';
import { stripUndefined, toPublicUser } from '@/lib/firestore/helpers';
import type { PublicUser, UserRecord } from '@/lib/types/records';
import type { Booking, Review, Vehicle } from '@/data/platform-types';
import {
  canAddVehicle,
  canCreateBooking,
  canDeleteVehicle,
  canManageBookingStatus,
  canSubmitReview,
  canUpdateVehicleStatus,
  hasPermission,
} from '@/data/roles-permissions';
import { getBooking, getUserRecordById, getVehicle, listAllBookings, listReviews } from '@/lib/firestore/app-data';

function col(table: string) {
  return appCollection(getAdminFirestore(), table);
}

async function ensureDbReady() {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  return db;
}

const ts = () => ({
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
});

const tsUpdate = () => ({
  updatedAt: FieldValue.serverTimestamp(),
});

function sessionToAuthUser(session: SessionPayload) {
  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as 'admin' | 'vendor' | 'customer',
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    avatar: session.avatar,
  };
}

export async function seedDocument(
  tableKey: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await col(tableKey).doc(id).set(data, { merge: true });
}

export async function markUserLogin(email: string): Promise<void> {
  await ensureDbReady();
  const snap = await col('users').where('email', '==', email.trim().toLowerCase()).limit(1).get();
  if (snap.empty) return;
  await snap.docs[0].ref.set({ ...tsUpdate() }, { merge: true });
}

export async function createBooking(
  session: SessionPayload,
  input: { vehicleId: string; startDate: string; endDate: string; customerName?: string },
): Promise<Booking> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  if (!canCreateBooking(authUser)) throw new Error('Forbidden');

  const vehicle = await getVehicle(input.vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');

  const ref = col('bookings').doc();
  const totalAmount = calcBookingTotal(vehicle.price, input.startDate, input.endDate);
  const createdAt = new Date().toISOString();
  const payload = {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    vehicleImage: vehicle.image,
    customerId: session.id,
    customerName: input.customerName?.trim() || session.name,
    vendorId: vehicle.vendorId,
    startDate: input.startDate,
    endDate: input.endDate,
    totalAmount,
    status: 'Pending',
    createdAt,
    ...tsUpdate(),
  };
  await ref.set(payload);

  const bookings = await listAllBookings();
  await syncVehicleStatusesFromBookings(bookings);

  return {
    id: ref.id,
    vehicleId: payload.vehicleId,
    vehicleName: payload.vehicleName,
    vehicleImage: payload.vehicleImage,
    customerId: payload.customerId,
    customerName: payload.customerName,
    vendorId: payload.vendorId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    totalAmount: payload.totalAmount,
    status: payload.status as Booking['status'],
    createdAt,
  };
}

export async function updateBookingStatus(
  session: SessionPayload,
  bookingId: string,
  status: Booking['status'],
): Promise<Booking | null> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  const booking = await getBooking(bookingId);
  if (!booking || !canManageBookingStatus(authUser, booking, status)) {
    throw new Error('Forbidden');
  }

  await col('bookings').doc(bookingId).set(stripUndefined({ status, ...tsUpdate() }), { merge: true });
  const bookings = await listAllBookings();
  await syncVehicleStatusesFromBookings(bookings);
  return getBooking(bookingId);
}

async function syncVehicleStatusesFromBookings(bookings: Booking[]) {
  const snap = await col('vehicles').get();
  const vehicles = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Vehicle, 'id'>),
  })) as Vehicle[];
  const synced = applyVehicleStatusesFromBookings(vehicles, bookings);
  const batch = getAdminFirestore().batch();
  for (const vehicle of synced) {
    batch.set(col('vehicles').doc(vehicle.id), stripUndefined({ status: vehicle.status, ...tsUpdate() }), {
      merge: true,
    });
  }
  await batch.commit();
}

export async function createVehicle(
  session: SessionPayload,
  input: Omit<Vehicle, 'id' | 'rating' | 'vendorId' | 'vendorName' | 'status'>,
): Promise<Vehicle> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  if (!canAddVehicle(authUser)) throw new Error('Forbidden');

  const ref = col('vehicles').doc();
  const payload = stripUndefined({
    ...input,
    rating: 5,
    vendorId: authUser.vendorId ?? 'vendor-current',
    vendorName: authUser.vendorName ?? 'Fleet Partner',
    status: 'Available',
    ...ts(),
  });
  await ref.set(payload);
  return {
    id: ref.id,
    ...input,
    rating: 5,
    vendorId: authUser.vendorId ?? 'vendor-current',
    vendorName: authUser.vendorName ?? 'Fleet Partner',
    status: 'Available',
  };
}

export async function updateVehicleStatus(
  session: SessionPayload,
  vehicleId: string,
  status: Vehicle['status'],
): Promise<Vehicle | null> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  const vehicle = await getVehicle(vehicleId);
  if (!vehicle || !canUpdateVehicleStatus(authUser, vehicle)) throw new Error('Forbidden');

  await col('vehicles').doc(vehicleId).set(stripUndefined({ status, ...tsUpdate() }), { merge: true });
  return getVehicle(vehicleId);
}

export async function deleteVehicle(session: SessionPayload, vehicleId: string): Promise<boolean> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  const vehicle = await getVehicle(vehicleId);
  if (!vehicle || !canDeleteVehicle(authUser, vehicle)) throw new Error('Forbidden');

  await col('vehicles').doc(vehicleId).delete();
  return true;
}

export async function createReview(
  session: SessionPayload,
  input: { vehicleId: string; rating: number; comment: string },
): Promise<Review> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  if (!canSubmitReview(authUser)) throw new Error('Forbidden');

  const vehicle = await getVehicle(input.vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');

  const ref = col('reviews').doc();
  const payload = {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    customerId: session.id,
    customerName: session.name,
    rating: input.rating,
    comment: input.comment.trim(),
    date: new Date().toISOString().split('T')[0],
    ...ts(),
  };
  await ref.set(payload);

  const reviews = await listReviews(vehicle.id);
  const avgRating = Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1));
  await col('vehicles').doc(vehicle.id).set(stripUndefined({ rating: avgRating, ...tsUpdate() }), { merge: true });

  return { id: ref.id, ...payload };
}

export async function toggleFavorite(session: SessionPayload, vehicleId: string): Promise<string[]> {
  await ensureDbReady();
  if (session.role !== 'customer') throw new Error('Forbidden');

  const snap = await col('favorites').where('userId', '==', session.id).get();
  const existing = snap.docs.find((doc) => doc.data().vehicleId === vehicleId);

  if (existing) {
    await existing.ref.delete();
  } else {
    const ref = col('favorites').doc();
    await ref.set({
      userId: session.id,
      vehicleId,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  const updated = await col('favorites').where('userId', '==', session.id).get();
  return updated.docs.map((doc) => String(doc.data().vehicleId));
}

export async function resetDemoData(session: SessionPayload): Promise<void> {
  await ensureDbReady();
  const authUser = sessionToAuthUser(session);
  if (!hasPermission(authUser, 'platform:reset')) throw new Error('Forbidden');

  const tables = ['favorites', 'reviews', 'bookings', 'vehicles', 'users', 'vendors', 'appAssets'];
  for (const table of tables) {
    const snap = await col(table).get();
    if (snap.empty) continue;
    const batch = getAdminFirestore().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  await seedAllDemoData();
}

export async function seedAllDemoData(): Promise<void> {
  await ensureDbReady();

  if (await isEmpty('vendors')) {
    for (const vendor of SEED_VENDORS) {
      const { id, ...rest } = vendor;
      await seedDocument('vendors', id, { ...rest, ...ts() });
    }
  }

  if (await isEmpty('users')) {
    for (const user of SEED_USERS) {
      const { id, password, ...rest } = user;
      await seedDocument('users', id, {
        ...rest,
        email: rest.email.toLowerCase(),
        passwordHash: hashPassword(password),
        ...ts(),
      });
    }
  }

  if (await isEmpty('vehicles')) {
    for (const vehicle of SEED_VEHICLES) {
      const { id, ...rest } = vehicle;
      await seedDocument('vehicles', id, { ...rest, ...ts() });
    }
  }

  if (await isEmpty('bookings')) {
    const bookings = getSeedBookings();
    for (const booking of bookings) {
      const { id, ...rest } = booking;
      await seedDocument('bookings', id, { ...rest, ...ts() });
    }
    await syncVehicleStatusesFromBookings(getSeedBookings());
  }

  if (await isEmpty('reviews')) {
    for (const review of SEED_REVIEWS) {
      const { id, ...rest } = review;
      await seedDocument('reviews', id, { ...rest, ...ts() });
    }
  }

  if (await isEmpty('favorites')) {
    for (const fav of SEED_FAVORITES) {
      const { id, userId, vehicleId } = fav;
      await seedDocument('favorites', id, {
        userId,
        vehicleId,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }

  if (await isEmpty('appAssets')) {
    for (const asset of getSeedAppAssets()) {
      const { id, ...rest } = asset;
      await seedDocument('appAssets', id, { ...rest, ...ts() });
    }
  }
}

async function isEmpty(table: string): Promise<boolean> {
  const snap = await col(table).limit(1).get();
  return snap.empty;
}

export async function syncAppAssetsFromModule(): Promise<void> {
  await ensureDbReady();
  for (const asset of getSeedAppAssets()) {
    const { id, ...rest } = asset;
    await seedDocument('appAssets', id, { ...rest, ...tsUpdate() });
  }
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  vendorId?: string;
  vendorName?: string;
  status?: string;
  avatar?: string;
}): Promise<PublicUser> {
  await ensureDbReady();
  const ref = col('users').doc();
  const email = input.email.trim().toLowerCase();
  const payload = {
    name: input.name.trim(),
    email,
    role: input.role,
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    status: input.status ?? 'active',
    avatar:
      input.avatar ??
      input.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    passwordHash: hashPassword(input.password),
    ...ts(),
  };
  await ref.set(payload);
  const user: UserRecord = {
    id: ref.id,
    name: payload.name,
    email: payload.email,
    role: payload.role as UserRecord['role'],
    vendorId: payload.vendorId,
    vendorName: payload.vendorName,
    avatar: payload.avatar,
    status: payload.status as UserRecord['status'],
    passwordHash: payload.passwordHash,
    createdAt: '',
    updatedAt: '',
  };
  return toPublicUser(user);
}

export async function resolveSessionUser(record: UserRecord): Promise<SessionPayload> {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
    vendorId: record.vendorId,
    vendorName: record.vendorName,
    avatar: record.avatar,
    exp: 0,
  };
}

export async function getUserForSession(id: string): Promise<PublicUser | null> {
  const record = await getUserRecordById(id);
  if (!record) return null;
  return toPublicUser(record);
}
