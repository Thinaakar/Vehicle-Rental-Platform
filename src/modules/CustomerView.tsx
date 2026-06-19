'use client';

import React, { useState } from 'react';
import { usePlatform, Booking } from '@/context/PlatformContext';
import { useAuth } from '@/context/AuthContext';
import SafeImage from '@/components/SafeImage';
import DashboardLayout from '@/components/shell/DashboardLayout';
import { CUSTOMER_NAV, CUSTOMER_TITLES } from '@/data/dashboard-nav';
import RoleGuard from '@/components/auth/RoleGuard';
import { BookingStatusBadge } from '@/components/booking/BookingPipelineActions';
import { 
  BarChart3, Car, Calendar, DollarSign, Star, Settings, 
  MapPin, Clock, ArrowRight, ShieldCheck, Heart, User, CheckCircle2, MessageSquare, X, Bookmark, BadgeCheck
} from 'lucide-react';

export default function CustomerView() {
  const { bookings, reviews, vehicles, favoriteVehicleIds, addReview, openBooking, openMarketing } = usePlatform();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active-rentals' | 'bookings' | 'payments' | 'saved' | 'reviews' | 'profile'>('dashboard');

  const customerId = user?.id ?? 'user-customer';

  const [reviewVehicleId, setReviewVehicleId] = useState<string | null>(null);
  const [reviewVehicleName, setReviewVehicleName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isCustomerBooking = (b: Booking) => b.customerId === customerId;

  const customerBookings = bookings.filter(isCustomerBooking);
  const activeRentals = customerBookings.filter(b => b.status === 'Active');
  const upcomingBookings = customerBookings.filter(b => b.status === 'Approved' || b.status === 'Pending');
  const completedHistory = customerBookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');
  const savedVehicles = vehicles.filter((v) => favoriteVehicleIds.includes(v.id));
  const myReviews = reviews.filter((review) => review.customerId === customerId);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewVehicleId && reviewComment) {
      addReview(reviewVehicleId, reviewRating, reviewComment);
      setReviewVehicleId(null);
      setReviewComment('');
      alert('Thank you! Your rating has been recorded.');
    }
  };

  if (!user) return null;

  const navGroups = CUSTOMER_NAV.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.id === 'active-rentals') return { ...item, badge: activeRentals.length };
      if (item.id === 'bookings') return { ...item, badge: customerBookings.length };
      if (item.id === 'saved') return { ...item, badge: savedVehicles.length };
      return item;
    }),
  }));

  const page = CUSTOMER_TITLES[activeTab] ?? CUSTOMER_TITLES.dashboard;

  return (
    <RoleGuard allow="customer">
    <DashboardLayout
      portalLabel="Customer Portal"
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
          onClick={openBooking}
          className="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          Rent Now
        </button>
      }
    >
        {/* ==================== TAB: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Dispatches</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">{activeRentals.length}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Self-drive keys allocated</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Bookings</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">{upcomingBookings.length}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Confirmed reservations pending pickup</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-premium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
                <span className="block text-3xl font-black text-slate-900 mt-1">
                  ${customerBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Tax and services invoices included</span>
              </div>
            </div>

            {/* Active Rentals Panel */}
            {activeRentals.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-4">Current Active Rentals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeRentals.map((r) => (
                    <div key={r.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50 flex gap-4">
                      <SafeImage src={r.vehicleImage} alt={r.vehicleName} fallbackLabel={r.vehicleName} className="w-24 h-18 object-cover rounded-xl bg-slate-900 shadow-sm" />
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Live Rental</span>
                          <h4 className="font-bold text-sm text-slate-800 mt-0.5">{r.vehicleName}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Key ID: {r.id}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200/40 pt-3 mt-3">
                          <span className="text-[10px] text-slate-500 font-semibold">Return: {r.endDate}</span>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Insured
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/50 p-8 text-center shadow-premium flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800">No Active Rentals</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">You do not have any vehicles dispatched right now. Search the catalog to rent a premium car.</p>
                <button 
                  onClick={openBooking}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Browse Cars
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: ACTIVE RENTALS ==================== */}
        {activeTab === 'active-rentals' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Active Rentals</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Rental ID</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Return Date</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeRentals.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">{b.id}</td>
                      <td className="p-4 flex items-center gap-2">
                        <SafeImage src={b.vehicleImage} alt={b.vehicleName} fallbackLabel={b.vehicleName} className="w-8 h-6 object-cover rounded bg-slate-900" />
                        <span className="font-bold text-slate-800">{b.vehicleName}</span>
                      </td>
                      <td className="p-4 text-slate-700">{b.endDate}</td>
                      <td className="p-4 font-bold text-slate-900">${b.totalAmount}</td>
                      <td className="p-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                  {activeRentals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm font-medium text-slate-400">
                        No active rentals. Book a vehicle to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: RENTALS & BOOKINGS ==================== */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-6">
            
            {/* Upcoming Section */}
            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Schedules & Reservations</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Reservation ID</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Dates Scheduled</th>
                      <th className="p-4">Total Price</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {upcomingBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{b.id}</td>
                        <td className="p-4 flex items-center gap-2">
                          <SafeImage src={b.vehicleImage} alt={b.vehicleName} fallbackLabel={b.vehicleName} className="w-8 h-6 object-cover rounded bg-slate-900" />
                          <span className="font-bold text-slate-850">{b.vehicleName}</span>
                        </td>
                        <td className="p-4 text-slate-700">{b.startDate} to {b.endDate}</td>
                        <td className="p-4 font-bold text-slate-900">${b.totalAmount}</td>
                        <td className="p-4">
                          <BookingStatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                    {upcomingBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-sm font-medium text-slate-400">
                          No upcoming reservations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Returns Section */}
            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Past Rental History</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4">Rental ID</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Dates Rented</th>
                      <th className="p-4">Total Paid</th>
                      <th className="p-4">Review Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {completedHistory.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{b.id}</td>
                        <td className="p-4 flex items-center gap-2">
                          <SafeImage src={b.vehicleImage} alt={b.vehicleName} fallbackLabel={b.vehicleName} className="w-8 h-6 object-cover rounded bg-slate-900" />
                          <span className="font-bold text-slate-800">{b.vehicleName}</span>
                        </td>
                        <td className="p-4 text-slate-700">{b.startDate} to {b.endDate}</td>
                        <td className="p-4 font-bold text-slate-900">${b.totalAmount}</td>
                        <td className="p-4">
                          {b.status === 'Completed' ? (
                            <button 
                              onClick={() => {
                                setReviewVehicleId(b.vehicleId);
                                setReviewVehicleName(b.vehicleName);
                              }}
                              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Rate Rental
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: PAYMENTS ==================== */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Invoices & Receipts</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Receipt ID</th>
                    <th className="p-4">Vehicle rented</th>
                    <th className="p-4">Total Charge</th>
                    <th className="p-4">Charged Card</th>
                    <th className="p-4">Billing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {customerBookings.filter(b => b.status !== 'Cancelled').map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">REC-90{idx+7231}</td>
                      <td className="p-4 font-bold text-slate-900">{b.vehicleName}</td>
                      <td className="p-4 font-bold text-slate-800">${b.totalAmount}</td>
                      <td className="p-4 text-slate-600">Visa ending in •••• 9842</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: SAVED VEHICLES ==================== */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedVehicles.length > 0 ? savedVehicles.map((car) => (
              <div key={car.id} className="bg-white rounded-3xl border border-slate-200/50 overflow-hidden shadow-premium">
                <div className="relative h-44 bg-slate-900">
                  <SafeImage src={car.image} alt={car.name} fallbackLabel={car.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-white">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{car.vendorName}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{car.category}</span>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900"
                    >
                      Review
                    </button>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{car.name}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{car.location}</span>
                    <span className="font-bold text-slate-900">${car.price}/day</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-3xl border border-slate-200/50 p-8 shadow-premium">
                <div className="flex items-center gap-3 mb-2">
                  <Bookmark className="w-5 h-5 text-slate-400" />
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">No Saved Vehicles</h3>
                </div>
                <p className="text-xs text-slate-500">Save vehicles from the marketplace to see them here.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: REVIEWS ==================== */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Your Submitted Reviews</h3>
            <div className="flex flex-col gap-4">
              {myReviews.length > 0 ? myReviews.map((review) => (
                <div key={review.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{review.vehicleName}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">&ldquo;{review.comment}&rdquo;</p>
                </div>
              )) : (
                <div className="text-center py-12">
                  <BadgeCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <h4 className="font-bold text-slate-800">No reviews yet</h4>
                  <p className="text-xs text-slate-400 mt-1">Completed rentals can be rated from your rentals tab.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-premium max-w-3xl">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Profile Details</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input defaultValue="Marcus Aurelius" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input defaultValue="marcus@monsterx.test" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Driver License</label>
                <input defaultValue="DL-9842-AX" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary Card</label>
                <input defaultValue="Visa ending 9842" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button type="button" className="bg-slate-900 text-white rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider">Save Profile</button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo form only</span>
              </div>
            </form>
          </div>
        )}

      {/* LEAVE REVIEW DIALOG */}
      {reviewVehicleId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-glass w-full max-w-md p-6 overflow-hidden animate-float">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Feedback</span>
                <h3 className="font-black text-xl text-slate-900 mt-1">Review Experience</h3>
              </div>
              <button type="button" 
                onClick={() => setReviewVehicleId(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">Please rate your experience with <span className="font-bold text-slate-800">{reviewVehicleName}</span>.</p>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rating Stars</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-1 hover:scale-110 transition-transform ${star <= reviewRating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Comments</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Tell us what you liked or how the host can improve..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setReviewVehicleId(null)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
                >
                  Post Review
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
