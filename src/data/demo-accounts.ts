import type { AuthRole } from '@/context/AuthContext';

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@vehiclerental.com',
    password: 'Admin@123',
    label: 'Demo Admin',
    role: 'admin' as AuthRole,
    portal: 'Admin Command Center',
    permissions: ['Full platform access', 'All fleets & bookings', 'Users, finance, reports', 'Reset demo data'],
  },
  vendor: {
    email: 'vendor@vehiclerental.com',
    password: 'Vendor@123',
    label: 'Demo Vendor',
    role: 'vendor' as AuthRole,
    portal: 'Apex Exotic Rentals',
    permissions: ['Own fleet only', 'Approve & dispatch own bookings', 'Earnings & reviews for own vehicles'],
  },
  customer: {
    email: 'customer@vehiclerental.com',
    password: 'Customer@123',
    label: 'Demo Customer',
    role: 'customer' as AuthRole,
    portal: 'Customer Dashboard',
    permissions: ['Book vehicles', 'View own rentals', 'Saved vehicles & reviews'],
  },
} as const;

export function getDemoRoleForEmail(email: string): keyof typeof DEMO_CREDENTIALS | null {
  const normalized = email.trim().toLowerCase();
  for (const key of Object.keys(DEMO_CREDENTIALS) as Array<keyof typeof DEMO_CREDENTIALS>) {
    if (DEMO_CREDENTIALS[key].email.toLowerCase() === normalized) return key;
  }
  return null;
}
