'use client';

import React, { useMemo, useState } from 'react';
import { usePlatform, Vehicle, Booking } from '@/context/PlatformContext';
import { useAuth } from '@/context/AuthContext';
import SafeImage from '@/components/SafeImage';
import DashboardLayout from '@/components/shell/DashboardLayout';
import { VENDOR_NAV, VENDOR_TITLES } from '@/data/dashboard-nav';
import RoleGuard from '@/components/auth/RoleGuard';
import { BookingPipelineActions, BookingStatusBadge } from '@/components/booking/BookingPipelineActions';
import { 
  BarChart3, Car, Calendar, DollarSign, Star, Settings, Plus, 
  MapPin, CheckCircle2, XCircle, Trash2, X, Sparkles, Bell
} from 'lucide-react';

export default function VendorView() {
  const { vehicles, bookings, reviews, addVehicle, deleteVehicle, updateBookingStatus, updateVehicleStatus, openMarketing } = usePlatform();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fleet' | 'bookings' | 'calendar' | 'earnings' | 'reviews'>('dashboard');

  const vendorId = user?.vendorId ?? 'vendor-1';

  // Add Vehicle Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Vehicle['category']>('Cars');
  const [newPrice, setNewPrice] = useState(120);
  const [newImage, setNewImage] = useState('');
  const [newLocation, setNewLocation] = useState('Los Angeles, CA');
  const [newTransmission, setNewTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [newFuel, setNewFuel] = useState<'Electric' | 'Hybrid' | 'Petrol' | 'Diesel'>('Petrol');
  const [newSeats, setNewSeats] = useState(5);

  const isVendorVehicle = (v: Vehicle) => v.vendorId === vendorId;
  const vendorVehicles = vehicles.filter(isVendorVehicle);
  const vendorVehicleIds = vendorVehicles.map(v => v.id);

  // Filter bookings associated with vendor vehicles
  const vendorBookings = bookings.filter(b => vendorVehicleIds.includes(b.vehicleId));
  const vendorReviews = reviews.filter((review) => vendorVehicleIds.includes(review.vehicleId));

  // Earnings calculation
  const totalEarnings = vendorBookings
    .filter(b => b.status === 'Completed' || b.status === 'Active' || b.status === 'Approved')
    .reduce((sum, b) => sum + (b.totalAmount * 0.85), 0); // 85% vendor payout

  const pendingBookings = vendorBookings.filter(b => b.status === 'Pending');
  const pendingPayoutValue = pendingBookings.reduce((sum, b) => sum + b.totalAmount * 0.85, 0);

  const monthlyPayouts = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, idx) => {
      const monthBookings = vendorBookings.filter((booking) => {
        const bookingMonth = new Date(booking.startDate).getMonth();
        return bookingMonth === idx && (booking.status === 'Completed' || booking.status === 'Active' || booking.status === 'Approved');
      });
      const revenue = monthBookings.reduce((sum, booking) => sum + booking.totalAmount * 0.85, 0);
      return { month, revenue, bookings: monthBookings.length };
    });
  }, [vendorBookings]);

  const currentMonth = useMemo(() => new Date(), []);
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const monthDays = Array.from({ length: monthEnd.getDate() }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));

  const bookingsByDay = (date: Date) => {
    const dayKey = date.toISOString().split('T')[0];
    return vendorBookings.filter((booking) => booking.startDate <= dayKey && booking.endDate >= dayKey);
  };

  // Handle vehicle submission
  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newImage) {
      alert('Please fill out all fields, including vehicle name and image URL.');
      return;
    }

    addVehicle({
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      image: newImage,
      location: newLocation,
      transmission: newTransmission,
      fuel: newFuel,
      seats: Number(newSeats),
    });

    // Reset Form
    setNewName('');
    setNewPrice(120);
    setNewImage('');
    setShowAddModal(false);
    setActiveTab('fleet'); // Redirect to fleet tab to see vehicle
  };

  if (!user) return null;

  const navGroups = VENDOR_NAV.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.id === 'fleet') return { ...item, badge: vendorVehicles.length };
      if (item.id === 'bookings') return { ...item, badge: pendingBookings.length || vendorBookings.length };
      return item;
    }),
  }));

  const page = VENDOR_TITLES[activeTab] ?? VENDOR_TITLES.dashboard;

  return (
    <RoleGuard allow="vendor">
    <DashboardLayout
      portalLabel="Vendor Console"
      accentClass="from-primary to-secondary"
      title={page.title}
      subtitle={page.subtitle}
      groups={navGroups}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(id as typeof activeTab)}
      user={user}
      onLogout={() => {
        logout();
        openMarketing();
      }}
      headerActions={
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      }
    >
        {/* ==================== TAB: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Net Earnings (85%)</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">${totalEarnings.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Platform Service Fee (15%) deducted</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">My Vehicles Listed</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">{vendorVehicles.length}</span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {vendorVehicles.filter(v => v.status === 'Available').length} Online / {vendorVehicles.filter(v => v.status === 'Maintenance').length} Maintenance
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Booking Requests</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">{vendorBookings.length}</span>
                <span className="text-[10px] text-amber-500 font-bold block mt-1">{pendingBookings.length} Action Required</span>
              </div>
            </div>

            {/* SVG Earnings History */}
            <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Weekly Payout Flow</h3>
                <span className="text-xs font-bold text-slate-400">Updated Hourly</span>
              </div>

              <div className="w-full h-44 flex items-end">
                <svg viewBox="0 0 500 120" className="w-full h-full">
                  <line x1="0" y1="10" x2="500" y2="10" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Polyline chart points */}
                  <polyline 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    points="0,110 80,95 160,105 240,65 320,40 400,75 500,20" 
                  />

                  {/* Gradient Area below Polyline */}
                  <defs>
                    <linearGradient id="vendorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,110 L80,95 L160,105 L240,65 L320,40 L400,75 L500,20 L500,110 L0,110 Z" fill="url(#vendorGrad)" />

                  <text x="5" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">MON</text>
                  <text x="85" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">TUE</text>
                  <text x="165" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">WED</text>
                  <text x="245" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">THU</text>
                  <text x="325" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">FRI</text>
                  <text x="405" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">SAT</text>
                  <text x="475" y="118" fill="#94A3B8" fontSize="8" fontWeight="bold">SUN</text>
                </svg>
              </div>
            </div>

            {/* Awaiting Approvals Card Panel */}
            {pendingBookings.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-4">Pending Rental Requests</h3>
                
                <div className="flex flex-col gap-4">
                  {pendingBookings.map((b) => (
                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50 gap-4">
                      <div className="flex items-center gap-3">
                        <SafeImage src={b.vehicleImage} alt={b.vehicleName} fallbackLabel={b.vehicleName} className="w-16 h-12 object-cover rounded-xl bg-slate-900 shadow-sm" />
                        <div>
                          <span className="block font-bold text-slate-800 text-sm">{b.vehicleName}</span>
                          <span className="text-xs text-slate-500 font-semibold">{b.startDate} to {b.endDate}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">Client: {b.customerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Client Pays</span>
                          <span className="text-base font-black text-slate-900">${b.totalAmount}</span>
                        </div>

                        <div className="flex gap-2">
                          <BookingPipelineActions booking={b} onUpdateStatus={updateBookingStatus} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: MY FLEET ==================== */}
        {activeTab === 'fleet' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Active Fleet Catalog</h3>
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
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {vendorVehicles.map((car) => (
                      <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <SafeImage src={car.image} alt={car.name} fallbackLabel={car.name} className="w-12 h-9 object-cover rounded bg-slate-900 shadow-sm" />
                          <div>
                            <span className="block font-bold text-slate-900 text-sm">{car.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{car.transmission} | {car.fuel}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-bold">{car.category}</td>
                        <td className="p-4 font-bold text-slate-900">${car.price}/day</td>
                        <td className="p-4 text-slate-400">{car.location}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                              className="text-rose-600 hover:text-white hover:bg-rose-605 border border-rose-100 hover:border-transparent rounded-lg p-1.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: BOOKINGS ==================== */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Bookings and Payout history</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Rental ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Rental Duration</th>
                    <th className="p-4">My Earnings (85%)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vendorBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{b.id}</td>
                      <td className="p-4 font-bold text-slate-900">{b.customerName}</td>
                      <td className="p-4 font-bold text-slate-800">{b.vehicleName}</td>
                      <td className="p-4 text-slate-700">{b.startDate} to {b.endDate}</td>
                      <td className="p-4 font-bold text-slate-900">${(b.totalAmount * 0.85).toFixed(2)}</td>
                      <td className="p-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="p-4 text-right">
                        <BookingPipelineActions booking={b} onUpdateStatus={updateBookingStatus} />
                      </td>
                    </tr>
                  ))}
                  {vendorBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-sm font-medium text-slate-400">
                        No bookings for your fleet yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: CALENDAR ==================== */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Availability Calendar</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Booked days by vehicle for the current month.</p>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
                <div key={`pad-${idx}`} className="h-24 rounded-2xl border border-dashed border-slate-100 bg-slate-50/40"></div>
              ))}
              {monthDays.map((date) => {
                const booked = bookingsByDay(date);
                return (
                  <div key={date.toISOString()} className="h-24 rounded-2xl border border-slate-200/60 bg-slate-50 p-2 overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500">{date.getDate()}</span>
                    <div className="mt-2 flex flex-col gap-1">
                      {booked.slice(0, 2).map((booking) => (
                        <span key={booking.id} className="text-[9px] font-bold rounded-lg px-2 py-1 bg-sky-50 text-sky-700 truncate">
                          {booking.vehicleName}
                        </span>
                      ))}
                      {booked.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400">+{booked.length - 2} more</span>
                      )}
                      {booked.length === 0 && (
                        <span className="text-[9px] font-semibold text-slate-300">Open</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB: EARNINGS ==================== */}
        {activeTab === 'earnings' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Payouts</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">${totalEarnings.toLocaleString()}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Payouts</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">${pendingPayoutValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Booking Value</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">
                  ${vendorBookings.length > 0 ? Math.round(vendorBookings.reduce((sum, booking) => sum + booking.totalAmount, 0) / vendorBookings.length).toLocaleString() : 0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Monthly Payout Table</h3>
                <span className="text-xs font-bold text-slate-400 uppercase">85% Vendor Share</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Month</th>
                      <th className="p-4">Bookings</th>
                      <th className="p-4">Gross Revenue</th>
                      <th className="p-4">Vendor Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {monthlyPayouts.filter((month) => month.revenue > 0).map((month) => (
                      <tr key={month.month} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{month.month}</td>
                        <td className="p-4 text-slate-600">{month.bookings}</td>
                        <td className="p-4 font-bold text-slate-900">${month.revenue.toLocaleString()}</td>
                        <td className="p-4 font-bold text-emerald-600">${month.revenue.toLocaleString()}</td>
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
          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Customer Reviews</h3>
            <div className="flex flex-col gap-4">
              {vendorReviews.map((rev) => (
                <div key={rev.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{rev.customerName}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{rev.vehicleName}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">&ldquo;{rev.comment}&rdquo;</p>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-3">{rev.date}</span>
                </div>
              ))}
              {vendorReviews.length === 0 && (
                <div className="text-center py-12">
                  <Star className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <h4 className="font-bold text-slate-800">No vehicle reviews yet</h4>
                  <p className="text-xs text-slate-400 mt-1">Reviews for this vendor&apos;s fleet will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ADD VEHICLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-glass w-full max-w-lg p-6 overflow-hidden animate-float">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">List Asset</span>
                <h3 className="font-black text-2xl text-slate-900 mt-1">List New Vehicle</h3>
              </div>
              <button type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Porsche Cayenne Turbo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Vehicle['category'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
                  >
                    <option value="Cars">Cars</option>
                    <option value="Bikes">Bikes</option>
                    <option value="Luxury Cars">Luxury Cars</option>
                    <option value="SUVs">SUVs</option>
                    <option value="Vans">Vans</option>
                    <option value="Trucks">Trucks</option>
                    <option value="Electric Vehicles">Electric Vehicles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily Rate ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="10"
                    placeholder="120"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</label>
                  <select 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
                  >
                    <option value="Los Angeles, CA">Los Angeles, CA</option>
                    <option value="Miami, FL">Miami, FL</option>
                    <option value="Beverly Hills, CA">Beverly Hills, CA</option>
                    <option value="San Francisco, CA">San Francisco, CA</option>
                    <option value="New York, NY">New York, NY</option>
                    <option value="Seattle, WA">Seattle, WA</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vehicle Image URL</label>
                <input 
                  type="text" 
                  required 
                  placeholder="https://images.unsplash.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900" 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transmission</label>
                  <select 
                    value={newTransmission}
                    onChange={(e) => setNewTransmission(e.target.value as Vehicle['transmission'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase focus:outline-none text-slate-900"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fuel Type</label>
                  <select 
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as Vehicle['fuel'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase focus:outline-none text-slate-900"
                  >
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Seats</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none text-slate-900" 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
    </RoleGuard>
  );
}
