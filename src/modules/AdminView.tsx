'use client';

import React, { useMemo, useState } from 'react';
import { usePlatform, Booking, Vehicle } from '@/context/PlatformContext';
import SafeImage from '@/components/SafeImage';
import DashboardLayout from '@/components/shell/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_NAV, ADMIN_TITLES } from '@/data/dashboard-nav';
import { cn } from '@/lib/utils';
import RoleGuard from '@/components/auth/RoleGuard';
import { BookingPipelineActions, BookingStatusBadge } from '@/components/booking/BookingPipelineActions';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  BarChart3, Car, Calendar, Users, DollarSign, Bell, Settings, 
  Star, Sliders, TrendingUp, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function AdminView() {
  const { vehicles, bookings, reviews, updateBookingStatus, updateVehicleStatus, deleteVehicle, openMarketing, resetData } = usePlatform();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fleet' | 'rentals' | 'users' | 'finance' | 'reviews' | 'reports' | 'settings'>('dashboard');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [fleetView, setFleetView] = useState<'all' | 'categories' | 'availability' | 'maintenance'>('all');
  const [userView, setUserView] = useState<'customers' | 'vendors'>('customers');
  const [financeView, setFinanceView] = useState<'payments' | 'refunds' | 'invoices'>('payments');
  const [revenuePeriod, setRevenuePeriod] = useState<'6m' | 'ytd' | '12m'>('6m');

  // KPI Calculations
  const totalVehicles = vehicles.length;
  const activeRentals = bookings.filter((b) => b.status === 'Active').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
  
  // Total Revenue calculation
  const totalRevenue = bookings
    .filter((b) => b.status === 'Completed' || b.status === 'Active' || b.status === 'Approved')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const monthlyRevenue = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, idx) => {
      const monthRevenue = bookings
        .filter(
          (booking) =>
            ['Completed', 'Active', 'Approved'].includes(booking.status) &&
            new Date(booking.startDate).getMonth() === idx,
        )
        .reduce((sum, booking) => sum + booking.totalAmount, 0);
      return { month, value: monthRevenue };
    });
  }, [bookings]);

  const bookingStatusBreakdown = useMemo(() => {
    const total = Math.max(1, bookings.length);
    const statuses = ['Pending', 'Approved', 'Active', 'Completed', 'Cancelled'] as const;
    return statuses.map((status) => {
      const count = bookings.filter((booking) => booking.status === status).length;
      return {
        status,
        count,
        pct: (count / total) * 100,
      };
    });
  }, [bookings]);

  const pipelineStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: bookings.length };
    (['Pending', 'Approved', 'Active', 'Completed', 'Cancelled'] as const).forEach((status) => {
      counts[status] = bookings.filter((booking) => booking.status === status).length;
    });
    return counts;
  }, [bookings]);

  const operationalQueue = useMemo(() => {
    const priority: Record<Booking['status'], number> = {
      Pending: 0,
      Approved: 1,
      Active: 2,
      Completed: 3,
      Cancelled: 4,
    };
    return [...bookings]
      .filter((booking) => ['Pending', 'Approved', 'Active'].includes(booking.status))
      .sort((a, b) => priority[a.status] - priority[b.status] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [bookings]);

  const revenueMomGrowth = useMemo(() => {
    const last = monthlyRevenue[monthlyRevenue.length - 1]?.value ?? 0;
    const prev = monthlyRevenue[monthlyRevenue.length - 2]?.value ?? 0;
    if (prev === 0) return last > 0 ? 100 : 0;
    return ((last - prev) / prev) * 100;
  }, [monthlyRevenue]);

  const maxMonthlyRevenue = useMemo(
    () => Math.max(...monthlyRevenue.map((m) => m.value), 1),
    [monthlyRevenue],
  );

  const STATUS_CHART_COLORS: Record<string, { stroke: string; bg: string; text: string }> = {
    Pending: { stroke: '#FBBF24', bg: 'bg-amber-400', text: 'text-amber-600' },
    Approved: { stroke: '#0EA5E9', bg: 'bg-primary-dark', text: 'text-primary-dark' },
    Active: { stroke: '#38BDF8', bg: 'bg-primary', text: 'text-primary' },
    Completed: { stroke: '#34D399', bg: 'bg-emerald-400', text: 'text-emerald-600' },
    Cancelled: { stroke: '#FB7185', bg: 'bg-rose-400', text: 'text-rose-500' },
  };

  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; rentals: number; spent: number }>();
    bookings.forEach((booking) => {
      const current = map.get(booking.customerId) ?? { id: booking.customerId, name: booking.customerName, rentals: 0, spent: 0 };
      current.rentals += 1;
      current.spent += booking.totalAmount;
      map.set(booking.customerId, current);
    });
    return [...map.values()];
  }, [bookings]);

  const uniqueVendors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; vehicles: number; revenue: number }>();
    vehicles.forEach((vehicle) => {
      const current = map.get(vehicle.vendorId) ?? { id: vehicle.vendorId, name: vehicle.vendorName, vehicles: 0, revenue: 0 };
      current.vehicles += 1;
      map.set(vehicle.vendorId, current);
    });
    bookings.forEach((booking) => {
      const current = map.get(booking.vendorId);
      if (current) current.revenue += booking.totalAmount;
    });
    return [...map.values()];
  }, [vehicles, bookings]);

  // Filtered lists
  const filteredBookings = bookings.filter((b) => 
    selectedStatusFilter === 'All' ? true : b.status === selectedStatusFilter
  );
  const fleetVehicles = vehicles.filter((vehicle) => {
    if (fleetView === 'availability') return vehicle.status === 'Available';
    if (fleetView === 'maintenance') return vehicle.status === 'Maintenance';
    return true;
  });

  const { can } = usePermissions();

  if (!user) return null;

  const page = ADMIN_TITLES[activeTab] ?? ADMIN_TITLES.dashboard;

  return (
    <RoleGuard allow="admin">
    <DashboardLayout
      portalLabel="Admin Portal"
      accentClass="from-primary to-secondary"
      title={page.title}
      subtitle={page.subtitle}
      groups={ADMIN_NAV}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(id as typeof activeTab)}
      user={user}
      onLogout={() => {
        logout();
        openMarketing();
      }}
    >
        {/* ==================== TAB: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8">
            
            {/* KPI Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fleet Size</span>
                  <span className="block text-3xl font-black text-slate-900 mt-1">{totalVehicles}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Rentals</span>
                  <span className="block text-3xl font-black text-slate-900 mt-1">{activeRentals}</span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Gross Income</span>
                  <span className="block text-3xl font-black text-slate-900 mt-1">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Idle Vehicles</span>
                  <span className="block text-3xl font-black text-slate-900 mt-1">{availableVehicles}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Premium Analytics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-secondary to-primary/40" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative p-7">
                  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Performance</p>
                      <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Monthly Revenue</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">Gross booking value across the fleet</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={revenuePeriod}
                        onChange={(e) => setRevenuePeriod(e.target.value as typeof revenuePeriod)}
                        className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="6m">Last 6 months</option>
                        <option value="ytd">Year to date</option>
                        <option value="12m">Last 12 months</option>
                      </select>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold',
                          revenueMomGrowth >= 0
                            ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200/80 bg-rose-50 text-rose-600',
                        )}
                      >
                        <TrendingUp className={cn('h-3 w-3', revenueMomGrowth < 0 && 'rotate-180')} />
                        {revenueMomGrowth >= 0 ? '+' : ''}
                        {revenueMomGrowth.toFixed(1)}% MoM
                      </span>
                    </div>
                  </div>

                  <div className="relative h-56 rounded-2xl border border-slate-100/80 bg-slate-50/40 px-2 pb-2 pt-4">
                    <div className="pointer-events-none absolute inset-x-4 top-4 bottom-10 flex flex-col justify-between">
                      {[0, 1, 2, 3].map((line) => (
                        <div key={line} className="border-t border-dashed border-slate-200/80" />
                      ))}
                    </div>

                    <svg viewBox="0 0 440 200" className="relative z-10 h-full w-full" aria-hidden>
                      <defs>
                        <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7DD3FC" />
                          <stop offset="55%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0EA5E9" />
                        </linearGradient>
                        <linearGradient id="adminBarGradMuted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#CBD5E1" />
                          <stop offset="100%" stopColor="#94A3B8" />
                        </linearGradient>
                        <filter id="barGlow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.22" />
                        </filter>
                      </defs>

                      {monthlyRevenue.map((entry, idx) => {
                        const height = entry.value > 0 ? Math.max(18, (entry.value / maxMonthlyRevenue) * 118) : 6;
                        const isPeak = entry.value === maxMonthlyRevenue && entry.value > 0;
                        const x = 28 + idx * 68;
                        return (
                          <g key={entry.month}>
                            <rect
                              x={x}
                              y={152 - height}
                              width="40"
                              height={height}
                              rx="12"
                              fill={entry.value > 0 ? 'url(#adminBarGrad)' : 'url(#adminBarGradMuted)'}
                              opacity={entry.value > 0 ? 1 : 0.45}
                              filter={isPeak ? 'url(#barGlow)' : undefined}
                            />
                            {entry.value > 0 && (
                              <text x={x + 20} y={142 - height} textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
                                ${entry.value >= 1000 ? `${(entry.value / 1000).toFixed(1)}k` : entry.value.toLocaleString()}
                              </text>
                            )}
                            <text x={x + 20} y="176" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="700">
                              {entry.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Period total</p>
                      <p className="text-lg font-black text-slate-900">
                        ${monthlyRevenue.reduce((sum, m) => sum + m.value, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best month</p>
                      <p className="text-sm font-bold text-primary">
                        {monthlyRevenue.reduce((best, m) => (m.value > best.value ? m : best), monthlyRevenue[0]).month}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/70 via-primary to-secondary/70" />
                <div className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />

                <div className="relative p-7">
                  <div className="mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Distribution</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Booking Status Mix</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">Live pipeline across all reservations</p>
                  </div>

                  <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch">
                    <div className="relative mx-auto flex h-52 w-52 shrink-0 items-center justify-center">
                      <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
                        <circle cx="110" cy="110" r="78" fill="none" stroke="#E8EDF3" strokeWidth="20" />
                        {(() => {
                          const activeSegments = bookingStatusBreakdown.filter((segment) => segment.count > 0);
                          const activeTotal = Math.max(1, activeSegments.reduce((sum, segment) => sum + segment.count, 0));
                          const radius = 78;
                          const circumference = 2 * Math.PI * radius;
                          let offset = 0;

                          return activeSegments.map((segment) => {
                            const pct = (segment.count / activeTotal) * 100;
                            const dash = (pct / 100) * circumference;
                            const color = STATUS_CHART_COLORS[segment.status]?.stroke ?? '#94A3B8';
                            const circle = (
                              <circle
                                key={segment.status}
                                cx="110"
                                cy="110"
                                r={radius}
                                fill="none"
                                stroke={color}
                                strokeWidth="20"
                                strokeDasharray={`${dash} ${circumference - dash}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="butt"
                              />
                            );
                            offset += dash;
                            return circle;
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black tracking-tight text-slate-900">{bookings.length}</span>
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total bookings</span>
                      </div>
                    </div>

                    <div className="w-full flex-1 space-y-3">
                      {bookingStatusBreakdown.map((segment) => {
                        const palette = STATUS_CHART_COLORS[segment.status];
                        return (
                          <div
                            key={segment.status}
                            className="rounded-2xl border border-slate-100/90 bg-white/70 px-4 py-3 shadow-sm transition hover:border-slate-200 hover:shadow-md"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className={cn('h-2.5 w-2.5 rounded-full', palette.bg)} />
                                <span className="text-sm font-bold text-slate-800">{segment.status}</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-sm font-black text-slate-900">{segment.count}</span>
                                <span className={cn('text-[10px] font-bold', palette.text)}>{segment.pct.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn('h-full rounded-full transition-all duration-500', palette.bg)}
                                style={{ width: `${segment.pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Queue */}
            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Operational Booking Queue</h3>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {bookings.filter((b) => b.status === 'Pending').length} pending · {bookings.filter((b) => b.status === 'Approved').length} ready to dispatch
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {operationalQueue.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="block font-bold text-slate-900">{booking.customerName}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{booking.customerId}</span>
                        </td>
                        <td className="p-4 flex items-center gap-2">
                          <SafeImage src={booking.vehicleImage} alt={booking.vehicleName} fallbackLabel={booking.vehicleName} className="h-6 w-8 rounded bg-slate-900 object-cover" />
                          <span className="font-bold text-slate-800">{booking.vehicleName}</span>
                        </td>
                        <td className="p-4">
                          <span className="block font-bold text-slate-800">{booking.startDate}</span>
                          <span className="text-[10px] font-semibold text-slate-400">to {booking.endDate}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">${booking.totalAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <BookingStatusBadge status={booking.status} />
                        </td>
                        <td className="p-4 text-right">
                          <BookingPipelineActions booking={booking} onUpdateStatus={updateBookingStatus} compact />
                        </td>
                      </tr>
                    ))}
                    {operationalQueue.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm font-medium text-slate-400">
                          No active pipeline items. All rentals are completed or archived.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: FLEET MANAGEMENT ==================== */}
        {activeTab === 'fleet' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                {fleetView === 'all' ? 'All Fleet Vehicles' : fleetView === 'categories' ? 'Category Breakdown' : fleetView === 'availability' ? 'Available Fleet' : 'Maintenance Fleet'}
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase">{fleetVehicles.length} Vehicles</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Vehicle Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Base Rate</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Maintenance / Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {fleetVehicles.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <SafeImage src={car.image} alt={car.name} fallbackLabel={car.name} className="w-12 h-9 object-cover rounded bg-slate-900" />
                        <div>
                          <span className="block font-bold text-slate-900 text-sm">{car.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{car.transmission} | {car.fuel}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-bold">{car.category}</td>
                      <td className="p-4 font-bold text-slate-900">${car.price}/day</td>
                      <td className="p-4 text-slate-400">{car.location}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          car.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                          car.status === 'Active' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <select 
                            value={car.status}
                            onChange={(e) => updateVehicleStatus(car.id, e.target.value as Vehicle['status'])}
                            className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold uppercase focus:outline-none"
                          >
                            <option value="Available">Available</option>
                            <option value="Active">Active</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                          <button 
                            onClick={() => deleteVehicle(car.id)}
                            className="text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-100 hover:border-transparent rounded-lg p-1.5 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: RENTAL MANAGEMENT ==================== */}
        {activeTab === 'rentals' && (
          <div className="flex flex-col gap-6">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Pending', 'Approved', 'Active', 'Completed', 'Cancelled'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatusFilter(status)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
                    selectedStatusFilter === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {status}
                  <span className="ml-1.5 opacity-70">({pipelineStatusCounts[status] ?? 0})</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Rental Records</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Transaction Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{b.id}</td>
                        <td className="p-4">
                          <span className="block font-bold text-slate-900">{b.customerName}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{b.customerId}</span>
                        </td>
                        <td className="p-4 flex items-center gap-2">
                          <SafeImage src={b.vehicleImage} alt={b.vehicleName} fallbackLabel={b.vehicleName} className="h-6 w-8 rounded bg-slate-900 object-cover" />
                          <span className="font-bold text-slate-800">{b.vehicleName}</span>
                        </td>
                        <td className="p-4 text-slate-700">{b.startDate} to {b.endDate}</td>
                        <td className="p-4 font-bold text-slate-900">${b.totalAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <BookingStatusBadge status={b.status} />
                        </td>
                        <td className="p-4 text-right">
                          <BookingPipelineActions booking={b} onUpdateStatus={updateBookingStatus} />
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-sm font-medium text-slate-400">
                          No rentals match this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: USER MANAGEMENT ==================== */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                {userView === 'customers' ? 'Customer Directory' : 'Vendor Directory'}
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {userView === 'customers' ? uniqueCustomers.length : uniqueVendors.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Activity</th>
                    <th className="p-4">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {userView === 'customers'
                    ? uniqueCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{customer.name}</td>
                          <td className="p-4">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-sky-50 text-sky-700 border border-sky-100">Customer</span>
                          </td>
                          <td className="p-4 text-slate-600">{customer.rentals} rentals</td>
                          <td className="p-4 font-bold text-slate-900">${customer.spent.toLocaleString()}</td>
                        </tr>
                      ))
                    : uniqueVendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{vendor.name}</td>
                          <td className="p-4">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Vendor</span>
                          </td>
                          <td className="p-4 text-slate-600">{vendor.vehicles} vehicles</td>
                          <td className="p-4 font-bold text-slate-900">${vendor.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: FINANCIALS ==================== */}
        {activeTab === 'finance' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Operational Payouts</span>
                <span className="block text-2xl font-black text-slate-900 mt-2">${(totalRevenue * 0.85).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">85% to Host Vendors</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Commission (15%)</span>
                <span className="block text-2xl font-black text-slate-900 mt-2">${(totalRevenue * 0.15).toLocaleString()}</span>
                <span className="text-[10px] text-primary font-bold mt-1 block">SaaS Service Fee</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Escrow deposits</span>
                <span className="block text-2xl font-black text-slate-900 mt-2">${(bookings.filter(b => b.status === 'Active').length * 500).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Refundable $500/vehicle</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  {financeView === 'payments' ? 'Payments Ledger' : financeView === 'refunds' ? 'Refunds Ledger' : 'Invoices & Receipts'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Base Revenue</th>
                      <th className="p-4">Platform Fee (15%)</th>
                      <th className="p-4">Vendor Payout (85%)</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bookings.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">TXN-00{idx+1842}</td>
                        <td className="p-4 font-bold text-slate-900">{b.customerName}</td>
                        <td className="p-4 font-bold text-slate-800">${b.totalAmount}</td>
                        <td className="p-4 text-slate-600">${(b.totalAmount * 0.15).toFixed(2)}</td>
                        <td className="p-4 text-emerald-600 font-bold">${(b.totalAmount * 0.85).toFixed(2)}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: REVIEWS ==================== */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Reviews & Ratings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="block font-bold text-slate-900 text-sm">{review.vehicleName}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{review.customerName}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">&ldquo;{review.comment}&rdquo;</p>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-3">{review.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: REPORTS ==================== */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Revenue</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">
                  {Math.round((bookings.filter((booking) => booking.status === 'Completed').length / Math.max(1, bookings.length)) * 100)}%
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">{bookings.filter((booking) => booking.status === 'Pending').length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Revenue Chart</h3>
                <svg viewBox="0 0 420 180" className="w-full h-52">
                  <defs>
                    <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  {monthlyRevenue.map((entry, idx) => {
                    const maxValue = Math.max(...monthlyRevenue.map((m) => m.value), 1);
                    const height = Math.max(8, (entry.value / maxValue) * 110);
                    return (
                      <g key={entry.month}>
                        <rect x={24 + idx * 64} y={135 - height} width="34" height={height} rx="10" fill="url(#reportGrad)" />
                        <text x={41 + idx * 64} y="152" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="700">{entry.month}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Booking Analytics</h3>
                <div className="space-y-3">
                  {bookingStatusBreakdown.map((segment) => (
                    <div key={segment.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{segment.status}</span>
                      <div className="text-right">
                        <span className="block text-sm font-black text-slate-900">{segment.count}</span>
                        <span className="block text-[10px] text-slate-400">{segment.pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Platform Settings</h3>
              <div className="space-y-4">
                {[
                  'Auto-approve bookings under $500',
                  'Email notifications for new reviews',
                  'Maintenance alerts for inactive vehicles',
                ].map((setting) => (
                  <label key={setting} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">{setting}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Demo Data</h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-500">
                Restore the full rental pipeline with 14 sample bookings across all stages — pending, approved, active, completed, and cancelled.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all demo vehicles, bookings, and reviews to defaults?')) {
                    resetData();
                  }
                }}
                disabled={!can('platform:reset')}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset Demo Data
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Operational Notes</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                This section can hold environment toggles, SLA thresholds, payout rules, and maintenance workflows for production use.
              </p>
            </div>
          </div>
        )}
    </DashboardLayout>
    </RoleGuard>
  );
}
