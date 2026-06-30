/** Static demo data when Firestore is unavailable (local dev / deploy without Firebase env). */

import type { SessionPayload } from '@/lib/auth/session';
import {
  getSeedAppAssets,
  getSeedBookings,
  SEED_FAVORITES,
  SEED_REVIEWS,
  SEED_USERS,
  SEED_VEHICLES,
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
import type { PortalNavConfig, PortalRole } from '@/data/portal-nav-permissions';
import { getDefaultPortalNavConfig } from '@/data/portal-nav-permissions';
import { mergePortalNavConfig } from '@/lib/portal-nav';
import type { PlatformRoleDefinition } from '@/data/platform-roles';
import { getSystemPlatformRoles, slugifyRoleName } from '@/data/platform-roles';
import {
  getDefaultMasterData,
  getDefaultMasterVendors,
  mergeMasterData,
  type MasterDataBundle,
} from '@/data/master-data';
import type { Permission } from '@/data/roles-permissions';
import type { AuthRole } from '@/context/AuthContext';
import type { VendorRecord } from '@/lib/types/records';
import { hashPassword } from '@/lib/auth/password';

let demoPortalNavConfig: PortalNavConfig = getDefaultPortalNavConfig();
let demoMasterData: MasterDataBundle = getDefaultMasterData();
let demoVendors: VendorRecord[] = getDefaultMasterVendors();
let extraDemoUsers: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: AuthRole;
  avatar?: string;
  vendorId?: string;
  vendorName?: string;
  status: 'active' | 'inactive';
}> = [];
let extraCustomRoles: PlatformRoleDefinition[] = [];

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
  const base = [
    {
      id: 'user-admin',
      name: 'System Administrator',
      email: 'admin@vehiclerental.com',
      role: 'admin' as const,
      avatar: 'SA',
      status: 'active' as const,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'user-vendor',
      name: 'Premium Fleet Vendor',
      email: 'vendor@vehiclerental.com',
      role: 'vendor' as const,
      avatar: 'PV',
      vendorId: 'vendor-1',
      vendorName: 'Apex Exotic Rentals',
      status: 'active' as const,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'user-customer',
      name: 'John Customer',
      email: 'customer@vehiclerental.com',
      role: 'customer' as const,
      avatar: 'JC',
      status: 'active' as const,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const extra = extraDemoUsers.map(({ password: _password, ...user }) => ({
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return [...base, ...extra];
}

export function getDemoUserAccountsForAuth() {
  return [
    ...SEED_USERS.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      avatar: user.avatar,
      vendorId: user.vendorId,
      vendorName: user.vendorName,
      status: 'active' as const,
    })),
    ...extraDemoUsers,
  ];
}

export function addDemoUser(input: {
  name: string;
  email: string;
  password: string;
  role: AuthRole;
  vendorId?: string;
  vendorName?: string;
}): PublicUser {
  const email = input.email.trim().toLowerCase();
  const exists = getDemoUserAccountsForAuth().some((user) => user.email.toLowerCase() === email);
  if (exists) throw new Error('A user with this email already exists');

  const user = {
    id: `user-${Date.now()}`,
    name: input.name.trim(),
    email,
    password: input.password,
    role: input.role,
    avatar: input.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    status: 'active' as const,
  };

  extraDemoUsers.push(user);
  const { password: _password, ...publicUser } = user;
  void _password;
  return {
    ...publicUser,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getDemoVendors() {
  return demoVendors.map((vendor) => ({ ...vendor }));
}

export function addDemoVendor(input: { name: string; location?: string }): VendorRecord {
  const vendor: VendorRecord = {
    id: `vendor-${Date.now()}`,
    name: input.name.trim(),
    location: input.location?.trim(),
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoVendors = [...demoVendors, vendor];
  return vendor;
}

export function getDemoMasterData(): MasterDataBundle {
  return {
    locations: [...demoMasterData.locations],
    categories: [...demoMasterData.categories],
  };
}

export function addDemoMasterDataItem(type: 'locations' | 'categories', value: string): MasterDataBundle {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Value is required');
  const list = demoMasterData[type];
  if (list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('This entry already exists');
  }
  demoMasterData = {
    ...demoMasterData,
    [type]: [...list, trimmed],
  };
  return getDemoMasterData();
}

export function removeDemoMasterDataItem(type: 'locations' | 'categories', value: string): MasterDataBundle {
  demoMasterData = {
    ...demoMasterData,
    [type]: demoMasterData[type].filter((item) => item !== value),
  };
  return getDemoMasterData();
}

export function updateDemoMasterData(partial: Partial<MasterDataBundle>): MasterDataBundle {
  demoMasterData = mergeMasterData({ ...demoMasterData, ...partial });
  return getDemoMasterData();
}

export function getDemoPlatformRoles(): PlatformRoleDefinition[] {
  return [...getSystemPlatformRoles(), ...extraCustomRoles];
}

export function addDemoPlatformRole(input: {
  label: string;
  description?: string;
  portal: AuthRole;
  permissions: Permission[];
}): PlatformRoleDefinition {
  const label = input.label.trim();
  const name = slugifyRoleName(label);
  if (!name) throw new Error('Role name is invalid');
  if (getDemoPlatformRoles().some((role) => role.name === name)) {
    throw new Error('A role with this name already exists');
  }

  const role: PlatformRoleDefinition = {
    id: `custom-${name}`,
    name,
    label,
    description: input.description?.trim() || 'Custom role',
    portal: input.portal,
    permissions: input.permissions.length ? input.permissions : ['booking:view_own'],
    isSystem: false,
    status: 'active',
  };

  extraCustomRoles = [...extraCustomRoles, role];
  return role;
}

export function deleteDemoPlatformRole(id: string): void {
  if (!id.startsWith('custom-')) throw new Error('System roles cannot be deleted');
  extraCustomRoles = extraCustomRoles.filter((role) => role.id !== id);
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

export function getDemoPortalNavConfig(): PortalNavConfig {
  return {
    vendor: [...demoPortalNavConfig.vendor],
    customer: [...demoPortalNavConfig.customer],
  };
}

export function updateDemoPortalNavConfig(role: PortalRole, permissions: string[]): PortalNavConfig {
  demoPortalNavConfig = mergePortalNavConfig(
    { [role]: permissions },
    demoPortalNavConfig,
  );
  return getDemoPortalNavConfig();
}

export function resetDemoPortalNavConfig(): PortalNavConfig {
  demoPortalNavConfig = getDefaultPortalNavConfig();
  return getDemoPortalNavConfig();
}
