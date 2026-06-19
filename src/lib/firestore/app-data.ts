/** Firestore read helpers for DriveXPro. */

import type { Firestore } from 'firebase-admin/firestore';
import type { SessionPayload } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import { toIsoString, toPublicUser } from '@/lib/firestore/helpers';
import type {
  AppAssetRecord,
  AssetsBundle,
  BookingRecord,
  FavoriteRecord,
  PlatformSnapshot,
  PublicUser,
  ReviewRecord,
  UserRecord,
  VehicleRecord,
  VendorRecord,
} from '@/lib/types/records';
import type { Booking, Review, Vehicle } from '@/data/platform-types';
import {
  FIREBASE_FAVICON,
  FIREBASE_LOGIN_HERO,
  FIREBASE_MARKETING_HERO,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_VEHICLE_IMAGES,
} from '@/data/firebase-assets';

function db(): Firestore {
  return getAdminFirestore();
}

function col(table: string) {
  return appCollection(db(), table);
}

function mapVehicle(id: string, data: Record<string, unknown>): Vehicle {
  return {
    id,
    name: String(data.name ?? ''),
    category: data.category as Vehicle['category'],
    price: Number(data.price ?? 0),
    image: String(data.image ?? ''),
    location: String(data.location ?? ''),
    rating: Number(data.rating ?? 0),
    transmission: data.transmission as Vehicle['transmission'],
    fuel: data.fuel as Vehicle['fuel'],
    seats: Number(data.seats ?? 0),
    vendorId: String(data.vendorId ?? ''),
    vendorName: String(data.vendorName ?? ''),
    status: data.status as Vehicle['status'],
  };
}

function mapBooking(id: string, data: Record<string, unknown>): Booking {
  return {
    id,
    vehicleId: String(data.vehicleId ?? ''),
    vehicleName: String(data.vehicleName ?? ''),
    vehicleImage: String(data.vehicleImage ?? ''),
    customerId: String(data.customerId ?? ''),
    customerName: String(data.customerName ?? ''),
    vendorId: String(data.vendorId ?? ''),
    startDate: String(data.startDate ?? ''),
    endDate: String(data.endDate ?? ''),
    totalAmount: Number(data.totalAmount ?? 0),
    status: data.status as Booking['status'],
    createdAt: String(data.createdAt ?? toIsoString(data.createdAt)),
  };
}

function mapReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    vehicleId: String(data.vehicleId ?? ''),
    vehicleName: String(data.vehicleName ?? ''),
    customerId: String(data.customerId ?? ''),
    customerName: String(data.customerName ?? ''),
    rating: Number(data.rating ?? 0),
    comment: String(data.comment ?? ''),
    date: String(data.date ?? ''),
  };
}

