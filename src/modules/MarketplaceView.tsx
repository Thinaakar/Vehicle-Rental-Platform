'use client';

import React, { useState, useMemo } from 'react';
import { usePlatform, Vehicle } from '@/context/PlatformContext';
import SafeImage from '@/components/SafeImage';
import BrandLogo from '@/components/BrandLogo';
import { 
  Car, SlidersHorizontal, Star, MapPin, Heart, Eye, Fuel, Calendar, X, ChevronDown
} from 'lucide-react';

export default function MarketplaceView() {
  const { vehicles, setCurrentRole, addBooking, favoriteVehicleIds, toggleFavoriteVehicle } = usePlatform();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(550);
  const [selectedFuel, setSelectedFuel] = useState<string>('All');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('All');
  const [selectedSeats, setSelectedSeats] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'rating-desc' | 'newest'>('featured');
  const [selectedVehicleForSpecs, setSelectedVehicleForSpecs] = useState<Vehicle | null>(null);

  // Booking Modal State
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Categories list
  const categories = ['All', 'Cars', 'Bikes', 'Luxury Cars', 'SUVs', 'Vans', 'Trucks', 'Electric Vehicles'];
  const fuels = ['All', 'Electric', 'Hybrid', 'Petrol', 'Diesel'];
  const transmissions = ['All', 'Automatic', 'Manual'];
  const seatsOptions = ['All', '1', '2', '4', '5', '7'];

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteVehicle(id);
  };

  // Filtered vehicles memoized
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
      const matchesPrice = v.price <= maxPrice;
      const matchesFuel = selectedFuel === 'All' || v.fuel === selectedFuel;
      const matchesTransmission = selectedTransmission === 'All' || v.transmission === selectedTransmission;
      const matchesSeats = selectedSeats === 'All' || v.seats.toString() === selectedSeats;
      const matchesAvailability = !availableOnly || v.status === 'Available';

      return matchesSearch && matchesCategory && matchesPrice && matchesFuel && matchesTransmission && matchesSeats && matchesAvailability;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return b.rating - a.rating;
    });
  }, [vehicles, searchQuery, selectedCategory, maxPrice, selectedFuel, selectedTransmission, selectedSeats, availableOnly, sortBy]);

  const openBookingModal = (vehicle: Vehicle) => {
    setBookingVehicle(vehicle);
    setStartDate(new Date().toISOString().split('T')[0]);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleConfirmBooking = () => {
    if (bookingVehicle && startDate && endDate) {
      addBooking(bookingVehicle.id, startDate, endDate);
      setBookingVehicle(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(550);
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setSelectedSeats('All');
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 pb-28">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentRole('public')}
            className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <Car className="w-6 h-6 stroke-[1.5]" />
          </button>
          <div>
            <BrandLogo />
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-1">FLEET MARKETPLACE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Search make, model, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hidden sm:block w-72 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900"
          />
          <button 
            onClick={() => setCurrentRole('public')}
            className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 py-2 px-3 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Main Marketplace Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT STICKY FILTERS SIDEBAR */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-premium h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-extrabold text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest"
            >
              Reset All
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Max Price / Day</span>
                <span className="text-slate-800">${maxPrice}</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="550" 
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
              />
            </div>

            {/* Fuel Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel System</label>
              <select 
                value={selectedFuel} 
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
              >
                {fuels.map((fuel, idx) => (
                  <option key={idx} value={fuel}>{fuel}</option>
                ))}
              </select>
            </div>

            {/* Transmission Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gearbox</label>
              <select 
                value={selectedTransmission} 
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
              >
                {transmissions.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Seats Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seating Capacity</label>
              <select 
                value={selectedSeats} 
                onChange={(e) => setSelectedSeats(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
              >
                {seatsOptions.map((s, idx) => (
                  <option key={idx} value={s}>{s === 'All' ? 'All' : `${s} Seats`}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Available only</span>
            </label>
          </div>
        </aside>

        {/* RIGHT VEHICLE GRID */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing {filteredVehicles.length} of {vehicles.length} Vehicles Available
            </span>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:w-auto w-full">
              <input 
                type="text" 
                placeholder="Search fleet, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:hidden w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900"
              />
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-slate-900 shadow-sm"
                >
                  <option value="featured">Sort by featured</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="rating-desc">Rating high to low</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-slate-200/60 rounded-3xl p-16 text-center shadow-premium flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">No Vehicles Match Your Criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Try resetting filters or searching for another keyword to view other items in our fleet catalog.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((car) => {
                const isFavorite = favoriteVehicleIds.includes(car.id);
                return (
                  <div 
                    key={car.id} 
                    className="bg-white rounded-3xl border border-slate-200/50 overflow-hidden shadow-premium hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Card Header Media */}
                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                      <SafeImage
                        src={car.image}
                        alt={car.name}
                        fallbackLabel={car.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Badge / Overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-white">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                        <span className="text-[10px] font-extrabold">{car.rating}</span>
                      </div>

                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => toggleFavorite(car.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-rose-500 flex items-center justify-center shadow-md transition-all"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 stroke-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Vendor Badge */}
                      <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-white">
                        <span className="text-[9px] font-bold uppercase tracking-wider">{car.vendorName}</span>
                      </div>

                      {/* Vehicle Status Badge */}
                      <div className={`absolute bottom-3 right-3 rounded-lg px-2.5 py-1 text-white text-[9px] font-bold uppercase tracking-wider ${
                        car.status === 'Available' ? 'bg-emerald-600/90' :
                        car.status === 'Active' ? 'bg-primary/90' : 'bg-amber-600/90'
                      }`}>
                        {car.status}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{car.category}</span>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 text-slate-400" /> {car.location}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base mb-3 group-hover:text-primary transition-colors">{car.name}</h4>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-700 font-semibold mb-4">
                          <div className="text-left">
                            <span className="block text-[8px] uppercase font-bold text-slate-400">Transmission</span>
                            <span className="text-[10px] text-slate-800">{car.transmission}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase font-bold text-slate-400">Fuel Type</span>
                            <span className="text-[10px] text-slate-800">{car.fuel}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[8px] uppercase font-bold text-slate-400">Capacity</span>
                            <span className="text-[10px] text-slate-800">{car.seats} Seats</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Daily</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg font-black text-slate-900">${car.price}</span>
                            <span className="text-[10px] text-slate-400">/day</span>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => setSelectedVehicleForSpecs(car)}
                            title="Quick View Specs"
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-600 hover:text-slate-950 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openBookingModal(car)}
                            disabled={car.status !== 'Available'}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                              car.status === 'Available' 
                                ? 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                          >
                            {car.status === 'Available' ? 'Book Now' : 'Rented'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Booking Date Range Modal */}
      {bookingVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-glass w-full max-w-md p-6 overflow-hidden animate-float">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{bookingVehicle.category}</span>
                <h3 className="font-black text-xl text-slate-900 mt-1">Book Reservation</h3>
              </div>
              <button 
                onClick={() => setBookingVehicle(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 mb-5">
              <SafeImage src={bookingVehicle.image} alt={bookingVehicle.name} fallbackLabel={bookingVehicle.name} className="w-20 h-16 object-cover rounded-lg bg-slate-900" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">{bookingVehicle.name}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-black text-slate-900">${bookingVehicle.price}</span>
                  <span className="text-[10px] text-slate-400">/ Day</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none text-slate-900" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Return Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none text-slate-900" 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setBookingVehicle(null)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmBooking}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
              >
                Confirm Rent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Specs View Modal */}
      {selectedVehicleForSpecs && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-glass w-full max-w-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedVehicleForSpecs.category}</span>
                <h3 className="font-black text-2xl text-slate-900 mt-1">{selectedVehicleForSpecs.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedVehicleForSpecs(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="h-64 rounded-2xl bg-slate-900 overflow-hidden shadow-md">
                <SafeImage src={selectedVehicleForSpecs.image} alt={selectedVehicleForSpecs.name} fallbackLabel={selectedVehicleForSpecs.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Vehicle Specifications</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Transmission</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedVehicleForSpecs.transmission}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><Fuel className="w-3 h-3 text-slate-400" /> Fuel System</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedVehicleForSpecs.fuel}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Seating</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedVehicleForSpecs.seats} Passengers</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Host</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">{selectedVehicleForSpecs.vendorName}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Pickup Location</span>
                      <span className="text-xs font-bold text-slate-800">{selectedVehicleForSpecs.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Rental Cost</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">${selectedVehicleForSpecs.price}</span>
                      <span className="text-xs font-semibold text-slate-500">/ Day</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const car = selectedVehicleForSpecs;
                      setSelectedVehicleForSpecs(null);
                      openBookingModal(car);
                    }}
                    disabled={selectedVehicleForSpecs.status !== 'Available'}
                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md ${
                      selectedVehicleForSpecs.status === 'Available'
                        ? 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    {selectedVehicleForSpecs.status === 'Available' ? 'Instant Book' : 'Rented'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
