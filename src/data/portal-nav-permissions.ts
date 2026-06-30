/** Sidebar nav permissions for vendor & customer portals (admin-configurable). */

export type PortalRole = 'vendor' | 'customer';

export type NavPermissionMeta = {
  permission: string;
  tabId: string;
  label: string;
  group: string;
};

export const VENDOR_NAV_PERMISSIONS: NavPermissionMeta[] = [
  { permission: 'nav:vendor.dashboard', tabId: 'dashboard', label: 'Vendor Dashboard', group: 'Overview' },
  { permission: 'nav:vendor.fleet', tabId: 'fleet', label: 'My Vehicles', group: 'Fleet' },
  { permission: 'nav:vendor.calendar', tabId: 'calendar', label: 'Availability', group: 'Fleet' },
  { permission: 'nav:vendor.bookings', tabId: 'bookings', label: 'Booking Queue', group: 'Commerce' },
  { permission: 'nav:vendor.earnings', tabId: 'earnings', label: 'Earnings', group: 'Commerce' },
  { permission: 'nav:vendor.reviews', tabId: 'reviews', label: 'Reviews', group: 'Commerce' },
];

export const CUSTOMER_NAV_PERMISSIONS: NavPermissionMeta[] = [
  { permission: 'nav:customer.dashboard', tabId: 'dashboard', label: 'My Dashboard', group: 'Overview' },
  { permission: 'nav:customer.active-rentals', tabId: 'active-rentals', label: 'Active Rentals', group: 'Rentals' },
  { permission: 'nav:customer.bookings', tabId: 'bookings', label: 'My Bookings', group: 'Rentals' },
  { permission: 'nav:customer.payments', tabId: 'payments', label: 'Payments', group: 'Account' },
  { permission: 'nav:customer.saved', tabId: 'saved', label: 'Saved Vehicles', group: 'Account' },
  { permission: 'nav:customer.reviews', tabId: 'reviews', label: 'My Reviews', group: 'Account' },
  { permission: 'nav:customer.profile', tabId: 'profile', label: 'Profile', group: 'Account' },
];

export type PortalNavConfig = Record<PortalRole, string[]>;

export function getDefaultPortalNavConfig(): PortalNavConfig {
  return {
    vendor: VENDOR_NAV_PERMISSIONS.map((item) => item.permission),
    customer: CUSTOMER_NAV_PERMISSIONS.map((item) => item.permission),
  };
}

export const PORTAL_NAV_STORAGE_KEY = 'vr_portal_nav_config';