function mapUser(id: string, data: Record<string, unknown>): UserRecord {
  return {
    id,
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    role: data.role as UserRecord['role'],
    vendorId: data.vendorId ? String(data.vendorId) : undefined,
    vendorName: data.vendorName ? String(data.vendorName) : undefined,
    avatar: data.avatar ? String(data.avatar) : undefined,
    status: (data.status as UserRecord['status']) ?? 'active',
    passwordHash: String(data.passwordHash ?? ''),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapVendor(id: string, data: Record<string, unknown>): VendorRecord {
  return {
    id,
    name: String(data.name ?? ''),
    location: data.location ? String(data.location) : undefined,
    status: String(data.status ?? 'active'),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapAsset(id: string, data: Record<string, unknown>): AppAssetRecord {
  return {
    id,
    url: String(data.url ?? ''),
    path: String(data.path ?? ''),
    contentType: String(data.contentType ?? ''),
    kind: data.kind as AppAssetRecord['kind'],
    vehicleId: data.vehicleId ? String(data.vehicleId) : undefined,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function isCollectionEmpty(tableKey: string): Promise<boolean> {
  const snap = await col(tableKey).limit(1).get();
  return snap.empty;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<PublicUser[]> {
  const snap = await col('users').get();
  return snap.docs
    .map((doc) => toPublicUser(mapUser(doc.id, doc.data() as Record<string, unknown>)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getUser(id: string): Promise<PublicUser | null> {
  const doc = await col('users').doc(id).get();
  if (!doc.exists) return null;
  return toPublicUser(mapUser(doc.id, doc.data() as Record<string, unknown>));
}

export async function getUserRecordByEmail(email: string): Promise<UserRecord | null> {
  const snap = await col('users')
    .where('email', '==', email.trim().toLowerCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return mapUser(doc.id, doc.data() as Record<string, unknown>);
}

export async function getUserRecordById(id: string): Promise<UserRecord | null> {
  const doc = await col('users').doc(id).get();
  if (!doc.exists) return null;
  return mapUser(doc.id, doc.data() as Record<string, unknown>);
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export async function listVendors(): Promise<VendorRecord[]> {
  const snap = await col('vendors').get();
  return snap.docs
    .map((doc) => mapVendor(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVendor(id: string): Promise<VendorRecord | null> {
  const doc = await col('vendors').doc(id).get();
  if (!doc.exists) return null;
  return mapVendor(doc.id, doc.data() as Record<string, unknown>);
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export async function listVehicles(): Promise<Vehicle[]> {
  const snap = await col('vehicles').get();
  return snap.docs
    .map((doc) => mapVehicle(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const doc = await col('vehicles').doc(id).get();
  if (!doc.exists) return null;
  return mapVehicle(doc.id, doc.data() as Record<string, unknown>);
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function listAllBookings(): Promise<Booking[]> {
  const snap = await col('bookings').get();
  return snap.docs
    .map((doc) => mapBooking(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listBookingsForSession(session: SessionPayload | null): Promise<Booking[]> {
  if (!session) return [];
  const all = await listAllBookings();
  if (session.role === 'admin') return all;
  if (session.role === 'vendor' && session.vendorId) {
    return all.filter((b) => b.vendorId === session.vendorId);
  }
  if (session.role === 'customer') {
    return all.filter((b) => b.customerId === session.id);
  }
  return all;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const doc = await col('bookings').doc(id).get();
  if (!doc.exists) return null;
  return mapBooking(doc.id, doc.data() as Record<string, unknown>);
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function listReviews(vehicleId?: string): Promise<Review[]> {
  const snap = await col('reviews').get();
  let reviews = snap.docs.map((doc) => mapReview(doc.id, doc.data() as Record<string, unknown>));
  if (vehicleId) reviews = reviews.filter((r) => r.vehicleId === vehicleId);
  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function listFavoriteRecords(userId?: string): Promise<FavoriteRecord[]> {
  const snap = await col('favorites').get();
  let records = snap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      userId: String(data.userId ?? ''),
      vehicleId: String(data.vehicleId ?? ''),
      createdAt: toIsoString(data.createdAt),
    };
  });
  if (userId) records = records.filter((r) => r.userId === userId);
  return records;
}

export async function listFavoriteVehicleIds(userId: string): Promise<string[]> {
  const records = await listFavoriteRecords(userId);
  return records.map((r) => r.vehicleId);
}

// ─── App assets ──────────────────────────────────────────────────────────────

export async function listAppAssets(): Promise<AppAssetRecord[]> {
  const snap = await col('appAssets').get();
  return snap.docs.map((doc) => mapAsset(doc.id, doc.data() as Record<string, unknown>));
}

export async function getAppAsset(id: string): Promise<AppAssetRecord | null> {
  const doc = await col('appAssets').doc(id).get();
  if (!doc.exists) return null;
  return mapAsset(doc.id, doc.data() as Record<string, unknown>);
}

function fallbackAssetsBundle(): AssetsBundle {
  return {
    bucket: FIREBASE_STORAGE_BUCKET,
    vehicles: { ...FIREBASE_VEHICLE_IMAGES },
    marketingHero: FIREBASE_MARKETING_HERO,
    loginHero: FIREBASE_LOGIN_HERO,
    favicon: FIREBASE_FAVICON,
  };
}

export async function getAssetsBundle(): Promise<AssetsBundle> {
  const assets = await listAppAssets();
  if (!assets.length) return fallbackAssetsBundle();

  const vehicles: Record<string, string> = { ...FIREBASE_VEHICLE_IMAGES };
  let marketingHero = FIREBASE_MARKETING_HERO;
  let loginHero = FIREBASE_LOGIN_HERO;
  let favicon = FIREBASE_FAVICON;

  for (const asset of assets) {
    if (asset.kind === 'vehicle' && asset.vehicleId) vehicles[asset.vehicleId] = asset.url;
    if (asset.kind === 'marketingHero') marketingHero = asset.url;
    if (asset.kind === 'loginHero') loginHero = asset.url;
    if (asset.kind === 'favicon') favicon = asset.url;
  }

  return {
    bucket: FIREBASE_STORAGE_BUCKET,
    vehicles,
    marketingHero,
    loginHero,
    favicon,
  };
}

export async function getVehicleImagesMap(): Promise<Record<string, string>> {
  const bundle = await getAssetsBundle();
  return bundle.vehicles;
}

// ─── Platform snapshot ───────────────────────────────────────────────────────

export async function getPlatformSnapshot(session: SessionPayload | null): Promise<PlatformSnapshot> {
  const [vehicles, bookings, reviews, favoriteVehicleIds] = await Promise.all([
    listVehicles(),
    listBookingsForSession(session),
    listReviews(),
    session?.role === 'customer' ? listFavoriteVehicleIds(session.id) : Promise.resolve([]),
  ]);

  return { vehicles, bookings, reviews, favoriteVehicleIds };
}

export type { VehicleRecord, BookingRecord, ReviewRecord };
