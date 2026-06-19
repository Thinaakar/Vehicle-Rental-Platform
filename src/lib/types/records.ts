import type { AuthRole } from '@/context/AuthContext';
import type { Booking, Review, Vehicle } from '@/data/platform-types';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  vendorId?: string;
  vendorName?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export interface VendorRecord {
  id: string;
  name: string;
  location?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteRecord {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: string;
}

export interface AppAssetRecord {
  id: string;
  url: string;
  path: string;
  contentType: string;
  kind: 'vehicle' | 'marketingHero' | 'loginHero' | 'favicon';
  vehicleId?: string;
  createdAt: string;
  updatedAt: string;
}

export type VehicleRecord = Vehicle & { createdAt: string; updatedAt: string };
export type BookingRecord = Booking & { updatedAt: string };
export type ReviewRecord = Review & { createdAt: string; updatedAt: string };

export interface PlatformSnapshot {
  vehicles: Vehicle[];
  bookings: Booking[];
  reviews: Review[];
  favoriteVehicleIds: string[];
}

export interface AssetsBundle {
  bucket: string;
  vehicles: Record<string, string>;
  marketingHero: string;
  loginHero: string;
  favicon: string;
}
