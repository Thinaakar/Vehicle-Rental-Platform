import {
  BarChart3,
  Calendar,
  Car,
  DollarSign,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { SidebarGroup } from '@/components/shell/AppSidebar';

export const ADMIN_NAV: SidebarGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, hint: 'Live fleet intelligence' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'fleet', label: 'Fleet Management', icon: Car, hint: 'Inventory & availability' },
      { id: 'rentals', label: 'Rental Pipeline', icon: Calendar, hint: 'Bookings & returns' },
      { id: 'reviews', label: 'Customer Reviews', icon: Star, hint: 'Quality insights' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    items: [
      { id: 'users', label: 'Users & Partners', icon: Users, hint: 'Customers & vendors' },
      { id: 'finance', label: 'Finance Desk', icon: DollarSign, hint: 'Payments & invoices' },
      { id: 'reports', label: 'Analytics', icon: TrendingUp, hint: 'Performance reports' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    defaultOpen: false,
    items: [{ id: 'settings', label: 'Platform Settings', icon: Settings, hint: 'Policies & controls' }],
  },
];

export const VENDOR_NAV: SidebarGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'Vendor Dashboard', icon: BarChart3, hint: 'Performance snapshot' }],
  },
  {
    id: 'fleet',
    label: 'Fleet',
    items: [
      { id: 'fleet', label: 'My Vehicles', icon: Car, hint: 'Fleet inventory' },
      { id: 'calendar', label: 'Availability', icon: Calendar, hint: 'Scheduling view' },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    items: [
      { id: 'bookings', label: 'Booking Queue', icon: MessageSquare, hint: 'Incoming reservations' },
      { id: 'earnings', label: 'Earnings', icon: Wallet, hint: 'Revenue insights' },
      { id: 'reviews', label: 'Reviews', icon: Star, hint: 'Customer feedback' },
    ],
  },
];

export const CUSTOMER_NAV: SidebarGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, hint: 'Rental overview' }],
  },
  {
    id: 'rentals',
    label: 'Rentals',
    items: [
      { id: 'active-rentals', label: 'Active Rentals', icon: Car, hint: 'Currently on road' },
      { id: 'bookings', label: 'My Bookings', icon: Calendar, hint: 'Upcoming & history' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'payments', label: 'Payments', icon: DollarSign, hint: 'Billing history' },
      { id: 'saved', label: 'Saved Vehicles', icon: Heart, hint: 'Wishlist fleet' },
      { id: 'reviews', label: 'My Reviews', icon: Star, hint: 'Your feedback' },
      { id: 'profile', label: 'Profile', icon: User, hint: 'Personal details' },
    ],
  },
];

export const ADMIN_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Admin Command Center', subtitle: 'Monitor fleet health, revenue, and rental operations.' },
  fleet: { title: 'Fleet Management', subtitle: 'Manage vehicle inventory, categories, and maintenance.' },
  rentals: { title: 'Rental Pipeline', subtitle: 'Track new requests, active rentals, and returns.' },
  users: { title: 'Users & Partners', subtitle: 'Oversee customers, vendors, and account activity.' },
  finance: { title: 'Finance Desk', subtitle: 'Review payments, refunds, and invoices.' },
  reviews: { title: 'Customer Reviews', subtitle: 'Analyze satisfaction across the platform.' },
  reports: { title: 'Analytics & Reports', subtitle: 'Business intelligence and operational trends.' },
  settings: { title: 'Platform Settings', subtitle: 'Configure policies, notifications, and controls.' },
};

export const VENDOR_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Vendor Dashboard', subtitle: 'Your fleet performance at a glance.' },
  fleet: { title: 'My Fleet', subtitle: 'Manage listed vehicles and availability.' },
  bookings: { title: 'Booking Queue', subtitle: 'Approve and manage customer reservations.' },
  calendar: { title: 'Availability Calendar', subtitle: 'Plan fleet utilization over time.' },
  earnings: { title: 'Earnings Overview', subtitle: 'Track revenue and payout performance.' },
  reviews: { title: 'Vehicle Reviews', subtitle: 'See what renters say about your fleet.' },
};

export const CUSTOMER_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Customer Dashboard', subtitle: 'Your premium rental experience hub.' },
  'active-rentals': { title: 'Active Rentals', subtitle: 'Vehicles currently assigned to you.' },
  bookings: { title: 'My Bookings', subtitle: 'Upcoming trips and rental history.' },
  payments: { title: 'Payment History', subtitle: 'Invoices, receipts, and transactions.' },
  saved: { title: 'Saved Vehicles', subtitle: 'Your favorite cars and exotics.' },
  reviews: { title: 'My Reviews', subtitle: 'Ratings you have shared with the community.' },
  profile: { title: 'Profile Settings', subtitle: 'Manage your account and preferences.' },
};
