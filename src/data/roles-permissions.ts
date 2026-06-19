import type { AuthRole, AuthUser } from '@/context/AuthContext';
import type { Booking, Vehicle } from '@/data/platform-types';

export type Permission =
  | 'platform:reset'
  | 'platform:settings'
  | 'fleet:view_all'
  | 'fleet:manage_all'
  | 'fleet:view_own'
  | 'fleet:manage_own'
  | 'booking:view_all'
  | 'booking:manage_all'
  | 'booking:view_vendor'
  | 'booking:manage_vendor'
  | 'booking:view_own'
  | 'booking:create'
  | 'booking:review'
  | 'users:view_all'
  | 'finance:view'
  | 'reports:view'
  | 'favorites:manage';

export const ROLE_PERMISSIONS: Record<AuthRole, Permission[]> = {
  admin: [
    'platform:reset',
    'platform:settings',
    'fleet:view_all',
    'fleet:manage_all',
    'booking:view_all',
    'booking:manage_all',
    'users:view_all',
    'finance:view',
    'reports:view',
  ],
  vendor: [
    'fleet:view_own',
    'fleet:manage_own',
    'booking:view_vendor',
    'booking:manage_vendor',
  ],
  customer: [
    'booking:view_own',
    'booking:create',
    'booking:review',
    'favorites:manage',
  ],
};

export const ROLE_LABELS: Record<AuthRole, string> = {
  admin: 'Administrator',
  vendor: 'Fleet Vendor',
  customer: 'Customer',
};

export const ROLE_PORTALS: Record<AuthRole, string> = {
  admin: 'Admin Portal',
  vendor: 'Vendor Portal',
  customer: 'Customer Portal',
};

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function canAccessDashboard(role: AuthRole, screen: 'marketing' | 'login' | 'booking' | 'dashboard'): boolean {
  if (screen === 'marketing' || screen === 'login' || screen === 'booking') return true;
  return role === 'admin' || role === 'vendor' || role === 'customer';
}

export function isVendorBooking(user: AuthUser, booking: Booking): boolean {
  return user.role === 'vendor' && !!user.vendorId && booking.vendorId === user.vendorId;
}

export function isCustomerBooking(user: AuthUser, booking: Booking): boolean {
  return user.role === 'customer' && booking.customerId === user.id;
}

export function isVendorVehicle(user: AuthUser, vehicle: Vehicle): boolean {
  return user.role === 'vendor' && !!user.vendorId && vehicle.vendorId === user.vendorId;
}

export function canManageBookingStatus(
  user: AuthUser | null,
  booking: Booking,
  nextStatus?: Booking['status'],
): boolean {
  if (!user) return false;

  if (user.role === 'admin') return true;

  if (user.role === 'vendor') {
    if (!isVendorBooking(user, booking)) return false;
    if (!nextStatus) return true;
    const allowed: Record<Booking['status'], Booking['status'][]> = {
      Pending: ['Approved', 'Cancelled'],
      Approved: ['Active', 'Cancelled'],
      Active: ['Completed'],
      Completed: [],
      Cancelled: [],
    };
    return allowed[booking.status]?.includes(nextStatus) ?? false;
  }

  return false;
}

export function canDeleteVehicle(user: AuthUser | null, vehicle: Vehicle): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'vendor') return isVendorVehicle(user, vehicle);
  return false;
}

export function canUpdateVehicleStatus(user: AuthUser | null, vehicle: Vehicle): boolean {
  return canDeleteVehicle(user, vehicle);
}

export function canAddVehicle(user: AuthUser | null): boolean {
  return user?.role === 'vendor' || user?.role === 'admin';
}

export function canCreateBooking(user: AuthUser | null): boolean {
  return !user || user.role === 'customer';
}

export function canSubmitReview(user: AuthUser | null, booking?: Booking): boolean {
  if (!user || user.role !== 'customer') return false;
  if (!booking) return true;
  return booking.customerId === user.id && booking.status === 'Completed';
}
