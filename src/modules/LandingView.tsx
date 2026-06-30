'use client';

import React, { useState } from 'react';
import { usePlatform, Vehicle } from '@/context/PlatformContext';
import SafeImage from '@/components/SafeImage';
import MarketingNav from '@/components/marketing/MarketingNav';
import BrandLogo from '@/components/BrandLogo';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { useMasterData } from '@/context/MasterDataContext';
import { 
  Car, Bike, Truck, Shield, CreditCard, Clock, PhoneCall, 
  Star, MapPin, Calendar, Compass, ArrowRight, Zap, Eye, Mail
} from 'lucide-react';
import Image from 'next/image';
import { FIREBASE_MARKETING_HERO } from '@/data/firebase-assets';

export default function LandingView() {
  const { vehicles, openBooking, updateBookingDraft } = usePlatform();
  const { locationOptions } = useMasterData();
  const [searchLoc, setSearchLoc] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [returnDate, setSearchReturnDate] = useState('');

  // Get featured vehicles (top 3 by rating)
  const featuredVehicles = [...vehicles]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const categories = [
    { name: 'Cars', icon: <Car className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'Cars').length },
    { name: 'Bikes', icon: <Bike className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'Bikes').length },
    { name: 'Luxury Cars', icon: <Compass className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'Luxury Cars').length },
    { name: 'SUVs', icon: <Car className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'SUVs').length },
    { name: 'Vans', icon: <Car className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'Vans').length },
    { name: 'Trucks', icon: <Truck className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'Trucks').length },
    { name: 'Electric Vehicles', icon: <Zap className="w-5 h-5" />, count: vehicles.filter(v => v.category === 'Electric Vehicles').length },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openBooking();
  };

  const openVehicleBooking = (vehicle: Vehicle) => {
    updateBookingDraft({ vehicleId: vehicle.id });
    openBooking();
  };

  return (
    <div id="top" className="min-h-screen overflow-y-auto bg-slate-50 text-slate-900">
      <MarketingNav />

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 overflow-hidden">
        {/* Full-width premium background banner */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={FIREBASE_MARKETING_HERO} 
            alt="Luxury Automotive Banner" 
            fill 
            priority
            className="object-cover object-center brightness-[0.7]" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl text-white mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6">
            <Zap className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>EXOTIC & ENTERPRISE FLEET RENTALS</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Luxury Vehicles. <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">On Demand.</span>
          </h1>
          
          <p className="text-slate-200 text-base md:text-lg font-medium mb-8 leading-relaxed max-w-lg">
            Experience the pinnacle of mobility with our premium fleet management software. Self-drive luxury exotics or command corporate logistics seamlessly.
          </p>
        </div>

        <div className="relative z-10 max-w-2xl mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
            <div className="animate-float rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 text-white shadow-lg">
              <span className="block text-2xl font-black">4.9★</span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-200">Average rating</span>
            </div>
            <div className="animate-float [animation-delay:150ms] rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 text-white shadow-lg">
              <span className="block text-2xl font-black">500+</span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-200">Vehicles listed</span>
            </div>
            <div className="animate-float [animation-delay:300ms] rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 text-white shadow-lg sm:col-span-1 col-span-2">
              <span className="block text-2xl font-black">24/7</span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-200">Concierge support</span>
            </div>
          </div>
        </div>

        {/* Search form inside floating glass panel */}
        <div className="relative z-10 w-full max-w-5xl mt-12">
          <form onSubmit={handleSearchSubmit} className="glass-search-panel p-6 md:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" /> Pickup Location
              </label>
              <PremiumSelect
                value={searchLoc}
                onChange={setSearchLoc}
                options={locationOptions}
                placeholder="Select Location"
                size="lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> Pickup Date
              </label>
              <input 
                type="date" 
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition-colors text-slate-900" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> Return Date
              </label>
              <input 
                type="date" 
                value={returnDate}
                onChange={(e) => setSearchReturnDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition-colors text-slate-900" 
              />
            </div>

            <button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-6 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md group"
            >
              <span>Search Fleet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Simple Flow</p>
          <h2 className="text-3xl font-black text-slate-900">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Search', copy: 'Browse the marketplace, filter by category, and compare fleet options in seconds.', icon: <MapPin className="w-6 h-6" /> },
            { step: '02', title: 'Book', copy: 'Choose your pickup dates, confirm the reservation, and secure your ride instantly.', icon: <Calendar className="w-6 h-6" /> },
            { step: '03', title: 'Drive', copy: 'Pick up the keys, hit the road, and enjoy a premium rental experience end to end.', icon: <Car className="w-6 h-6" /> },
          ].map((item) => (
            <div key={item.step} className="relative bg-white rounded-3xl border border-slate-200/50 shadow-premium p-8 overflow-hidden">
              <div className="absolute top-5 right-5 text-5xl font-black text-slate-100">{item.step}</div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-md">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. VEHICLE CATEGORIES */}
      <section className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Fleet Categories</p>
          <h2 className="text-3xl font-black text-slate-900">Choose Your Class</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat, idx) => (
            <button type="button"
              key={idx}
              onClick={openBooking}
              className="bg-white border border-slate-100 hover:border-slate-300 hover:shadow-premium p-6 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                {cat.icon}
              </div>
              <div className="text-center">
                <span className="block font-bold text-xs text-slate-800 group-hover:text-slate-900">{cat.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{cat.count} Units</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. FEATURED VEHICLES */}
      <section id="vehicles" className="px-6 md:px-16 lg:px-24 py-16 bg-slate-100/60 border-y border-slate-200/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 font-semibold">Handpicked Fleet</p>
              <h2 className="text-3xl font-black text-slate-900">Featured Vehicles</h2>
            </div>
            <button type="button" 
              onClick={openBooking}
              className="flex items-center gap-1.5 self-start text-sm font-bold text-primary transition-colors hover:text-primary-dark md:self-auto"
            >
              <span>Explore Entire Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {featuredVehicles.map((car) => (
              <div 
                key={car.id} 
                className="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col lg:flex-row"
              >
                {/* Vehicle Image */}
                <div className="lg:w-2/5 relative h-64 lg:h-auto min-h-[240px] bg-slate-900">
                  <SafeImage src={car.image} alt={car.name} fallbackLabel={car.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 text-white">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                    <span className="text-xs font-bold">{car.rating}</span>
                  </div>
                </div>

                {/* Vehicle Specs & Details */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">{car.category}</span>
                      <span className="hidden text-slate-300 sm:inline">•</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {car.location}
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-black text-slate-900">{car.name}</h3>

                    <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transmission</span>
                        <span className="text-sm font-bold text-slate-800">{car.transmission}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel Type</span>
                        <span className="text-sm font-bold text-slate-800">{car.fuel}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacity</span>
                        <span className="text-sm font-bold text-slate-800">{car.seats} Seats</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Provider</span>
                        <span className="text-sm font-bold text-slate-800">{car.vendorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Daily Rental</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900">${car.price}</span>
                        <span className="text-sm font-semibold text-slate-500">/ day</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={openBooking}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition-all hover:border-slate-800 hover:bg-slate-50 hover:text-slate-900 sm:flex-none"
                      >
                        <Eye className="h-4 w-4" />
                        Specs
                      </button>
                      <button
                        type="button"
                        onClick={() => openVehicleBooking(car)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg sm:flex-none"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section id="about" className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Excellence Guaranteed</p>
          <h2 className="text-3xl font-black text-slate-900">Why Choose DriveXPro</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-md transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Verified Vehicles</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Each asset passes a rigorous 150-point diagnostics check by certified technicians before departure.</p>
          </div>

          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Secure Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">PCI-compliant encryption handles all deposit and mileage transactions with instant ledger receipts.</p>
          </div>

          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Instant Booking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Zero paperwork required. Real-time fleet sync verifies and approves reservations in under 60 seconds.</p>
          </div>

          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-premium hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">24/7 Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Dedicated concierge specialists and roadside crews standing by globally to support fleet logistics.</p>
          </div>
        </div>
      </section>

      {/* 6. PRICING PLANS */}
      <section id="pricing" className="px-6 md:px-16 lg:px-24 py-20 bg-slate-100/70 border-y border-slate-200/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Flexible Plans</p>
            <h2 className="text-3xl font-black text-slate-900">Pricing Plans</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium p-8">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Basic</span>
              <div className="flex items-end gap-1 mt-3 mb-4">
                <span className="text-4xl font-black text-slate-900">Custom</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Perfect for everyday rentals, short errands, and quick city trips.</p>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li>• Standard vehicles</li>
                <li>• Basic insurance</li>
                <li>• Mobile support</li>
              </ul>
            </div>

            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-premium p-8 text-white relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-light">Premium</span>
              <div className="flex items-end gap-1 mt-3 mb-4">
                <span className="text-4xl font-black">Custom</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">For luxury, performance, and high-touch concierge experiences.</p>
              <ul className="space-y-3 text-sm text-slate-200 font-medium">
                <li>• Luxury and exotic fleet</li>
                <li>• Priority bookings</li>
                <li>• Dedicated concierge</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-premium p-8">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Enterprise</span>
              <div className="flex items-end gap-1 mt-3 mb-4">
                <span className="text-4xl font-black text-slate-900">Custom</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Built for teams that need recurring rentals, fleet controls, and reporting.</p>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li>• Bulk rates</li>
                <li>• Admin controls</li>
                <li>• Invoicing and SLAs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section id="testimonials" className="px-6 md:px-16 lg:px-24 py-20 bg-slate-900 text-white rounded-3xl max-w-7xl mx-auto mb-12 mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Client Testimonials</p>
          <h2 className="text-3xl font-black">Trusted by Modern Operators</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4 text-amber-400">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm italic text-slate-300 leading-relaxed mb-6">&ldquo;Renting the Porsche 911 GT3 RS was a dream. The service felt like a high-end club membership, and the car was in absolute pristine condition.&rdquo;</p>
            </div>
            <div>
              <span className="block text-sm font-bold">Marcus Aurelius</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-accent">Executive Client</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4 text-amber-400">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm italic text-slate-300 leading-relaxed mb-6">&ldquo;The fleet management console has saved our logistical operations tons of hours. We rent trucks for regional freight and track every mile effortlessly.&rdquo;</p>
            </div>
            <div>
              <span className="block text-sm font-bold">Rebecca Vance</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-accent">Logistics Director</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4 text-amber-400">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm italic text-slate-300 leading-relaxed mb-6">&ldquo;Using their Tesla Model S Plaid for our client pickup was exceptional. Completely silent, spotless, and booked instantly from my phone.&rdquo;</p>
            </div>
            <div>
              <span className="block text-sm font-bold">Hiroshi Tanaka</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-accent">Corporate Manager</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto mb-12 max-w-7xl px-6 md:px-16 lg:px-24">
        <div className="grid gap-8 rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Contact</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Talk with our rental specialists</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Enterprise fleet programs, vendor onboarding, and premium customer support available 24/7.
            </p>
            <div className="mt-6 space-y-3 text-sm font-semibold text-slate-700">
              <p className="flex items-center gap-2"><PhoneCall className="h-4 w-4 shrink-0 text-primary" />+1 (800) 555-0199</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-primary" />support@drivexpro.com</p>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />1200 Market Street, San Francisco, CA</p>
            </div>
          </div>
          <form className="grid gap-4">
            <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium" placeholder="Full name" />
            <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium" placeholder="Email address" />
            <textarea className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium" placeholder="How can we help?" />
            <button type="button" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">Send Message</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 md:px-16 lg:px-24 py-12 max-w-7xl mx-auto rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Car className="w-5 h-5 stroke-[1.5]" />
              </div>
              <BrandLogo size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">The luxury car and enterprise vehicle rental SaaS. Delivering premium mobility solutions worldwide.</p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Explore</h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-500">
              <button type="button" onClick={openBooking} className="text-left hover:text-slate-950">Browse Fleet</button>
              <a href="#pricing" className="hover:text-slate-950">Pricing Plans</a>
              <a href="#about" className="hover:text-slate-950">About Us</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-semibold">
              <a href="#about" className="hover:text-slate-950">About Us</a>
              <a href="#contact" className="hover:text-slate-950">Contact Support</a>
              <a href="#vehicles" className="hover:text-slate-950">Fleet</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Legal</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-semibold">
              <a href="#" className="hover:text-slate-950">Rental Agreement</a>
              <a href="#" className="hover:text-slate-950">Privacy Policy</a>
              <a href="#" className="hover:text-slate-950">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <span>&copy; 2026 DriveXPro. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">LinkedIn</a>
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
