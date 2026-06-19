'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Booking, Vehicle } from '@/data/platform-types';
import {
  canAddVehicle,
  canCreateBooking,
  canDeleteVehicle,
  canManageBookingStatus,
  canSubmitReview,
  canUpdateVehicleStatus,
  hasPermission,
  isCustomerBooking,
  isVendorBooking,
  isVendorVehicle,
  ROLE_LABELS,
  ROLE_PORTALS,
  type Permission,
} from '@/data/roles-permissions';

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      roleLabel: user ? ROLE_LABELS[user.role] : null,
      portalLabel: user ? ROLE_PORTALS[user.role] : null,
      can: (permission: Permission) => hasPermission(user, permission),
      canManageBooking: (booking: Booking, nextStatus?: Booking['status']) =>
        canManageBookingStatus(user, booking, nextStatus),
      canDeleteVehicle: (vehicle: Vehicle) => canDeleteVehicle(user, vehicle),
      canUpdateVehicleStatus: (vehicle: Vehicle) => canUpdateVehicleStatus(user, vehicle),
      canAddVehicle: () => canAddVehicle(user),
      canCreateBooking: () => canCreateBooking(user),
      canSubmitReview: (booking?: Booking) => canSubmitReview(user, booking),
      isVendorBooking: (booking: Booking) => (user ? isVendorBooking(user, booking) : false),
      isCustomerBooking: (booking: Booking) => (user ? isCustomerBooking(user, booking) : false),
      isVendorVehicle: (vehicle: Vehicle) => (user ? isVendorVehicle(user, vehicle) : false),
      isAdmin: user?.role === 'admin',
      isVendor: user?.role === 'vendor',
      isCustomer: user?.role === 'customer',
    }),
    [user],
  );
}
